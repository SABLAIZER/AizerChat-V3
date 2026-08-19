const video = document.querySelector("video");

const captureBtn = document.querySelector(".captureBtn");

const closeBtn = document.getElementById("closeCamera");

const switchBtn = document.getElementById("switchCamera");

let stream;

let facingMode = "user";

let currentFilter = "none";

// START CAMERA

async function startCamera(){

if(stream){

stream.getTracks().forEach(track=>track.stop());

}

stream = await navigator.mediaDevices.getUserMedia({

video:{
facingMode:facingMode
},

audio:false

});

video.srcObject = stream;
video.style.display = "block"; // FIX 1: Show video again when restarting
video.play();

}

// SWITCH CAMERA

switchBtn.onclick=function(){

facingMode =
facingMode==="user"
? "environment"
: "user";

startCamera();

};

// FILTERS

const filterButtons =
document.querySelectorAll(".filters button");

const filterList=[

"none",

"brightness(1.3)",

"grayscale(1)",

"sepia(1)",

"saturate(2)",

"hue-rotate(330deg)"

];

filterButtons.forEach((btn,index)=>{

btn.onclick=function(){

currentFilter = filterList[index];

video.style.filter=currentFilter;

};

});

// CAPTURE

captureBtn.onclick=function(){

let canvas=document.createElement("canvas");

canvas.width=video.videoWidth;

canvas.height=video.videoHeight;

let ctx=canvas.getContext("2d");

// apply filter to captured image

ctx.filter=currentFilter;

ctx.drawImage(

video,

0,

0,

canvas.width,

canvas.height

);

let image=canvas.toDataURL("image/png");

// FIX 2: STOP CAMERA SO IT DOESN'T SPLIT
stream.getTracks().forEach(track=>track.stop());

// FIX 3: HIDE LIVE VIDEO
video.style.display = "none";

showPreview(image);

};

// PREVIEW

function showPreview(image){

let preview=document.createElement("img");

preview.src=image;

preview.className="previewImage";

// FIX 4: Add a retake button so user can go back
let retakeBtn = document.createElement("button");
retakeBtn.innerText = "Retake";
retakeBtn.className = "retakeBtn";
retakeBtn.onclick = () => {
  preview.remove();
  retakeBtn.remove();
  startCamera(); // restart camera
}

let cameraView = document.querySelector(".cameraView");
cameraView.appendChild(preview);
cameraView.appendChild(retakeBtn); // add retake button
}

// CLOSE

closeBtn.onclick=function(){

if(stream){

stream.getTracks().forEach(track=>track.stop());

}

history.back();

};

startCamera();

video.removeAttribute("controls");
video.controls = false;