/* =========================================================
   AIZERCHAT V3
   GLOBAL APP.JS
   Theme + Data/Text Mode
   ========================================================= */


/* =========================================================
   GLOBAL STATE
   ========================================================= */

let isDarkMode = true;

let textMode =
    localStorage.getItem("textMode") === "true";


/* =========================================================
   APPLY DATA / TEXT MODE
   ========================================================= */

function applyAppMode() {

    document.body.classList.remove(
        "dataMode",
        "textMode"
    );


    if (textMode) {

        document.body.classList.add("textMode");

        document.documentElement.style.setProperty(
            "--primary",
            "#25D366"
        );

        document.documentElement.style.setProperty(
            "--primary-dark",
            "#1DA851"
        );

        document.documentElement.style.setProperty(
            "--primary-glow",
            "rgba(37,211,102,.45)"
        );

    } else {

        document.body.classList.add("dataMode");

        document.documentElement.style.setProperty(
            "--primary",
            "#2563EB"
        );

        document.documentElement.style.setProperty(
            "--primary-dark",
            "#1D4ED8"
        );

        document.documentElement.style.setProperty(
            "--primary-glow",
            "rgba(37,99,235,.45)"
        );

    }


    updateModeButtons();
}


/* =========================================================
   UPDATE ALL MODE BUTTONS
   ========================================================= */

function updateModeButtons() {

    const buttons =
        document.querySelectorAll(
            "#mode-pill, .mode-pill"
        );


    buttons.forEach(function(button) {

        const icon =
            button.querySelector(
                "span:first-child"
            );

        const label =
            button.querySelector(
                "span:last-child"
            );


        if (textMode) {

            button.classList.remove("data");
            button.classList.add("text");


            if (icon) {
                icon.textContent = "🟢";
            }


            if (label) {
                label.textContent = "Text";
            }

        } else {

            button.classList.remove("text");
            button.classList.add("data");


            if (icon) {
                icon.textContent = "🔵";
            }


            if (label) {
                label.textContent = "Data";
            }

        }

    });

}


/* =========================================================
   TOGGLE DATA / TEXT MODE
   ========================================================= */

function toggleAppMode() {

    textMode = !textMode;


    localStorage.setItem(
        "textMode",
        textMode
    );


    applyAppMode();
}


/* =========================================================
   SETUP MODE BUTTONS
   ========================================================= */

function setupModeButtons() {

    const buttons =
        document.querySelectorAll(
            "#mode-pill, .mode-pill"
        );


    buttons.forEach(function(button) {

        if (
            button.dataset.modeReady === "true"
        ) {
            return;
        }


        button.dataset.modeReady = "true";


        button.addEventListener(
            "click",
            toggleAppMode
        );

    });

}


/* =========================================================
   THEME
   ========================================================= */

function applyTheme() {

    const savedTheme =
        localStorage.getItem("theme");


    isDarkMode =
        savedTheme !== "false";


    document.body.classList.toggle(
        "light-mode",
        !isDarkMode
    );


    updateThemeButtons();
}


/* =========================================================
   UPDATE THEME BUTTONS
   ========================================================= */

function updateThemeButtons() {

    const buttons =
        document.querySelectorAll(
            "#themeBtn, .themeBtn"
        );


    buttons.forEach(function(button) {

        button.textContent =
            isDarkMode
            ? "🌙"
            : "☀️";

    });

}


/* =========================================================
   TOGGLE THEME
   ========================================================= */

function toggleTheme() {

    isDarkMode = !isDarkMode;


    localStorage.setItem(
        "theme",
        isDarkMode
    );


    document.body.classList.toggle(
        "light-mode",
        !isDarkMode
    );


    updateThemeButtons();


    /*
       Re-apply Data/Text mode after
       theme changes so the correct
       blue/green accent remains active.
    */

    applyAppMode();
}


/* =========================================================
   SETUP THEME BUTTONS
   ========================================================= */

function setupThemeButtons() {

    const buttons =
        document.querySelectorAll(
            "#themeBtn, .themeBtn"
        );


    buttons.forEach(function(button) {

        if (
            button.dataset.themeReady === "true"
        ) {
            return;
        }


        button.dataset.themeReady = "true";


        button.addEventListener(
            "click",
            toggleTheme
        );

    });

}


/* =========================================================
   GLOBAL APP INITIALIZATION
   ========================================================= */

function initializeApp() {

    /*
       Theme first
    */

    applyTheme();


    /*
       Then Data/Text mode
    */

    applyAppMode();


    /*
       Setup global controls
    */

    setupThemeButtons();

    setupModeButtons();

}


/* =========================================================
   START APP
   ========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeApp
    );

} else {

    initializeApp();

}