const video = document.querySelector("video");
const captureBtn = document.querySelector(".captureBtn");
const closeBtn = document.getElementById("closeCamera");
const switchBtn = document.getElementById("switchCamera");

let stream;
let facingMode = "user";
let currentFilter = "none";

// START CAMERA
async function startCamera(){
  try {
    if(stream){
      stream.getTracks().forEach(track=>track.stop());
    }

    stream = await navigator.mediaDevices.getUserMedia({
      video:{ facingMode:facingMode },
      audio:false
    });

    video.srcObject = stream;
    video.style.display = "block";
    video.setAttribute('playsinline', ''); // FIX 1: for iPhone
    video.setAttribute('muted', ''); // FIX 2: for iPhone autoplay
    await video.play();

  } catch(err) {
    alert("Camera Error: " + err.name + ". Please allow camera permission in Safari settings");
    console.log(err);
  }
}

// SWITCH CAMERA
switchBtn.onclick=function(){
  facingMode = facingMode==="user"? "environment" : "user";
  startCamera();
};

// FILTERS
const filterButtons = document.querySelectorAll(".filters button");

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
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = filterList[index];
    video.style.filter=currentFilter;
  };
});
if(filterButtons[0]) filterButtons[0].classList.add('active');

// CAPTURE
captureBtn.onclick=function(){
  let canvas=document.createElement("canvas");
  canvas.width=video.videoWidth;
  canvas.height=video.videoHeight;
  let ctx=canvas.getContext("2d");
  ctx.filter=currentFilter;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  let image=canvas.toDataURL("image/png");

  if(stream){
    stream.getTracks().forEach(track=>track.stop());
  }
  video.style.display = "none";
  showPreview(image);
};

// PREVIEW
function showPreview(image){
  let preview=document.createElement("img");
  preview.src=image;
  preview.className="previewImage";

  let retakeBtn = document.createElement("button");
  retakeBtn.innerText = "Retake";
  retakeBtn.className = "retakeBtn";
  retakeBtn.onclick = () => {
    preview.remove();
    retakeBtn.remove();
    startCamera();
  }

  let cameraView = document.querySelector(".cameraView");
  cameraView.appendChild(preview);
  cameraView.appendChild(retakeBtn);
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