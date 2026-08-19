// ==========================
// AIZERCHAT PROFILE
// ==========================

const profileName =
    document.querySelector(".profileHeader h2");

const savedName =
    localStorage.getItem("profileName") ||
    localStorage.getItem("aizerUserName");


// SHOW USER NAME

if (profileName && savedName) {

    profileName.textContent = savedName;

}


// ==========================
// LOGOUT
// ==========================

const logoutBtn =
    document.getElementById("logoutBtn");


if (logoutBtn) {

    logoutBtn.onclick = function () {

        const confirmLogout =
            confirm("Are you sure you want to log out?");

        if (!confirmLogout) return;


        localStorage.removeItem(
            "aizerLoggedIn"
        );


        location.href = "login.html";

    };

}