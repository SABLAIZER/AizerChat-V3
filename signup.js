// ==========================
// AIZERCHAT SIGN UP
// ==========================

const nameInput = document.getElementById("fullName");
const emailInput = document.getElementById("signupEmail");
const passwordInput = document.getElementById("signupPassword");
const confirmInput = document.getElementById("confirmPassword");
const createBtn = document.getElementById("createBtn");


// CREATE ACCOUNT

createBtn.onclick = function () {

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const confirm = confirmInput.value;


    // CHECK NAME

    if (!name) {

        alert("Please enter your name.");

        nameInput.focus();

        return;
    }


    // CHECK EMAIL

    if (!email) {

        alert("Please enter your email address.");

        emailInput.focus();

        return;
    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(email)) {

        alert("Please enter a valid email address.");

        emailInput.focus();

        return;
    }


    // CHECK PASSWORD

    if (password.length < 6) {

        alert(
            "Password must be at least 6 characters."
        );

        passwordInput.focus();

        return;
    }


    // CONFIRM PASSWORD

    if (password !== confirm) {

        alert("Passwords do not match.");

        confirmInput.focus();

        return;
    }


    // CHECK IF ACCOUNT ALREADY EXISTS

    const existingEmail =
        localStorage.getItem("aizerUserEmail");


    if (existingEmail === email) {

        alert(
            "An account with this email already exists. Please login."
        );

        location.href = "login.html";

        return;
    }


    // SAVE USER

    localStorage.setItem(
        "aizerUserName",
        name
    );

    localStorage.setItem(
        "aizerUserEmail",
        email
    );


    // LOGIN STATE

    localStorage.setItem(
        "aizerLoggedIn",
        "true"
    );


    // SAVE PROFILE NAME

    localStorage.setItem(
        "profileName",
        name
    );


    alert(
        "Account created successfully 🎉"
    );


    // GO TO HOME

    location.href = "home.html";

};