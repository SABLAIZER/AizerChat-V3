// =========================================================
// AizerChat V3
// HOME.JS
// Chat List + Search + Filters + Contacts
// =========================================================


// =========================================================
// DEFAULT CHATS
// =========================================================

const homeDefaultChats = [

    {
        name: "AizerChat",
        message: "Hey there 👋 welcome to AizerChat.",
        time: "08:00",
        unread: 1,
        favorite: true,
        group: false,
        image: "https://i.pravatar.cc/150?img=11"
    },

    {
        name: "Ama",
        message: "Voice message 🎤",
        time: "Yesterday",
        unread: 0,
        favorite: false,
        group: false,
        image: "https://i.pravatar.cc/150?img=12"
    },

    {
        name: "Kojo",
        message: "Photo 📷",
        time: "Monday",
        unread: 1,
        favorite: true,
        group: false,
        image: "https://i.pravatar.cc/150?img=13"
    }

];


// =========================================================
// HOME STATE
// =========================================================

let homeChats = [];

let homeCurrentFilter = "All";


// =========================================================
// LOAD CONTACTS
// =========================================================

function getSavedContacts() {

    try {

        const contacts =
            JSON.parse(
                localStorage.getItem("contacts")
            );

        return Array.isArray(contacts)
            ? contacts
            : [];

    } catch (error) {

        console.error(
            "Could not load contacts:",
            error
        );

        return [];

    }

}


// =========================================================
// BUILD CHAT LIST
// =========================================================

function buildHomeChats() {

    const savedContacts =
        getSavedContacts();


    homeChats = [
        ...homeDefaultChats,
        ...savedContacts
    ];


    // Remove duplicate names
    const uniqueChats = [];


    homeChats.forEach(function(chat) {

        if (!chat || !chat.name) {
            return;
        }


        const alreadyExists =
            uniqueChats.some(function(existing) {

                return (
                    existing.name.toLowerCase() ===
                    String(chat.name).toLowerCase()
                );

            });


        if (!alreadyExists) {

            uniqueChats.push(chat);

        }

    });


    homeChats = uniqueChats;

}


// =========================================================
// SAFE TEXT
// =========================================================

function safeText(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =========================================================
// LOAD CHATS INTO UI
// =========================================================

function loadHomeChats(list = homeChats) {

    const chatList =
        document.getElementById("chatList");


    if (!chatList) {

        console.error(
            "AizerChat: #chatList was not found in home.html"
        );

        return;

    }


    chatList.innerHTML = "";


    // EMPTY
    if (!list || list.length === 0) {

        chatList.innerHTML = `

            <div class="emptyChats">

                <div>💬</div>

                <p>No chats found</p>

            </div>

        `;

        return;

    }


    // CREATE CHAT CARDS
    list.forEach(function(chat) {

        const card =
            document.createElement("div");


        card.className =
            "chatCard";


        card.dataset.chatName =
            chat.name;


        card.innerHTML = `

            <div class="avatar">

                <img
                    src="${safeText(
                        chat.image ||
                        "https://i.pravatar.cc/150?img=1"
                    )}"
                    alt="${safeText(chat.name)}"
                >

                <div class="onlineDot"></div>

            </div>


            <div class="chatInfo">

                <h3>
                    ${safeText(chat.name)}
                </h3>

                <p>
                    ${safeText(chat.message || "")}
                </p>

            </div>


            <div class="chatMeta">

                <span>
                    ${safeText(chat.time || "")}
                </span>

                ${
                    Number(chat.unread) > 0
                    ?

                    `<div class="badge">
                        ${Number(chat.unread)}
                    </div>`

                    :

                    ""
                }

            </div>

        `;


        // OPEN CHAT
        card.addEventListener(
            "click",
            function() {

                openHomeChat(
                    chat.name
                );

            }
        );


        chatList.appendChild(card);

    });

}


// =========================================================
// OPEN CHAT
// =========================================================

function openHomeChat(name) {

    localStorage.setItem(
        "currentChat",
        name
    );


    window.location.href =
        "chat.html";

}


// =========================================================
// FILTER CHATS
// =========================================================

function filterHomeChats(list) {

    if (homeCurrentFilter === "Unread") {

        return list.filter(function(chat) {

            return Number(chat.unread) > 0;

        });

    }


    if (homeCurrentFilter === "Favorites") {

        return list.filter(function(chat) {

            return chat.favorite === true;

        });

    }


    if (homeCurrentFilter === "Groups") {

        return list.filter(function(chat) {

            return chat.group === true;

        });

    }


    return list;

}


// =========================================================
// APPLY FILTER
// =========================================================

function applyHomeFilter() {

    const filtered =
        filterHomeChats(
            [...homeChats]
        );


    loadHomeChats(filtered);

}


// =========================================================
// SETUP TABS
// =========================================================

function setupHomeTabs() {

    const tabs =
        document.querySelectorAll(
            ".tabs button"
        );


    tabs.forEach(function(button) {

        button.addEventListener(
            "click",
            function() {

                tabs.forEach(function(tab) {

                    tab.classList.remove(
                        "active"
                    );

                });


                this.classList.add(
                    "active"
                );


                homeCurrentFilter =
                    this.textContent.trim();


                applyHomeSearch();

            }
        );

    });

}


// =========================================================
// SEARCH + FILTER
// =========================================================

function applyHomeSearch() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const searchValue =
        searchInput
        ? searchInput.value
            .toLowerCase()
            .trim()
        : "";


    let results =
        [...homeChats];


    // SEARCH
    if (searchValue) {

        results =
            results.filter(function(chat) {

                const name =
                    String(
                        chat.name || ""
                    ).toLowerCase();


                const message =
                    String(
                        chat.message || ""
                    ).toLowerCase();


                return (
                    name.includes(searchValue) ||
                    message.includes(searchValue)
                );

            });

    }


    // CURRENT FILTER
    results =
        filterHomeChats(results);


    loadHomeChats(results);

}


// =========================================================
// SETUP SEARCH
// =========================================================

function setupHomeSearch() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (!searchInput) {

        console.warn(
            "AizerChat: #searchInput not found"
        );

        return;

    }


    searchInput.addEventListener(
        "input",
        applyHomeSearch
    );

}


// =========================================================
// SAVE NEW CONTACT
// =========================================================

function saveHomeContact(contact) {

    if (!contact || !contact.name) {

        return false;

    }


    let contacts =
        getSavedContacts();


    const newName =
        String(contact.name).trim();


    if (!newName) {

        return false;

    }


    // Check duplicate
    const exists =
        contacts.some(function(existing) {

            return (
                String(existing.name)
                    .toLowerCase() ===
                newName.toLowerCase()
            );

        });


    if (exists) {

        console.log(
            "Contact already exists"
        );

        return false;

    }


    const newContact = {

        name: newName,

        message:
            contact.message ||
            "New contact 👋",

        time:
            contact.time ||
            "Now",

        unread:
            Number(contact.unread || 0),

        favorite:
            contact.favorite === true,

        group:
            contact.group === true,

        image:
            contact.image ||
            "https://i.pravatar.cc/150?img=1"

    };


    contacts.push(
        newContact
    );


    localStorage.setItem(
        "contacts",
        JSON.stringify(contacts)
    );


    // Rebuild chat list
    buildHomeChats();


    // Immediately show new contact
    applyHomeSearch();


    return true;

}


// =========================================================
// REFRESH CHAT LIST
// =========================================================

function refreshHomeChats() {

    buildHomeChats();

    applyHomeSearch();

}


// =========================================================
// LISTEN FOR CONTACT UPDATES
// =========================================================

window.addEventListener(
    "storage",
    function(event) {

        if (
            event.key === "contacts"
        ) {

            refreshHomeChats();

        }

    }
);


// =========================================================
// HOME INITIALIZATION
// =========================================================

function initializeHome() {

    console.log(
        "AizerChat Home initializing..."
    );


    // Build chat data
    buildHomeChats();


    // Display chats
    loadHomeChats();


    // Filters
    setupHomeTabs();


    // Search
    setupHomeSearch();


    console.log(
        "AizerChat Home ready.",
        homeChats
    );

}


// =========================================================
// START HOME
// =========================================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeHome
    );

} else {

    initializeHome();

}