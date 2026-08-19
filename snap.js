const video = document.querySelector("video");
const captureBtn = document.querySelector(".captureBtn");
const closeBtn = document.getElementById("closeCamera");
const switchBtn = document.getElementById("switchCamera");

let stream;
let facingMode = "user";


// START CAMERA
async function startCamera(){
  if(stream){
    stream.getTracks().forEach(track=>track.stop());
  }
  stream = await navigator.mediaDevices.getUserMedia({
    video:{ facingMode:facingMode },
    audio:false
  });
  video.srcObject = stream;
  video.play();
}

// SWITCH CAMERA
switchBtn.onclick=function(){
  facingMode = facingMode==="user" ? "environment" : "user";
  startCamera();
};


// FILTERS - REMOVED FOR NOW
const filterButtons = document.querySelectorAll(".filters button");
filterButtons.forEach((btn)=>{
  btn.onclick=function(){
    // do nothing for now so it doesn't break
  };
});


// CAPTURE - SIMPLE VERSION THAT WAS WORKING
captureBtn.onclick=function(){
  let canvas=document.createElement("canvas");
  canvas.width=video.videoWidth;
  canvas.height=video.videoHeight;
  let ctx=canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  let image=canvas.toDataURL("image/png");
  showPreview(image);
};


// PREVIEW
function showPreview(image){
  let preview=document.createElement("img");
  preview.src=image;
  preview.className="previewImage";
  document.querySelector(".cameraView").appendChild(preview);
}

// CLOSE
closeBtn.onclick=function(){
  if(stream){ stream.getTracks().forEach(track=>track.stop()); }
  history.back();
};

startCamera();