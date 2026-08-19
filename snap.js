const video = document.querySelector("video");
const captureBtn = document.querySelector(".captureBtn");
const closeBtn = document.getElementById("closeCamera");
const switchBtn = document.getElementById("switchCamera");

let stream;
let facingMode = "user";
let recorder;
let recordedChunks = [];
let pressTimer;
let isRecording = false;

// START CAMERA
async function startCamera(){
  if(stream){ stream.getTracks().forEach(track=>track.stop()); }
  stream = await navigator.mediaDevices.getUserMedia({
    video:{ facingMode:facingMode },
    audio:true // FIX: need audio for video
  });
  video.srcObject = stream;
  video.play();
}

// SWITCH CAMERA
switchBtn.onclick=function(){
  facingMode = facingMode==="user"? "environment" : "user";
  startCamera();
};

// FILTERS - do nothing for now
const filterButtons = document.querySelectorAll(".filters button");
filterButtons.forEach((btn)=>{ btn.onclick=function(){}; });


// ============ TAP VS HOLD LOGIC ============

// START: when finger down
captureBtn.onmousedown = captureBtn.ontouchstart = function(e){
  e.preventDefault();
  pressTimer = setTimeout(startRecording, 300); // 300ms = "hold"
}

// END: when finger up
captureBtn.onmouseup = captureBtn.ontouchend = function(e){
  e.preventDefault();
  clearTimeout(pressTimer);
  if(isRecording){
    stopRecording(); // it was a hold
  } else {
    takePhoto(); // it was a tap
  }
}

// if finger moves away, cancel
captureBtn.onmouseleave = captureBtn.ontouchcancel = function(){
  clearTimeout(pressTimer);
}


// TAKE PHOTO
function takePhoto(){
  let canvas=document.createElement("canvas");
  canvas.width=video.videoWidth;
  canvas.height=video.videoHeight;
  let ctx=canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  let image=canvas.toDataURL("image/png");
  
  if(stream){ stream.getTracks().forEach(track=>track.stop()); }
  video.style.display = "none";
  
  showSendScreen(image, "image");
}


// START RECORDING VIDEO
function startRecording(){
  isRecording = true;
  captureBtn.style.background = "red"; // show recording
  captureBtn.style.transform = "scale(1.2)";
  
  recordedChunks = [];
  recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
  
  recorder.ondataavailable = e => { if(e.data.size > 0) recordedChunks.push(e.data); };
  recorder.onstop = saveVideo;
  
  recorder.start();
  
  // Auto stop after 10s like snap
  setTimeout(() => { if(isRecording) stopRecording(); }, 10000);
}

// STOP RECORDING VIDEO
function stopRecording(){
  isRecording = false;
  captureBtn.style.background = "white";
  captureBtn.style.transform = "scale(1)";
  if(recorder && recorder.state !== "inactive"){
    recorder.stop();
  }
}

// SAVE VIDEO
function saveVideo(){
  let blob = new Blob(recordedChunks, { type: 'video/webm' });
  let videoURL = URL.createObjectURL(blob);
  
  if(stream){ stream.getTracks().forEach(track=>track.stop()); }
  video.style.display = "none";
  
  showSendScreen(videoURL, "video");
}


// SHOW SEND SCREEN
function showSendScreen(media, type){
  let preview;
  if(type === "image"){
    preview=document.createElement("img");
    preview.src=media;
  } else {
    preview=document.createElement("video");
    preview.src=media;
    preview.controls = true;
    preview.autoplay = true;
  }
  preview.className="previewImage";

  // SEND BUTTON
  let sendBtn = document.createElement("button");
  sendBtn.innerText = "Send";
  sendBtn.className = "sendBtn"; // we will style this
  sendBtn.onclick = () => {
    alert("Sending to friends/status..."); // hook this to your send logic later
  }

  // RETAKE BUTTON
  let retakeBtn = document.createElement("button");
  retakeBtn.innerText = "Retake";
  retakeBtn.className = "retakeBtn";
  retakeBtn.onclick = () => {
    preview.remove();
    sendBtn.remove();
    retakeBtn.remove();
    startCamera();
  }

  let cameraView = document.querySelector(".cameraView");
  cameraView.appendChild(preview);
  cameraView.appendChild(sendBtn);
  cameraView.appendChild(retakeBtn);
}


// CLOSE
closeBtn.onclick=function(){
  if(stream){ stream.getTracks().forEach(track=>track.stop()); }
  history.back();
};

startCamera();
video.removeAttribute("controls");