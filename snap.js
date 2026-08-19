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
video.style.display = "block"; // Show video when starting
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
const filterButtons = document.querySelectorAll(".filters button");

// FIX: Use % for canvas. Canvas doesn't understand "1" or "2"
const filterList=[
"none",
"brightness(130%)",
"grayscale(100%)",
"sepia(100%)",
"saturate(200%)",
"hue-rotate(330deg)"
];

filterButtons.forEach((btn,index)=>{
btn.onclick=function(){

  // FIX: Add active ring to selected filter
  filterButtons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  currentFilter = filterList[index];
  video.style.filter=currentFilter;
};
});

// FIX: Set first filter as active by default
filterButtons[0].classList.add('active');

// CAPTURE
captureBtn.onclick=function(){

let canvas=document.createElement("canvas");

canvas.width=video.videoWidth;
canvas.height=video.videoHeight;

let ctx=canvas.getContext("2d");

// apply filter to captured image - this burns it into the photo
ctx.filter=currentFilter;

ctx.drawImage(
video,
0,
0,
canvas.width,
canvas.height
);

let image=canvas.toDataURL("image/png");

// FIX: STOP CAMERA SO IT DOESN'T SPLIT
stream.getTracks().forEach(track=>track.stop());

// FIX: HIDE LIVE VIDEO
video.style.display = "none";

showPreview(image);
};

// PREVIEW
function showPreview(image){

let preview=document.createElement