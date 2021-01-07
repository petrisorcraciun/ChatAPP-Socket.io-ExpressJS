var createAvatar = document.getElementById('personName');
var b = document.querySelector("svg"); 

createAvatar.addEventListener('input', () => {
    b.setAttribute("data-jdenticon-value", "helloButton");
})

var connect = document.getElementById('btnConnect');

connect.addEventListener('click', () => {
    localStorage.setItem("personName"  , document.getElementById('personName').value);
    localStorage.setItem("emailAddress", document.getElementById('emailAddress').value);
    localStorage.setItem("username"    , document.getElementById('username').value);
    localStorage.setItem("token"       , getHash(document.getElementById('username').value));
    window.location.href = "/home";
})


if(localStorage.getItem("personName") != null && localStorage.getItem("username") != null)
{
    window.location.href = "/home";
}



