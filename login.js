// ==========================
// AIZERCHAT LOGIN
// ==========================

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const showPassword =
    document.getElementById("showPassword");

const loginBtn =
    document.getElementById("loginBtn");

const signupBtn =
    document.getElementById("signupBtn");


// ==========================
// SHOW / HIDE PASSWORD
// ==========================

if (showPassword) {

    showPassword.onclick = function () {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            showPassword.textContent = "🙈";

        } else {

            passwordInput.type = "password";

            showPassword.textContent = "👁";

        }

    };

}


// ==========================
// LOGIN
// ==========================

if (loginBtn) {

    loginBtn.onclick = function () {

        const email =
            emailInput.value.trim().toLowerCase();

        const password =
            passwordInput.value;


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

        if (!password) {

            alert("Please enter your password.");

            passwordInput.focus();

            return;

        }


        // GET SAVED ACCOUNT

        const savedEmail =
            localStorage.getItem("aizerUserEmail");

        const savedName =
            localStorage.getItem("aizerUserName");


        // NO ACCOUNT

        if (!savedEmail) {

            alert(
                "No AizerChat account found. Please create an account first."
            );

            location.href = "signup.html";

            return;

        }


        // CHECK EMAIL

        if (email !== savedEmail) {

            alert(
                "That email is not registered."
            );

            emailInput.focus();

            return;

        }


        // LOGIN SUCCESS

        localStorage.setItem(
            "aizerLoggedIn",
            "true"
        );


        localStorage.setItem(
            "profileName",
            savedName
        );


        alert(
            "Welcome back, " +
            (savedName || "AizerChat user") +
            " 👋"
        );


        // GO HOME

        location.href = "home.html";

    };

}


// ==========================
// CREATE ACCOUNT
// ==========================

if (signupBtn) {

    signupBtn.onclick = function () {

        location.href = "signup.html";

    };

}