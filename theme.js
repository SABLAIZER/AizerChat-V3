document.addEventListener("DOMContentLoaded",()=>{

const dark =
localStorage.getItem("theme") !== "false";

document.body.classList.toggle(
"light-mode",
!dark
);

});