// ==========================
// AIZERCHAT CALLS
// ==========================

// Search
const searchInput = document.getElementById("searchCalls");
const cards = document.querySelectorAll(".callCard");

if (searchInput) {
    searchInput.addEventListener("input", function () {

        const value = this.value.toLowerCase();

        cards.forEach(card => {

            const name = card.querySelector("h3").textContent.toLowerCase();

            card.style.display =
                name.includes(value) ? "flex" : "none";

        });

    });
}

// Call Buttons
document.querySelectorAll(".callBtn").forEach(btn => {

    btn.addEventListener("click", function () {

        const name =
            this.parentElement.querySelector("h3").textContent;

        alert("📞 Calling " + name + "...\n\nVoice & Video calling will be added soon.");

    });

});

// Floating New Call
const newCall = document.querySelector(".newCall");

if (newCall) {

    newCall.onclick = function () {

        alert("Choose a contact to start a new call.");

    };

}

// Tabs
const tabs = document.querySelectorAll(".callTabs button");

tabs.forEach(tab => {

    tab.onclick = function () {

        tabs.forEach(t => t.classList.remove("active"));

        this.classList.add("active");

    };

});

document.addEventListener("DOMContentLoaded", () => {

    const isDarkMode =
        localStorage.getItem("theme") !== "false";

    document.body.classList.toggle(
        "light-mode",
        !isDarkMode
    );

});