document.title =  "ChatApp";

var createRoomBtn     = document.getElementById('create-room');
var sPersonName       = document.getElementById('namePerson');
sPersonName.innerHTML = localStorage.getItem("personName");

document.getElementById('personName').value   = localStorage.getItem("personName");
document.getElementById('emailAddress').value = localStorage.getItem("emailAddress");
document.getElementById('username').value     = localStorage.getItem("username");

createRoomBtn.addEventListener('click', () => {
  fetch('/room', {
    method: 'POST',
    headers: { "Content-Type": "application/json"},
    body: JSON.stringify(
    { 
        "roomName"    : document.getElementById('roomName').value,
        "userName"    : localStorage.getItem("username"),
        "personName"  : localStorage.getItem("personName"),
        "nrMaxim"     : document.getElementById('nrMaxim').value,
        "passwordRoom": document.getElementById('passwordRoom').value
    })
  }).then(response => {
    if (response.status === 201) {
      return response.json()
    }
    return Promise.reject('Failed to create room')
  })
  .then(data => {
    if (data.roomPath) {
      return window.location = data.roomPath
    }
    return Promise.reject('No room path')
  })
  .catch(error => {
    console.error(error)
  })
})

if(localStorage.getItem("personName") == null)
{
    window.location.href = "/";
}

var res = JSON.parse(resJSON.replace(/&quot;/g,'"'));
for (var i = 0; i < res.length; i++) {
  addNewRoom(res[i].roomID, res[i].ImageURL, res[i].passwordRoom, res[i].roomName, res[i].createdTime, res[i].HostName)
}

function addNewRoom(roomID, ImageURL, Password, RoomName, CreatedTime, HostName){
        var item              = document.createElement('div');
        item.className        = "card mb-3 ml-2";
        item.style            = "width: 200px";
        var imageCard         = document.createElement('img');
        imageCard.src         = ImageURL;
        imageCard.style       = "height: 130px";
        imageCard.className   = "card-img-top  mb-0 pb-0" ;
        var cardBody          = document.createElement('div');
        cardBody.className    = 'card-body text-center mt-0 py-0';
        var lock              = Password.length > 0 ? "Yes" : "No"
        var titleCard         = document.createElement('h6');
        titleCard.className   = "card-title text-center";
        titleCard.innerHTML   = "<hr class='pb-1 mb-1'> <b class='text-info'> " + RoomName + "</b>";
        titleCard.style       = "height: 20px";
        var textCard          = document.createElement('p');
        textCard.className    = "";
        textCard.innerHTML    = "<hr class='pb-1 mb-1'> <span class='float-left' style='font-size: 13px'> Created: " +  formatDate(CreatedTime) + " </span><br>" 
                              + "<span class='float-left' style='font-size: 13px'> Password:" +  lock + " </span> <br>";
                              
        var a                 = document.createElement('a');
        a.href                = "/room/" + createSlug(roomID);
        var buttonRoom        = document.createElement('button');
        buttonRoom.className  = "btn btn-primary btn-sm mx-auto mb-3 ";
        buttonRoom.innerHTML  = "Access room";

        a.appendChild(buttonRoom);
        item.appendChild(imageCard);
        cardBody.appendChild(titleCard);
        cardBody.appendChild(textCard);
        cardBody.appendChild(a);
        item.appendChild(cardBody);
        listRoom.appendChild(item);
}

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [day, month, year].join('-');
}


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
