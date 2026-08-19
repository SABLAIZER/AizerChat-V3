// ==========================
// AIZERCHAT ADD FRIEND
// ==========================

const nameInput =
    document.getElementById("friendName");

const emailInput =
    document.getElementById("friendEmail");

const addBtn =
    document.getElementById("addFriendBtn");


addBtn.onclick = function(){

    const name =
        nameInput.value.trim();

    const email =
        emailInput.value.trim().toLowerCase();


    // CHECK NAME

    if(!name){

        alert("Please enter your friend's name.");

        nameInput.focus();

        return;

    }


    // CHECK EMAIL

    if(!email){

        alert("Please enter your friend's email.");

        emailInput.focus();

        return;

    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if(!emailPattern.test(email)){

        alert("Please enter a valid email address.");

        emailInput.focus();

        return;

    }


    // GET CONTACTS

    let contacts =
        JSON.parse(
            localStorage.getItem("contacts")
        ) || [];


    // CHECK DUPLICATE

    const alreadyExists =
        contacts.some(
            contact =>
                contact.email === email
        );


    if(alreadyExists){

        alert(
            "This contact has already been added."
        );

        return;

    }


    // CREATE CONTACT

    const newContact = {

        name:name,

        email:email,

        message:"New contact",

        time:"Now",

        unread:0,

        image:
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=25D366&color=fff`

    };


    // SAVE CONTACT

    contacts.push(newContact);


    localStorage.setItem(
        "contacts",
        JSON.stringify(contacts)
    );


    alert(
        name + " added successfully 🎉"
    );


    // RETURN HOME

    location.href = "home.html";

};