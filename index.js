const express       = require('express'),
      app           = express(),
      exhbs         = require('express-handlebars'),
      server        = require('http').createServer(app),
      io            = require('socket.io')(server),
      derange       = require('derange'),
      { v4: uuidV4} = require('uuid'),
      bodyParser    = require('body-parser'),
      mysql = require('mysql'),
      fetch = require('node-fetch'),
      cors = require('cors');

var world = require('./js/server_world');

const LocalStorage  = require('node-localstorage').LocalStorage;
localStorage        = new LocalStorage('./scratch');
app.engine('hbs', exhbs({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.use(express.static('public'));
app.use(cors());
app.use(bodyParser.json());


const rooms = { details: [
      {
        "roomID"      : "camera-deschisa",
        "roomName"    : "Camera deschisa",
        "passwordRoom": "",
        "adminUser"   : "petrisorcraciun",
        'createdTime' : "2020-01-05",
        "nrMaxPers"   : 20,
        "ImageURL"    : "https://images-na.ssl-images-amazon.com/images/I/7192GSmRn8L._SL1354_.jpg"
      },
      {
        "roomID"      : "camera-lui-petrisor",
        "roomName"    : "Camera lui Petrisor",
        "passwordRoom": "",
        "adminUser"   : "petrisorcraciun",
        'createdTime' : "2020-01-05",
        "nrMaxPers"   : 20,
        "ImageURL"    : "https://images-na.ssl-images-amazon.com/images/I/7192GSmRn8L._SL1354_.jpg"
      }
] }
const users = { details: [] }
const blackList = { list : [] }

app.get('/', (req, res) => {
  res.render('firstPage');
});

app.get('/home', (req, res) => {
  var roomList = []
  for (var i = 0; i < rooms.details.length; i++) {
    roomList.push(rooms.details[i].roomName);
  }
  res.render('home', { roomsPage: JSON.stringify(rooms.details)});
});



app.post('/room', (req, res) => {
  const newRoomId  = createSlug(req.body.roomName)  

  rooms.details.push({ 
    "roomID"      : createSlug(req.body.roomName),
    "roomName"    : req.body.roomName,
    "passwordRoom": req.body.passwordRoom,
    "adminUser"   : req.body.userName,
    'createdTime' : new Date(),
    "nrMaxPers"   : 20,
    "ImageURL"    : "https://images-na.ssl-images-amazon.com/images/I/7192GSmRn8L._SL1354_.jpg"
  })

  const fs = require('fs');
  const dir = "./roomFiles/" + createSlug(req.body.roomName);
  try {
      if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
      } 
  } catch (err) {
      console.log(err);
  }
  res.status(201). send({ roomPath: '/room/' + newRoomId })
})


app.get('/room/:room', (req, res) => {
  var responseObject = { list: [] }

  for (var i = 0; i < rooms.details.length; i++) {
    if(rooms.details[i].roomID == req.params.room){
      responseObject.list.push({
          "roomID"       : rooms.details[i].roomID,
          "roomName"     : rooms.details[i].roomName,
          "passwordRoom" : rooms.details[i].passwordRoom,
          "adminUser"    : rooms.details[i].adminUser,
          "createdTime"  : rooms.details[i].createdTime,
          "nrMaxPers"    : rooms.details[i].nrMaxPers,
          "ImageURL"     : rooms.details[i].ImageURL,
      });
    }
  }

  /*
  if(!room) {
    res.render('404');
    return
  }

  */
  res.render('room', { detailRoom: JSON.stringify(responseObject)} );
})



io.on('connection', socket => {

  socket.on('join-room', ({ userName,personName, roomID, userToken, emailAddress, silent }) => {
  
  var blackListArray = [0, "", "", "", 0, "", ""];

  for(var i = 0;i < blackList.list.length;i++)
  {
    if(blackList.list[i].userName == userName && blackList.list[i].roomID == roomID)
    {
        blackListArray[0] = 1;
        blackListArray[1] = blackList.list[i].mTimeStart;
        blackListArray[2] = blackList.list[i].mTime;
        blackListArray[3] = blackList.list[i].reasonMuted;
        blackListArray[4] = blackList.list[i].isBlocked;
        blackListArray[5] = blackList.list[i].reasonBlocked;
        blackListArray[6] = blackList.list[i].timeBlocked;
    }
  }

  console.log(blackListArray);

  users.details.push({
      "roomID"        : roomID,
      "userName"      : userName,
      "personName"    : personName,
      "token"         : userToken || uuidV4(),
      "socketID"      : socket.id,
      "Email"         : emailAddress,
      "isMuted"       : blackListArray[0],
      "mTimeStart"    : blackListArray[1],
      "mTime"         : blackListArray[2],
      "reasonMuted"   : blackListArray[3],
      "ImageURL"      : "https://carlasbeautybox.files.wordpress.com/2013/11/check-in-minion.jpg",
      "isBlocked"     : blackListArray[4],
      "reasonBlocked" : blackListArray[5],
      "timeBlocked"   : blackListArray[6]
  });


  console.log(Object.values(users.details).filter(user => user.roomID === roomID));


  if (!userToken) {
    socket.emit('joined-room', users.details[users.details.length-1].token)
  }

  socket.join(roomID);
  if (!silent) {
    socket.to(roomID).emit('user-connected', personName  + ' joined the room.');
    io.in(roomID).emit('room-update', Object.values(users.details).filter(user => user.roomID === roomID))
  }
})
  



socket.on('chat-message', ({ userId, msg, roomID }) => {
    var senderUsername;
    users.details.forEach((element, index) => {
      if(element.token === userId) {
        senderUsername = element.userName;
      }
    });
    const pkg = { msg, sender: senderUsername }
    socket.to(roomID).broadcast.emit('chat-message', pkg);
})


socket.on('oModalForAllUsers', (roomID) => {
  for (var i = 0; i < users.details.length; i++) {
    io.to(users.details[i].socketID).emit('oModalForAllUsers', '🎁&nbsp;&nbsp;You are secret santa!')
  }
})


socket.on('addMutedUser', (roomID, userName, isMuted, timeStart, period, reason ) => {
  
  var userSocket;
  for (var i = 0; i < users.details.length; i++) {
    if(users.details[i].roomID == roomID && users.details[i].userName == "petrisorcraciun") {
      users.details[i].isMuted    = isMuted;
      users.details[i].mTimeStart = timeStart;
      users.details[i].mTime      = period;
      users.details[i].reasonMuted= reason;
      userSocket = users.details[i].socketID;
    }
  }

  if(isMuted == 1)
    io.to(userSocket).emit('addMutedUser', 'User: ' + userName + " was silenced for a period of " + period + " minutes.")
  else 
  io.to(userSocket).emit('removeMutedUser', 'User: ' + userName + " received unmuted from an admin.")
})


socket.on('userDetails', (userName, roomID, userWhoAsk) => {

  var userSocket;
  for (var i = 0; i < users.details.length; i++) {
    if(users.details[i].roomID == roomID && users.details[i].userName == userWhoAsk) {
      userSocket = users.details[i].socketID;
    }
  }
    io.to(userSocket).emit('userDetailsReturn', Object.values(users.details).filter(user => user.roomID === roomID && user.userName === userName))
})



socket.on('disconnect', (reason) => {
    var disconnectedUser = null;

    users.details.forEach((element, index) => {
      if(element.socketID == socket.id) {
        disconnectedUser = element;
      }
    });


    if (reason === 'transport close') {
      socket.to(disconnectedUser.roomID).emit('user-disconnected', disconnectedUser.userName + ' left the room');
      //delete users[disconnectedUser.socketID]
      users.details.forEach((element, index) => {
        if(element.socketID == socket.id) {
          users.details.splice(index, 1);
        }
      });
      io.in(disconnectedUser.roomID).emit('room-update', Object.values(users).map(({ userName }) => userName ))
    }

})
})


server.listen(3000, () => {
  console.log("URL: http://localhost:3000/");
});


function createSlug(string) {
  return string
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}




