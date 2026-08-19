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


showPreview(image);


};





// PREVIEW

function showPreview(image){


let preview=document.createElement("img");


preview.src=image;


preview.className="previewImage";


document.querySelector(".cameraView")
.appendChild(preview);


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