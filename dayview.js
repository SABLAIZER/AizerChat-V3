const statuses = [

{
name:"Ama",
time:"2m ago",
image:"images/profile.jpg",
text:"Hello 👋"
},

{
name:"Kojo",
time:"5m ago",
image:"images/user.jpg",
text:"Enjoying AizerChat 🔥"
}

];


let index = Number(localStorage.getItem("statusIndex")) || 0;

let progress = 0;

let timer;


// LOAD STATUS

function loadStatus(){

const status = statuses[index];

document.getElementById("dayAvatar").src = status.image;

document.getElementById("dayName").textContent = status.name;

document.getElementById("dayTime").textContent = status.time;

document.getElementById("dayImage").src = status.image;

document.getElementById("dayText").textContent = status.text;


localStorage.setItem("statusIndex", index);


startProgress();

}



// PROGRESS BAR

function startProgress(){

progress = 0;

clearInterval(timer);


timer = setInterval(()=>{

progress++;

document.getElementById("progress").style.width =
progress + "%";


if(progress >= 100){

nextStatus();

}

},50);

}



// NEXT STATUS

function nextStatus(){

if(index < statuses.length - 1){

index++;

loadStatus();

}else{

history.back();

}

}



// PREVIOUS STATUS

function previousStatus(){

if(index > 0){

index--;

loadStatus();

}

}



// TAP CONTROL

document.querySelector(".dayContent").onclick=function(e){

let width = window.innerWidth;


if(e.clientX < width/2){

previousStatus();

}else{

nextStatus();

}

};



// CLOSE BUTTON

document.getElementById("closeDay").onclick=function(){

history.back();

};



// START

loadStatus();


// HOLD TO PAUSE STATUS

let dayView = document.querySelector(".dayView");


dayView.addEventListener("touchstart",()=>{

clearInterval(timer);

});


dayView.addEventListener("touchend",()=>{

startProgress();

});