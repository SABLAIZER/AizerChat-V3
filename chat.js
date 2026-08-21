// =========================================================
// AIZERCHAT V3 — CLEAN COMPLETE CHAT SYSTEM
// Reply + Forward + Edit + Delete + Selection
// Short WhatsApp-style Gestures
// LocalStorage + Images + Files + View Once
// =========================================================

// =========================================================
// CONTACT
// =========================================================
const contactName =
    localStorage.getItem("currentChat") || "Friend Name";
const chatKey =
    "chat_" + contactName;

// =========================================================
// ELEMENTS
// =========================================================
const messages =
    document.getElementById("messages");
const messageInput =
    document.getElementById("messageInput");
const sendBtn =
    document.getElementById("sendBtn");
const backBtn =
    document.getElementById("backBtn");
const contactNameBox =
    document.getElementById("contactName");
const contactStatus =
    document.getElementById("contactStatus");
const contactAvatar =
    document.getElementById("contactAvatar");
const attachBtn =
    document.getElementById("attachBtn");
const attachMenu =
    document.getElementById("attachMenu");
const galleryBtn =
    document.getElementById("galleryBtn");
const galleryInput =
    document.getElementById("galleryInput");
const fileBtn =
    document.getElementById("fileBtn");
const fileInput =
    document.getElementById("fileInput");
const cameraBtn =
    document.getElementById("cameraBtn");
const cameraInput =
    document.getElementById("cameraInput");
const typingIndicator =
    document.getElementById("typingIndicator");

// =========================================================
// CHAT STATE
// =========================================================
let chatHistory =
    JSON.parse(
        localStorage.getItem(chatKey)
    ) || [];
let replyingTo = null;
let forwardingMessage = null;
let selectedMessages =
    new Set();

// =========================================================
// MESSAGE ID
// =========================================================
function createMessageId() {
    return (
        "msg_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );
}

// =========================================================
// GIVE OLD MESSAGES IDS
// =========================================================
chatHistory.forEach(function(msg) {
    if (!msg.id) {
        msg.id =
            createMessageId();
    }
});

// =========================================================
// SAVE CHAT
// =========================================================
function saveChat() {
    localStorage.setItem(
        chatKey,
        JSON.stringify(chatHistory)
    );
}

// Save IDs immediately
saveChat();

// =========================================================
// CONTACT NAME
// =========================================================
if (contactNameBox) {
    contactNameBox.textContent =
        contactName;
}

// =========================================================
// CONTACT INFO
// =========================================================
function loadContactInfo() {
    const savedContacts =
        JSON.parse(
            localStorage.getItem("contacts")
        ) || [];
    const contact =
        savedContacts.find(function(item) {
            return item.name === contactName;
        });
    if (!contact) return;
    if (
        contactAvatar &&
        contact.image
    ) {
        contactAvatar.src =
            contact.image;
    }
    if (
        contactStatus &&
        contact.status
    ) {
        contactStatus.textContent =
            contact.status;
    }
}
loadContactInfo();

// =========================================================
// TIME
// =========================================================
function getTime() {
    const now =
        new Date();
    return (
        String(
            now.getHours()
        ).padStart(2, "0")
        +
        ":" +
        String(
            now.getMinutes()
        ).padStart(2, "0")
    );
}

// =========================================================
// DATE
// =========================================================
function getDateLabel() {
    const now =
        new Date();
    return now
        .toISOString()
        .split("T")[0];
}

// =========================================================
// FORMAT DATE
// =========================================================
function formatDate(dateString) {
    const today =
        new Date();
    const date =
        new Date(dateString);
    const todayString =
        today
            .toISOString()
            .split("T")[0];
    const yesterday =
        new Date();
    yesterday.setDate(
        yesterday.getDate() - 1
    );
    const yesterdayString =
        yesterday
            .toISOString()
            .split("T")[0];
    if (
        dateString ===
        todayString
    ) {
        return "Today";
    }
    if (
        dateString ===
        yesterdayString
    ) {
        return "Yesterday";
    }
    return date.toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}

// =========================================================
// ESCAPE HTML
// =========================================================
function escapeHTML(text) {
    const div =
        document.createElement("div");
    div.textContent =
        text == null
        ? ""
        : String(text);
    return div.innerHTML;
}

// =========================================================
// MESSAGE PREVIEW
// =========================================================
function getMessagePreview(msg) {
    if (!msg) return "";
    if (
        msg.type === "audio"
    ) {
        return "🎙️ Voice message";
    }
    if (
        msg.type === "image"
    ) {
        return "📷 Photo";
    }
    if (
        msg.type === "viewOnce"
    ) {
        return "👁️ View Once";
    }
    if (
        msg.type === "file"
    ) {
        return (
            "📄 " +
            (
                msg.fileName ||
                "File"
            )
        );
    }
    return msg.text || "";
}

// =========================================================
// MESSAGE META
// =========================================================
function createMessageMeta(msg) {
    return `
        <div class="messageMeta">
            <span class="messageTime">
                ${msg.time || ""}
            </span>
            ${
                msg.type === "received"
                ? ""
                : `
                    <span
                        class="messageTicks ${
                            msg.read
                            ? "read"
                            : ""
                        }">
                        ✓✓
                    </span>
                `
            }
        </div>
    `;
}

// =========================================================
// REPLY INSIDE
// =========================================================
function createReplyInside(msg) {
    if (!msg.replyTo) {
        return "";
    }
    return `
        <div
            class="replyInside"
            data-reply-id="${escapeHTML(
                msg.replyTo
            )}">
            <strong>
                ↩ Reply
            </strong>
            <span>
                ${escapeHTML(
                    msg.replyText || ""
                )}
            </span>
        </div>
    `;
}

// =========================================================
// MESSAGE REACTIONS
// =========================================================
const reactionOptions = [
    "❤️",
    "😂",
    "😮",
    "😢",
    "😡",
    "👍"
];

// =========================================================
// CREATE REACTION DISPLAY
// =========================================================
function createReactionDisplay(msg) {
    if (
        !msg.reactions ||
        Object.keys(msg.reactions).length === 0
    ) {
        return "";
    }
    return `
        <div class="messageReactions">
            ${Object.keys(msg.reactions)
                .map(function(reaction) {
                    return `
                        <button
                            class="reactionBadge"
                            data-reaction="${escapeHTML(reaction)}">
                            ${reaction}
                            <span>
                                ${msg.reactions[reaction]}
                            </span>
                        </button>
                    `;
                })
                .join("")
            }
        </div>
    `;
}

// =========================================================
// ADD / REMOVE REACTION
// =========================================================
function toggleReaction(index, reaction) {
    const msg =
        chatHistory[index];
    if (!msg) return;
    if (!msg.reactions) {
        msg.reactions = {};
    }
    if (!msg.myReaction) {
        msg.myReaction = null;
    }
    if (
        msg.myReaction === reaction
    ) {
        if (msg.reactions[reaction]) {
            msg.reactions[reaction]--;
            if (
                msg.reactions[reaction] <= 0
            ) {
                delete msg.reactions[reaction];
            }
        }
        msg.myReaction = null;
    }
    else {
        if (
            msg.myReaction &&
            msg.reactions[msg.myReaction]
        ) {
            msg.reactions[msg.myReaction]--;
            if (
                msg.reactions[msg.myReaction] <= 0
            ) {
                delete msg.reactions[msg.myReaction];
            }
        }
        if (!msg.reactions[reaction]) {
            msg.reactions[reaction] = 0;
        }
        msg.reactions[reaction]++;
        msg.myReaction =
            reaction;
    }
    saveChat();
    loadMessages();
}

// =========================================================
// REACTION PICKER
// =========================================================
function openReactionPicker(index) {
    closeReactionPicker();
    const picker =
        document.createElement("div");
    picker.id =
        "reactionPicker";
    picker.className =
        "reactionPicker";
    picker.innerHTML =
        reactionOptions
            .map(function(reaction) {
                return `
                    <button
                        class="reactionOption"
                        data-reaction="${reaction}">
                        ${reaction}
                    </button>
                `;
            })
            .join("");
    document.body.appendChild(picker);
    const message =
        document.querySelector(
            `.message[data-index="${index}"]`
        );
    if (message) {
        const rect =
            message.getBoundingClientRect();
        picker.style.top =
            Math.max(
                10,
                rect.top - 55
            ) + "px";
        picker.style.left =
            Math.max(
                10,
                Math.min(
                    window.innerWidth - 250,
                    rect.left
                )
            ) + "px";
    }
    picker
        .querySelectorAll(
            ".reactionOption"
        )
        .forEach(function(button) {
            button.addEventListener(
                "click",
                function(e) {
                    e.stopPropagation();
                    toggleReaction(
                        index,
                        button.dataset.reaction
                    );
                    closeReactionPicker();
                }
            );
        });
    setTimeout(function() {
        document.addEventListener(
            "click",
            closeReactionPicker,
            {
                once: true
            }
        );
    }, 20);
}

// =========================================================
// CLOSE REACTION PICKER
// =========================================================
function closeReactionPicker() {
    const picker =
        document.getElementById(
            "reactionPicker"
        );
    if (picker) {
        picker.remove();
    }
}

// =========================================================
// FORWARDED LABEL
// =========================================================
function createForwardedLabel(msg) {
    if (!msg.forwarded) {
        return "";
    }
    return `
        <div class="forwardedLabel">
            ↗ Forwarded
        </div>
    `;
}

// =========================================================
// EDITED LABEL
// =========================================================
function createEditedLabel(msg) {
    if (!msg.edited) {
        return "";
    }
    return `
        <span class="editedLabel">
            edited
        </span>
    `;
}

// =========================================================
// LOAD MESSAGES
// =========================================================
function loadMessages() {
    if (!messages) return;
    messages.innerHTML = "";
    if (
        chatHistory.length === 0
    ) {
        messages.innerHTML = `
            <div class="emptyChat">
                <div class="emptyChatIcon">
                    💬
                </div>
                <p>
                    No messages yet
                </p>
            </div>
        `;
        return;
    }
    let lastDate = "";
    chatHistory.forEach(
        function(msg, index) {
            const messageDate =
                msg.date ||
                getDateLabel();
            if (
                messageDate !==
                lastDate
            ) {
                messages.innerHTML += `
                    <div class="dateSeparator">
                        ${formatDate(
                            messageDate
                        )}
                    </div>
                `;
                lastDate =
                    messageDate;
            }
            const wrapper =
                document.createElement(
                    "div"
                );
            wrapper.className =
                "message " +
                (
                    msg.type === "received"
                    ? "received"
                    : "sent"
                );
            wrapper.dataset.index =
                index;
            wrapper.dataset.messageId =
                msg.id || "";
            const forwarded =
                createForwardedLabel(msg);
            const replyInside =
                createReplyInside(msg);
            // =================================================
            // VIEW ONCE
            // =================================================
            if (
                msg.type === "viewOnce"
            ) {
                if (msg.opened) {
                    wrapper.innerHTML = `
                        ${forwarded}
                        ${replyInside}
                        <div class="viewOnceOpened">
                            👁️ View Once
                            <br>
                            <small>
                                Opened
                            </small>
                        </div>
                        ${createMessageMeta(msg)}
                    `;
                }
                else {
                    wrapper.innerHTML = `
                        ${forwarded}
                        ${replyInside}
                        <button
                            class="viewOnceButton">
                            👁️
                            <span>
                                View Once
                            </span>
                        </button>
                        ${createMessageMeta(msg)}
                    `;
                    const button =
                        wrapper.querySelector(
                            ".viewOnceButton"
                        );
                    if (button) {
                        button.addEventListener(
                            "click",
                            function(e) {
                                e.stopPropagation();
                                openViewOnce(index);
                            }
                        );
                    }
                }
                messages.appendChild(
                    wrapper
                );
                return;
            }
            // =================================================
            // IMAGE
            // =================================================
            if (
                msg.type === "image"
            ) {
                wrapper.innerHTML = `
                    ${forwarded}
                    ${replyInside}
                    <img
                        src="${msg.image}"
                        class="chatImage"
                        alt="Image">
                    ${createMessageMeta(msg)}
                `;
                messages.appendChild(
                    wrapper
                );
                return;
            }
            // =================================================
            // FILE
            // =================================================
            if (
                msg.type === "file"
            ) {
                wrapper.innerHTML = `
                    ${forwarded}
                    ${replyInside}
                    <div class="fileMessage">
                        📄
                        <div>
                            <strong>
                                ${escapeHTML(
                                    msg.fileName
                                )}
                            </strong>
                            <small>
                                ${escapeHTML(
                                    msg.fileSize || ""
                                )}
                            </small>
                        </div>
                    </div>
                    ${createMessageMeta(msg)}
                `;
                messages.appendChild(
                    wrapper
                );
                return;
            }

            // =================================================
            // VOICE MESSAGE
            // =================================================
            if (
                msg.type === "audio"
            ) {
                wrapper.innerHTML = `
                    ${forwarded}
                    ${replyInside}

                    <div class="voiceMessage">
                        <button
                            class="voicePlayBtn"
                            data-audio="${escapeHTML(msg.audio)}"
                            type="button">
                            ▶
                        </button>

                        <div class="voiceWave">
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>

                        <span class="voiceDuration">
                            ${escapeHTML(msg.duration || "0:00")}
                        </span>
                    </div>

                    ${createMessageMeta(msg)}
                `;

                const voiceButton =
                    wrapper.querySelector(
                        ".voicePlayBtn"
                    );

                if (voiceButton) {
                    voiceButton.addEventListener(
                        "click",
                        function(e) {
                            e.stopPropagation();

                            playVoiceMessage(
                                msg.audio,
                                voiceButton
                            );
                        }
                    );
                }

                messages.appendChild(
                    wrapper
                );

                return;
            }

            // =================================================
            // TEXT
            // =================================================
            wrapper.innerHTML = `
                ${forwarded}
                ${replyInside}
                <div class="messageText">
                    ${escapeHTML(
                        msg.text || ""
                    )}
                    ${createEditedLabel(msg)}
                </div>
                ${createReactionDisplay(msg)}
                ${createMessageMeta(msg)}
            `;
            messages.appendChild(
                wrapper
            );
        }
    );
    messages.scrollTop =
        messages.scrollHeight;
    // Restore selection highlights
    if (
        selectedMessages.size > 0
    ) {
        document
            .querySelectorAll(
                ".message"
            )
            .forEach(
                function(message) {
                    const index =
                        Number(
                            message.dataset.index
                        );
                    if (
                        selectedMessages.has(
                            index
                        )
                    ) {
                        message.classList.add(
                            "selectedMessage"
                        );
                    }
                }
            );
    }
}

// =========================================================
// SEND MESSAGE
// =========================================================
function sendMessage() {
    if (!messageInput) return;
    const text =
        messageInput.value.trim();
    if (!text) return;
    const newMessage = {
        id:
            createMessageId(),
        type:
            "sent",
        text:
            text,
        time:
            getTime(),
        date:
            getDateLabel(),
        read:
            false
    };
    // =====================================================
    // REPLY
    // =====================================================
    if (replyingTo) {
        newMessage.replyTo =
            replyingTo.id;
        newMessage.replyText =
            replyingTo.preview;
    }
    chatHistory.push(
        newMessage
    );
    saveChat();
    loadMessages();
    messageInput.value = "";
    messageInput.style.height = "42px";
    messageInput.style.overflowY = "hidden";
    localStorage.removeItem(
        chatKey + "_draft"
    );
    cancelReply();
    hideTyping();
    simulateRead();
}



// =========================================================
// SMART MESSAGE INPUT
// =========================================================
if (messageInput) {
    messageInput.addEventListener(
        "input",
        function() {

            this.style.height = "42px";

            this.style.height =
                Math.min(
                    this.scrollHeight,
                    180
                ) + "px";

            if (this.scrollHeight > 180) {
                this.style.overflowY = "auto";
            } else {
                this.style.overflowY = "hidden";
            }

            localStorage.setItem(
                chatKey + "_draft",
                this.value
            );

            if (this.value.trim()) {
                showTyping();
            } else {
                hideTyping();
            }

            // Update SEND 🎙️ / SEND ➤ button
            updateSendButton();
        }
    );
}

// =========================================================
// DRAFT
// =========================================================
const savedDraft =
    localStorage.getItem(
        chatKey + "_draft"
    );
if (
    savedDraft &&
    messageInput
) {
    messageInput.value =
        savedDraft;
    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            110
        ) + "px";
}

// =========================================================
// REPLY
// =========================================================
function startReply(index) {
    const msg =
        chatHistory[index];
    if (!msg) return;
    replyingTo = {
        id:
            msg.id,
        preview:
            getMessagePreview(msg)
    };
    createReplyPreview();
    if (messageInput) {
        messageInput.focus();
    }
}

// =========================================================
// REPLY PREVIEW
// =========================================================
function createReplyPreview() {
    let preview =
        document.getElementById(
            "replyPreview"
        );
    if (!preview) {
        preview =
            document.createElement(
                "div"
            );
        preview.id =
            "replyPreview";
        preview.innerHTML = `
            <div class="replyPreviewInfo">
                <strong
                    id="replyPreviewTitle">
                    Replying
                </strong>
                <span
                    id="replyPreviewText">
                </span>
            </div>
            <button
                id="replyPreviewClose">
                ✕
            </button>
        `;
        const bar =
            document.querySelector(
                ".messageBar"
            );
        if (bar) {
            bar.parentNode.insertBefore(
                preview,
                bar
            );
        }
    }
    const title =
        document.getElementById(
            "replyPreviewTitle"
        );
    const text =
        document.getElementById(
            "replyPreviewText"
        );
    const close =
        document.getElementById(
            "replyPreviewClose"
        );
    if (title) {
        title.textContent =
            "Replying to message";
    }
    if (text) {
        text.textContent =
            replyingTo.preview;
    }
    preview.classList.add(
        "show"
    );
    if (close) {
        close.onclick =
            cancelReply;
    }
}

// =========================================================
// CANCEL REPLY
// =========================================================
function cancelReply() {
    replyingTo =
        null;
    const preview =
        document.getElementById(
            "replyPreview"
        );
    if (preview) {
        preview.classList.remove(
            "show"
        );
    }
}

// =========================================================
// TAP REPLY → ORIGINAL
// =========================================================
if (messages) {
    messages.addEventListener(
        "click",
        function(e) {
            const replyBox =
                e.target.closest(
                    ".replyInside"
                );
            if (!replyBox) return;
            const originalId =
                replyBox.dataset.replyId;
            const original =
                messages.querySelector(
                    `[data-message-id="${originalId}"]`
                );
            if (!original) return;
            original.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
            original.classList.add(
                "replyHighlight"
            );
            setTimeout(
                function() {
                    original.classList.remove(
                        "replyHighlight"
                    );
                },
                1000
            );
        }
    );
}

// =========================================================
// EDIT MESSAGE
// =========================================================
function editMessage(index) {
    const msg =
        chatHistory[index];
    if (!msg) return;
    if (
        msg.type !== "sent"
    ) {
        return;
    }
    if (!msg.text) {
        return;
    }
    const newText =
        prompt(
            "Edit message:",
            msg.text
        );
    if (
        newText === null
    ) {
        return;
    }
    const cleanText =
        newText.trim();
    if (!cleanText) {
        return;
    }
    msg.text =
        cleanText;
    msg.edited =
        true;
    msg.editedAt =
        getTime();
    saveChat();
    loadMessages();
}

// =========================================================
// DELETE ONE MESSAGE
// =========================================================
function deleteMessage(index) {
    if (
        index < 0 ||
        index >= chatHistory.length
    ) {
        return;
    }
    const confirmed =
        confirm(
            "Delete this message?"
        );
    if (!confirmed) return;
    chatHistory.splice(
        index,
        1
    );
    saveChat();
    loadMessages();
}

// =========================================================
// ACTION MENU
// =========================================================
function openMessageActions(index) {
    const msg =
        chatHistory[index];
    if (!msg) return;
    closeMessageMenu();
    const menu =
        document.createElement(
            "div"
        );
    menu.id =
        "messageActionMenu";
    menu.className =
        "messageActionMenu";
    const canEdit =
        msg.type === "sent" &&
        !!msg.text;
    menu.innerHTML = `
        <button data-action="react">
            ❤️ React
        </button>
        <button data-action="reply">
            ↩️ Reply
        </button>
        <button data-action="forward">
            📤 Forward
        </button>
        <button data-action="select">
            ☑️ Select
        </button>
        ${
            canEdit
            ?
            `
                <button data-action="edit">
                    ✏️ Edit
                </button>
            `
            :
            ""
        }
        <button
            data-action="delete"
            class="dangerAction">
            🗑️ Delete
        </button>
    `;
    document.body.appendChild(
        menu
    );
    menu.querySelectorAll(
        "button"
    ).forEach(
        function(button) {
            button.addEventListener(
                "click",
                function(e) {
                    e.stopPropagation();
                    const action =
                        button.dataset.action;
                    closeMessageMenu();
                    if (
                        action === "react"
                    ) {
                        openReactionPicker(index);
                    }
                    else if (
                        action === "reply"
                    ) {
                        startReply(index);
                    }
                    else if (
                        action === "forward"
                    ) {
                        openForward(index);
                    }
                    else if (
                        action === "select"
                    ) {
                        enterSelectionMode(
                            index
                        );
                    }
                    else if (
                        action === "edit"
                    ) {
                        editMessage(index);
                    }
                    else if (
                        action === "delete"
                    ) {
                        deleteMessage(index);
                    }
                }
            );
        }
    );
    setTimeout(
        function() {
            document.addEventListener(
                "click",
                closeActionMenu,
                {
                    once: true
                }
            );
        },
        20
    );
}

// =========================================================
// CLOSE ACTION MENU
// =========================================================
function closeMessageMenu() {
    const menu =
        document.getElementById(
            "messageActionMenu"
        );
    if (menu) {
        menu.remove();
    }
}
function closeActionMenu(e) {
    const menu =
        document.getElementById(
            "messageActionMenu"
        );
    if (
        menu &&
        !menu.contains(
            e.target
        )
    ) {
        menu.remove();
    }
}

// =========================================================
// GESTURE SYSTEM
// =========================================================
let gestureMessage = null;
let gestureStartX = 0;
let gestureStartY = 0;
let gestureDragging = false;
let gestureLongPressTimer = null;
const SWIPE_TRIGGER =
    42;
const MAX_SWIPE =
    78;
const LONG_PRESS_TIME =
    550;

// =========================================================
// GESTURE START
// =========================================================
if (messages) {
    messages.addEventListener(
        "pointerdown",
        function(e) {
            const message =
                e.target.closest(
                    ".message"
                );
            if (!message) return;
            if (
                selectedMessages.size > 0
            ) {
                return;
            }
            gestureMessage =
                message;
            gestureStartX =
                e.clientX;
            gestureStartY =
                e.clientY;
            gestureDragging =
                false;
            message.style.transition =
                "none";
            clearTimeout(
                gestureLongPressTimer
            );
            gestureLongPressTimer =
                setTimeout(
                    function() {
                        if (
                            gestureMessage &&
                            !gestureDragging
                        ) {
                            const index =
                                Number(
                                    gestureMessage
                                        .dataset
                                        .index
                                );
                            openMessageActions(
                                index
                            );
                            gestureMessage
                                .style
                                .transform =
                                "translateX(0)";
                            gestureMessage =
                                null;
                        }
                    },
                    LONG_PRESS_TIME
                );
        }
    );
    // =====================================================
    // GESTURE MOVE
    // =====================================================
    messages.addEventListener(
        "pointermove",
        function(e) {
            if (!gestureMessage) return;
            const dx =
                e.clientX -
                gestureStartX;
            const dy =
                e.clientY -
                gestureStartY;
            if (
                Math.abs(dx) > 7 ||
                Math.abs(dy) > 7
            ) {
                clearTimeout(
                    gestureLongPressTimer
                );
            }
            if (
                Math.abs(dy) >
                Math.abs(dx)
            ) {
                return;
            }
            if (
                Math.abs(dx) > 5
            ) {
                gestureDragging =
                    true;
            }
            const limitedX =
                Math.max(
                    -MAX_SWIPE,
                    Math.min(
                        MAX_SWIPE,
                        dx
                    )
                );
            gestureMessage.style.transform =
                `translateX(${limitedX}px)`;
        }
    );
    // =====================================================
    // GESTURE END
    // =====================================================
    messages.addEventListener(
        "pointerup",
        finishGesture
    );
    messages.addEventListener(
        "pointercancel",
        finishGesture
    );
}

// =========================================================
// FINISH GESTURE
// =========================================================
function finishGesture(e) {
    clearTimeout(
        gestureLongPressTimer
    );
    if (!gestureMessage) return;
    const message =
        gestureMessage;
    const dx =
        e.clientX -
        gestureStartX;
    const dy =
        Math.abs(
            e.clientY -
            gestureStartY
        );
    const index =
        Number(
            message.dataset.index
        );
    message.style.transition =
        "transform .18s ease";
    // =====================================================
    // RIGHT → REPLY
    // =====================================================
    if (
        dx >= SWIPE_TRIGGER &&
        dy < 65
    ) {
        message.style.transform =
            "translateX(55px)";
        setTimeout(
            function() {
                startReply(index);
                message.style.transform =
                    "translateX(0)";
            },
            120
        );
    }
    // =====================================================
    // LEFT → FORWARD
    // =====================================================
    else if (
        dx <= -SWIPE_TRIGGER &&
        dy < 65
    ) {
        message.style.transform =
            "translateX(-55px)";
        setTimeout(
            function() {
                openForward(index);
                message.style.transform =
                    "translateX(0)";
            },
            120
        );
    }
    else {
        message.style.transform =
            "translateX(0)";
    }
    gestureMessage =
        null;
    gestureDragging =
        false;
}

// =========================================================
// SELECTION MODE
// =========================================================
function enterSelectionMode(index) {
    selectedMessages.clear();
    selectedMessages.add(index);
    renderSelectionMode();
}

// =========================================================
// RENDER SELECTION
// =========================================================
function renderSelectionMode() {
    document
        .querySelectorAll(
            ".message"
        )
        .forEach(
            function(message) {
                const index =
                    Number(
                        message.dataset.index
                    );
                message.classList.toggle(
                    "selectedMessage",
                    selectedMessages.has(index)
                );
                message.onclick =
                    function(e) {
                        e.stopPropagation();
                        toggleMessageSelection(
                            index
                        );
                    };
            }
        );
    showSelectionBar();
}

// =========================================================
// TOGGLE SELECTION
// =========================================================
function toggleMessageSelection(index) {
    if (
        selectedMessages.has(index)
    ) {
        selectedMessages.delete(index);
    }
    else {
        selectedMessages.add(index);
    }
    if (
        selectedMessages.size === 0
    ) {
        exitSelectionMode();
        return;
    }
    renderSelectionMode();
}

// =========================================================
// SELECTION BAR
// =========================================================
function showSelectionBar() {
    let bar =
        document.getElementById(
            "selectionBar"
        );
    if (bar) {
        bar.remove();
    }
    bar =
        document.createElement(
            "div"
        );
    bar.id =
        "selectionBar";
    bar.className =
        "selectionBar";
    bar.innerHTML = `
        <button id="cancelSelection">
            ✕
        </button>
        <strong>
            ${selectedMessages.size}
            selected
        </strong>
        <div>
            <button id="selectForward">
                📤
            </button>
            <button id="selectDelete">
                🗑️
            </button>
        </div>
    `;
    document.body.appendChild(
        bar
    );
    document
        .getElementById(
            "cancelSelection"
        )
        .onclick =
        exitSelectionMode;
    document
        .getElementById(
            "selectDelete"
        )
        .onclick =
        deleteSelectedMessages;
    document
        .getElementById(
            "selectForward"
        )
        .onclick =
        forwardSelectedMessages;
}

// =========================================================
// EXIT SELECTION
// =========================================================
function exitSelectionMode() {
    selectedMessages.clear();
    document
        .querySelectorAll(
            ".message"
        )
        .forEach(
            function(message) {
                message.classList.remove(
                    "selectedMessage"
                );
                message.onclick =
                    null;
            }
        );
    const bar =
        document.getElementById(
            "selectionBar"
        );
    if (bar) {
        bar.remove();
    }
}

// =========================================================
// DELETE SELECTED
// =========================================================
function deleteSelectedMessages() {
    if (
        selectedMessages.size === 0
    ) {
        return;
    }
    const confirmed =
        confirm(
            `Delete ${selectedMessages.size} selected message(s)?`
        );
    if (!confirmed) return;
    chatHistory =
        chatHistory.filter(
            function(msg, index) {
                return !selectedMessages.has(
                    index
                );
            }
        );
    saveChat();
    exitSelectionMode();
    loadMessages();
}

// =========================================================
// FORWARD SELECTED
// =========================================================
function forwardSelectedMessages() {
    if (
        selectedMessages.size === 0
    ) {
        return;
    }
    const selected =
        Array.from(
            selectedMessages
        )
        .sort(
            function(a, b) {
                return a - b;
            }
        )
        .map(
            function(index) {
                return chatHistory[index];
            }
        );
    openMultiForward(
        selected
    );
}

// =========================================================
// MULTI FORWARD
// =========================================================
function openMultiForward(
    messagesToForward
) {
    const old =
        document.getElementById(
            "forwardPanel"
        );
    if (old) {
        old.remove();
    }
    const panel =
        document.createElement(
            "div"
        );
    panel.id =
        "forwardPanel";
    panel.className =
        "forwardPanel";
    panel.innerHTML = `
        <div class="forwardHeader">
            <button
                id="closeMultiForward">
                ✕
            </button>
            <strong>
                Forward
                ${messagesToForward.length}
                messages
            </strong>
        </div>
        <div class="forwardMessagePreview">
            ${messagesToForward
                .map(
                    function(msg) {
                        return `
                            <div>
                                ${escapeHTML(
                                    getMessagePreview(msg)
                                )}
                            </div>
                        `;
                    }
                )
                .join("")
            }
        </div>
        <div class="forwardContacts">
            <button
                class="multiForwardContact"
                data-contact="Friend Name">
                👤 Friend Name
            </button>
            <button
                class="multiForwardContact"
                data-contact="AizerChat">
                👤 AizerChat
            </button>
        </div>
    `;
    document.body.appendChild(
        panel
    );
    requestAnimationFrame(
        function() {
            panel.classList.add(
                "show"
            );
        }
    );
    document
        .getElementById(
            "closeMultiForward"
        )
        .onclick =
        function() {
            panel.remove();
            exitSelectionMode();
        };
    panel
        .querySelectorAll(
            ".multiForwardContact"
        )
        .forEach(
            function(button) {
                button.onclick =
                    function() {
                        messagesToForward
                            .forEach(
                                function(msg) {
                                    chatHistory.push({
                                        id:
                                            createMessageId(),
                                        type:
                                            "sent",
                                        text:
                                            getMessagePreview(
                                                msg
                                            ),
                                        forwarded:
                                            true,
                                        forwardedFrom:
                                            button.dataset.contact,
                                        time:
                                            getTime(),
                                        date:
                                            getDateLabel(),
                                        read:
                                            false
                                    });
                                }
                            );
                        saveChat();
                        panel.remove();
                        exitSelectionMode();
                        loadMessages();
                    };
            }
        );
}

// =========================================================
// SINGLE FORWARD
// =========================================================
function openForward(index) {
    const msg =
        chatHistory[index];
    if (!msg) return;
    forwardingMessage =
        msg;
    closeForward();
    const panel =
        document.createElement(
            "div"
        );
    panel.id =
        "forwardPanel";
    panel.className =
        "forwardPanel";
    panel.innerHTML = `
        <div class="forwardHeader">
            <button id="closeForward">
                ✕
            </button>
            <strong>
                Forward message
            </strong>
        </div>
        <div class="forwardMessagePreview">
            <div class="forwardPreviewLabel">
                Forwarding
            </div>
            ${escapeHTML(
                getMessagePreview(msg)
            )}
        </div>
        <div class="forwardContacts">
            <button
                class="forwardContact"
                data-contact="Friend Name">
                👤
                <span>
                    Friend Name
                </span>
            </button>
            <button
                class="forwardContact"
                data-contact="AizerChat">
                👤
                <span>
                    AizerChat
                </span>
            </button>
        </div>
    `;
    document.body.appendChild(
        panel
    );
    requestAnimationFrame(
        function() {
            panel.classList.add(
                "show"
            );
        }
    );
    const closeButton =
        document.getElementById(
            "closeForward"
        );
    if (closeButton) {
        closeButton.onclick =
            closeForward;
    }
    panel
        .querySelectorAll(
            ".forwardContact"
        )
        .forEach(
            function(button) {
                button.onclick =
                    function() {
                        forwardMessageTo(
                            button.dataset.contact
                        );
                    };
            }
        );
}

// =========================================================
// FORWARD MESSAGE
// =========================================================
function forwardMessageTo(
    contact
) {
    if (!forwardingMessage) return;
    const forwarded = {
        id:
            createMessageId(),
        type:
            "sent",
        text:
            getMessagePreview(
                forwardingMessage
            ),
        forwarded:
            true,
        forwardedFrom:
            contact,
        time:
            getTime(),
        date:
            getDateLabel(),
        read:
            false
    };
    chatHistory.push(
        forwarded
    );
    saveChat();
    loadMessages();
    closeForward();
    simulateRead();
}

// =========================================================
// CLOSE FORWARD
// =========================================================
function closeForward() {
    const panel =
        document.getElementById(
            "forwardPanel"
        );
    if (panel) {
        panel.remove();
    }
    forwardingMessage =
        null;
}

// =========================================================
// READ TICKS
// =========================================================
function simulateRead() {
    setTimeout(
        function() {
            if (
                chatHistory.length === 0
            ) {
                return;
            }
            const last =
                chatHistory[
                    chatHistory.length - 1
                ];
            if (
                last.type === "sent"
            ) {
                last.read =
                    true;
                saveChat();
                loadMessages();
            }
        },
        1200
    );
}

// =========================================================
// ATTACHMENT MENU
// =========================================================
if (attachBtn) {
    attachBtn.addEventListener(
        "click",
        function(e) {
            e.stopPropagation();
            if (attachMenu) {
                attachMenu.classList.toggle(
                    "show"
                );
            }
        }
    );
}
document.addEventListener(
    "click",
    function(e) {
        if (
            attachMenu &&
            !attachMenu.contains(
                e.target
            ) &&
            e.target !== attachBtn
        ) {
            attachMenu.classList.remove(
                "show"
            );
        }
    }
);

// =========================================================
// GALLERY
// =========================================================
if (galleryBtn) {
    galleryBtn.addEventListener(
        "click",
        function() {
            if (galleryInput) {
                galleryInput.click();
            }
            if (attachMenu) {
                attachMenu.classList.remove(
                    "show"
                );
            }
        }
    );
}
if (galleryInput) {
    galleryInput.addEventListener(
        "change",
        handleImage
    );
}

// =========================================================
// CAMERA
// =========================================================
if (cameraBtn) {
    cameraBtn.addEventListener(
        "click",
        function() {
            if (cameraInput) {
                cameraInput.click();
            }
        }
    );
}
if (cameraInput) {
    cameraInput.addEventListener(
        "change",
        handleImage
    );
}

// =========================================================
// IMAGE HANDLER
// =========================================================
function handleImage(e) {
    const file =
        e.target.files[0];
    if (!file) return;
    if (
        !file.type.startsWith(
            "image/"
        )
    ) {
        alert(
            "Please select an image."
        );
        e.target.value =
            "";
        return;
    }
    const reader =
        new FileReader();
    reader.onload =
        function(event) {
            showImageSendOptions(
                event.target.result,
                file.name
            );
        };
    reader.readAsDataURL(file);
    e.target.value =
        "";
}

// =========================================================
// IMAGE SEND OPTIONS
// =========================================================
function showImageSendOptions(
    imageData,
    fileName
) {
    const useViewOnce =
        confirm(
            "Send this image as View Once?\n\n" +
            "OK = View Once\n" +
            "Cancel = Normal image"
        );
    const newMessage = {
        id:
            createMessageId(),
        type:
            useViewOnce
            ? "viewOnce"
            : "image",
        image:
            imageData,
        fileName:
            fileName,
        time:
            getTime(),
        date:
            getDateLabel(),
        read:
            false,
        opened:
            false
    };
    if (replyingTo) {
        newMessage.replyTo =
            replyingTo.id;
        newMessage.replyText =
            replyingTo.preview;
    }
    chatHistory.push(
        newMessage
    );
    saveChat();
    loadMessages();
    cancelReply();
    simulateRead();
}

// =========================================================
// VIEW ONCE
// =========================================================
function openViewOnce(index) {
    const msg =
        chatHistory[index];
    if (!msg) return;
    if (
        msg.type !== "viewOnce" ||
        msg.opened
    ) {
        return;
    }
    msg.opened =
        true;
    saveChat();
    const overlay =
        document.createElement(
            "div"
        );
    overlay.className =
        "viewOnceOverlay";
    overlay.innerHTML = `
        <div class="viewOnceViewer">
            <button
                class="closeViewOnce">
                ✕
            </button>
            <img
                src="${msg.image}"
                alt="View Once">
            <div class="viewOnceTitle">
                👁️ View Once
            </div>
        </div>
    `;
    document.body.appendChild(
        overlay
    );
    const close =
        overlay.querySelector(
            ".closeViewOnce"
        );
    if (close) {
        close.onclick =
            closeViewOnce;
    }
    overlay.addEventListener(
        "click",
        function(e) {
            if (
                e.target === overlay
            ) {
                closeViewOnce();
            }
        }
    );
    loadMessages();
}

// =========================================================
// CLOSE VIEW ONCE
// =========================================================
function closeViewOnce() {
    const overlay =
        document.querySelector(
            ".viewOnceOverlay"
        );
    if (overlay) {
        overlay.remove();
    }
}

// =========================================================
// FILE BUTTON
// =========================================================
if (fileBtn) {
    fileBtn.addEventListener(
        "click",
        function() {
            if (fileInput) {
                fileInput.click();
            }
            if (attachMenu) {
                attachMenu.classList.remove(
                    "show"
                );
            }
        }
    );
}
if (fileInput) {
    fileInput.addEventListener(
        "change",
        handleFile
    );
}

// =========================================================
// FILE HANDLER
// =========================================================
function handleFile(e) {
    const file =
        e.target.files[0];
    if (!file) return;
    const reader =
        new FileReader();
    reader.onload =
        function(event) {
            const newMessage = {
                id:
                    createMessageId(),
                type:
                    "file",
                fileName:
                    file.name,
                fileSize:
                    formatFileSize(
                        file.size
                    ),
                fileData:
                    event.target.result,
                time:
                    getTime(),
                date:
                    getDateLabel(),
                read:
                    false
            };
            if (replyingTo) {
                newMessage.replyTo =
                    replyingTo.id;
                newMessage.replyText =
                    replyingTo.preview;
            }
            chatHistory.push(
                newMessage
            );
            saveChat();
            loadMessages();
            cancelReply();
            simulateRead();
        };
    reader.readAsDataURL(file);
    e.target.value =
        "";
}

// =========================================================
// FILE SIZE
// =========================================================
function formatFileSize(bytes) {
    if (
        bytes === 0
    ) {
        return "0 Bytes";
    }
    const sizes = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];
    const i =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );
    return (
        parseFloat(
            (
                bytes /
                Math.pow(
                    1024,
                    i
                )
            ).toFixed(2)
        )
        +
        " " +
        sizes[i]
    );
}

// =========================================================
// BACK BUTTON
// =========================================================
if (backBtn) {
    backBtn.addEventListener(
        "click",
        function() {
            history.back();
        }
    );
}

// =========================================================
// TYPING
// =========================================================
function showTyping() {
    if (typingIndicator) {
        typingIndicator.classList.add(
            "show"
        );
    }
}
function hideTyping() {
    if (typingIndicator) {
        typingIndicator.classList.remove(
            "show"
        );
    }
}

// =========================================================
// GLOBAL ESCAPE
// =========================================================
document.addEventListener(
    "keydown",
    function(e) {
        if (
            e.key === "Escape"
        ) {
            closeMessageMenu();
            closeForward();
            cancelReply();
            exitSelectionMode();
        }
    }
);

// =========================================================
// MESSAGE SEARCH SYSTEM
// =========================================================
let chatSearchMatches = [];
let chatSearchIndex = -1;

// OPEN SEARCH
document.addEventListener("click", function(e) {
    if (e.target.closest("#chatSearchBtn")) {
        const bar = document.getElementById("chatSearchBar");
        const input = document.getElementById("chatSearchInput");
        if (!bar || !input) return;
        bar.classList.add("show");
        setTimeout(() => input.focus(), 100);
    }
});

// CLOSE SEARCH
document.addEventListener("click", function(e) {
    if (!e.target.closest("#closeChatSearch")) return;
    closeChatSearch();
});

function closeChatSearch() {
    const bar = document.getElementById("chatSearchBar");
    if (bar) {
        bar.classList.remove("show");
    }
    const input = document.getElementById("chatSearchInput");
    if (input) {
        input.value = "";
    }
    clearSearchHighlights();
}

// SEARCH
document.addEventListener("input", function(e) {
    if (e.target.id !== "chatSearchInput") return;
    performChatSearch(e.target.value);
});

function performChatSearch(query) {
    clearSearchHighlights();
    chatSearchMatches = [];
    chatSearchIndex = -1;
    const count = document.getElementById("chatSearchCount");
    const messages = document.querySelectorAll(
        "#messages .message"
    );
    query = query.trim().toLowerCase();
    if (!query) {
        if (count) {
            count.textContent = "0/0";
        }
        return;
    }
    messages.forEach(message => {
        const text =
            message.textContent
            .trim()
            .toLowerCase();
        if (text.includes(query)) {
            message.classList.add("searchMatch");
            chatSearchMatches.push(message);
        }
    });
    if (!chatSearchMatches.length) {
        if (count) {
            count.textContent = "0/0";
        }
        return;
    }
    chatSearchIndex = 0;
    showCurrentSearchMatch();
}

function showCurrentSearchMatch() {
    chatSearchMatches.forEach(message => {
        message.classList.remove(
            "currentSearchMatch"
        );
    });
    const current =
        chatSearchMatches[chatSearchIndex];
    if (!current) return;
    current.classList.add(
        "currentSearchMatch"
    );
    current.scrollIntoView({
        behavior:"smooth",
        block:"center"
    });
    const count =
        document.getElementById("chatSearchCount");
    if (count) {
        count.textContent =
            `${chatSearchIndex + 1}/${chatSearchMatches.length}`;
    }
}

// NEXT
document.addEventListener("click", function(e) {
    if (!e.target.closest("#chatSearchNext")) return;
    if (!chatSearchMatches.length) return;
    chatSearchIndex++;
    if (
        chatSearchIndex >=
        chatSearchMatches.length
    ) {
        chatSearchIndex = 0;
    }
    showCurrentSearchMatch();
});

// PREVIOUS
document.addEventListener("click", function(e) {
    if (!e.target.closest("#chatSearchPrev")) return;
    if (!chatSearchMatches.length) return;
    chatSearchIndex--;
    if (chatSearchIndex < 0) {
        chatSearchIndex =
            chatSearchMatches.length - 1;
    }
    showCurrentSearchMatch();
});

function clearSearchHighlights() {
    document
        .querySelectorAll(
            "#messages .searchMatch"
        )
        .forEach(message => {
            message.classList.remove(
                "searchMatch",
                "currentSearchMatch"
            );
        });
}

// =========================================================
// INITIAL LOAD
// =========================================================
loadMessages();


// =========================================================
// AIZERCHAT V3 — FIXED VOICE MESSAGE SYSTEM
// =========================================================
let voiceRecorder = null;
let voiceAudioChunks = [];
let voiceRecording = false;
let voiceRecordingStart = 0;
let voiceRecordingTimer = null;
let currentVoiceAudio = null;
// =========================================================
// UPDATE SEND / VOICE BUTTON
// =========================================================
function updateSendButton() {

    if (!sendBtn || !messageInput) {
        return;
    }

    // Recording → STOP button
    if (voiceRecording) {

        sendBtn.innerHTML = "⏹";

        sendBtn.setAttribute(
            "aria-label",
            "Stop recording"
        );

        sendBtn.classList.add("recording");
        sendBtn.classList.remove("voiceMode");

        return;
    }

    // Text entered → SEND button
    if (messageInput.value.trim() !== "") {

        sendBtn.innerHTML = "➤";

        sendBtn.setAttribute(
            "aria-label",
            "Send message"
        );

        sendBtn.classList.remove("voiceMode");
        sendBtn.classList.remove("recording");

        return;
    }

    // Empty input → VOICE button
    sendBtn.innerHTML = "🎙️";

    sendBtn.setAttribute(
        "aria-label",
        "Record voice message"
    );

    sendBtn.classList.add("voiceMode");
    sendBtn.classList.remove("recording");
}

// =========================================================
// INITIAL STATE
// =========================================================
updateSendButton();
// =========================================================
// START RECORDING
// =========================================================
async function startVoiceRecording() {
    if (voiceRecording) {
        return;
    }
    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {
        alert(
            "Voice recording is not supported here."
        );
        return;
    }
    try {
        const stream =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });
        voiceAudioChunks = [];
        // Choose supported audio format
        let mimeType = "";
        if (
            MediaRecorder.isTypeSupported(
                "audio/webm;codecs=opus"
            )
        ) {
            mimeType =
                "audio/webm;codecs=opus";
        }
        else if (
            MediaRecorder.isTypeSupported(
                "audio/webm"
            )
        ) {
            mimeType =
                "audio/webm";
        }
        else if (
            MediaRecorder.isTypeSupported(
                "audio/mp4"
            )
        ) {
            mimeType =
                "audio/mp4";
        }
        voiceRecorder =
            mimeType
            ? new MediaRecorder(
                stream,
                {
                    mimeType: mimeType
                }
            )
            : new MediaRecorder(
                stream
            );
        voiceRecording = true;
        voiceRecordingStart =
            Date.now();
        voiceRecorder.ondataavailable =
            function(event) {
                if (
                    event.data &&
                    event.data.size > 0
                ) {
                    voiceAudioChunks.push(
                        event.data
                    );
                }
            };
        voiceRecorder.onstop =
            function() {
                stream
                    .getTracks()
                    .forEach(
                        function(track) {
                            track.stop();
                        }
                    );
                finishVoiceRecording();
            };
        voiceRecorder.onerror =
            function(error) {
                console.error(
                    "MediaRecorder error:",
                    error
                );
                stream
                    .getTracks()
                    .forEach(
                        function(track) {
                            track.stop();
                        }
                    );
                voiceRecording = false;
                clearInterval(
                    voiceRecordingTimer
                );
                updateSendButton();
            };
        voiceRecorder.start();
        startVoiceTimer();
        if (sendBtn) {
            sendBtn.classList.add(
                "recording"
            );
            sendBtn.innerHTML =
                "⏹";
            sendBtn.setAttribute(
                "aria-label",
                "Stop recording"
            );
        }
    }
    catch (error) {
        console.error(
            "Voice recording error:",
            error
        );
        voiceRecording = false;
        clearInterval(
            voiceRecordingTimer
        );
        updateSendButton();
        if (
            error.name ===
            "NotAllowedError"
        ) {
            alert(
                "Microphone permission was denied. Please allow microphone access for AizerChat."
            );
        }
        else if (
            error.name ===
            "NotFoundError"
        ) {
            alert(
                "No microphone was found on this device."
            );
        }
        else {
            alert(
                "Unable to access the microphone."
            );
        }
    }
}
// =========================================================
// STOP RECORDING
// =========================================================
function stopVoiceRecording() {
    if (
        !voiceRecorder ||
        !voiceRecording
    ) {
        return;
    }
    voiceRecording = false;
    clearInterval(
        voiceRecordingTimer
    );
    if (sendBtn) {
        sendBtn.classList.remove(
            "recording"
        );
        sendBtn.innerHTML =
            "⏳";
        sendBtn.setAttribute(
            "aria-label",
            "Processing voice message"
        );
    }
    if (
        voiceRecorder.state !==
        "inactive"
    ) {
        voiceRecorder.stop();
    }
}
// =========================================================
// RECORDING TIMER
// =========================================================
function startVoiceTimer() {
    clearInterval(
        voiceRecordingTimer
    );
    voiceRecordingTimer =
        setInterval(
            function() {
                if (!voiceRecording) {
                    return;
                }
                const seconds =
                    Math.floor(
                        (
                            Date.now() -
                            voiceRecordingStart
                        ) / 1000
                    );
                if (sendBtn) {
                    sendBtn.innerHTML =
                        "⏹";
                    sendBtn.title =
                        "Recording " +
                        formatVoiceDuration(
                            seconds
                        );
                }
            },
            250
        );
}
// =========================================================
// FORMAT DURATION
// =========================================================
function formatVoiceDuration(
    seconds
) {
    const minutes =
        Math.floor(
            seconds / 60
        );
    const remainingSeconds =
        seconds % 60;
    return (
        minutes +
        ":" +
        String(
            remainingSeconds
        ).padStart(2, "0")
    );
}
// =========================================================
// FINISH RECORDING
// =========================================================
function finishVoiceRecording() {
    clearInterval(
        voiceRecordingTimer
    );
    if (
        voiceAudioChunks.length === 0
    ) {
        voiceRecorder = null;
        updateSendButton();
        return;
    }
    const duration =
        Math.floor(
            (
                Date.now() -
                voiceRecordingStart
            ) / 1000
        );
    const mimeType =
        voiceRecorder &&
        voiceRecorder.mimeType
        ? voiceRecorder.mimeType
        : "audio/webm";
    const audioBlob =
        new Blob(
            voiceAudioChunks,
            {
                type: mimeType
            }
        );
    const reader =
        new FileReader();
    reader.onload =
        function(event) {
            const newMessage = {
                id:
                    createMessageId(),
                type:
                    "audio",
                audio:
                    event.target.result,
                duration:
                    formatVoiceDuration(
                        duration
                    ),
                time:
                    getTime(),
                date:
                    getDateLabel(),
                read:
                    false
            };
            if (replyingTo) {
                newMessage.replyTo =
                    replyingTo.id;
                newMessage.replyText =
                    replyingTo.preview;
            }
            chatHistory.push(
                newMessage
            );
            saveChat();
            loadMessages();
            cancelReply();
            simulateRead();
            voiceAudioChunks = [];
            voiceRecorder = null;
            updateSendButton();
        };
    reader.onerror =
        function(error) {
            console.error(
                "Voice file error:",
                error
            );
            voiceAudioChunks = [];
            voiceRecorder = null;
            updateSendButton();
        };
    reader.readAsDataURL(
        audioBlob
    );
}
// =========================================================
// AIZERCHAT V3 — SEND / VOICE BUTTON
// =========================================================

if (sendBtn) {

    // Prevent button from submitting the page/form
    sendBtn.type = "button";

    sendBtn.addEventListener("click", function(e) {

        e.preventDefault();
        e.stopPropagation();

        // =============================================
        // RECORDING → STOP RECORDING
        // =============================================

        if (voiceRecording) {
            stopVoiceRecording();
            return;
        }

        // =============================================
        // TEXT EXISTS → SEND MESSAGE
        // =============================================

        if (
            messageInput &&
            messageInput.value.trim() !== ""
        ) {
            sendMessage();
            updateSendButton();
            return;
        }

        // =============================================
        // EMPTY INPUT → START VOICE RECORDING
        // =============================================

        startVoiceRecording();

    });

}


// =========================================================
// PLAY VOICE MESSAGE
// =========================================================

function playVoiceMessage(
    audioData,
    button
) {

    if (!audioData) {
        return;
    }

    if (
        currentVoiceAudio &&
        !currentVoiceAudio.paused
    ) {

        currentVoiceAudio.pause();
        currentVoiceAudio.currentTime = 0;

        document
            .querySelectorAll(".voicePlayBtn")
            .forEach(function(btn) {
                btn.innerHTML = "▶";
            });

        if (
            currentVoiceAudio.src === audioData
        ) {
            currentVoiceAudio = null;
            return;
        }
    }

    const audio = new Audio(audioData);

    currentVoiceAudio = audio;

    button.innerHTML = "⏸";

    const playPromise = audio.play();

    if (
        playPromise &&
        typeof playPromise.catch === "function"
    ) {

        playPromise.catch(function(error) {

            console.error(
                "Audio playback error:",
                error
            );

            button.innerHTML = "▶";
            currentVoiceAudio = null;

        });
    }

    audio.onended = function() {

        button.innerHTML = "▶";
        currentVoiceAudio = null;

    };

}
// =========================================================
// PLAY VOICE MESSAGE
// =========================================================
function playVoiceMessage(
    audioData,
    button
) {
    if (!audioData) {
        return;
    }
    if (
        currentVoiceAudio &&
        !currentVoiceAudio.paused
    ) {
        currentVoiceAudio.pause();
        currentVoiceAudio.currentTime =
            0;
        document
            .querySelectorAll(
                ".voicePlayBtn"
            )
            .forEach(
                function(btn) {
                    btn.innerHTML =
                        "▶";
                }
            );
        if (
            currentVoiceAudio.src ===
            audioData
        ) {
            currentVoiceAudio =
                null;
            return;
        }
    }
    const audio =
        new Audio(
            audioData
        );
    currentVoiceAudio =
        audio;
    button.innerHTML =
        "⏸";
    const playPromise =
        audio.play();
    if (
        playPromise &&
        typeof playPromise.catch ===
        "function"
    ) {
        playPromise.catch(
            function(error) {
                console.error(
                    "Audio playback error:",
                    error
                );
                button.innerHTML =
                    "▶";
                currentVoiceAudio =
                    null;
            }
        );
    }
    audio.onended =
        function() {
            button.innerHTML =
                "▶";
            currentVoiceAudio =
                null;
        };
}

// =========================================================
// AIZERCHAT V3 — CALL BUTTON
// =========================================================

const callBtn = document.getElementById("callBtn");

if (callBtn) {

    callBtn.addEventListener("click", function(e) {

        e.preventDefault();
        e.stopPropagation();

        openCallScreen();

    });

}


// =========================================================
// CALL SCREEN
// =========================================================

function openCallScreen() {

    // Prevent duplicate call screen
    const existing =
        document.getElementById("callScreen");

    if (existing) {
        return;
    }

    const callScreen =
        document.createElement("div");

    callScreen.id = "callScreen";
    callScreen.className = "callScreen";

    callScreen.innerHTML = `

        <div class="callTop">

            <button
                id="closeCallScreen"
                class="closeCallScreen">
                ←
            </button>

        </div>


        <div class="callProfile">

            <img
                src="${
                    contactAvatar
                    ? contactAvatar.src
                    : "images/profile.jpg"
                }"
                alt="Profile">

            <h2>
                ${escapeHTML(contactName)}
            </h2>

            <p>
                Calling...
            </p>

        </div>


        <div class="callControls">

            <button
                class="callControl"
                id="muteCallBtn">
                🎙️
            </button>

            <button
                class="callEndBtn"
                id="endCallBtn">
                ☎
            </button>

            <button
                class="callControl">
                🔊
            </button>

        </div>

    `;

    document.body.appendChild(callScreen);


    // Close button
    const closeBtn =
        document.getElementById(
            "closeCallScreen"
        );

    if (closeBtn) {

        closeBtn.onclick =
            closeCallScreen;

    }


    // End call
    const endBtn =
        document.getElementById(
            "endCallBtn"
        );

    if (endBtn) {

        endBtn.onclick =
            closeCallScreen;

    }


    // Mute button
    const muteBtn =
        document.getElementById(
            "muteCallBtn"
        );

    if (muteBtn) {

        muteBtn.onclick =
            function() {

                this.classList.toggle(
                    "active"
                );

                this.textContent =
                    this.classList.contains(
                        "active"
                    )
                    ? "🔇"
                    : "🎙️";

            };

    }

}


// =========================================================
// CLOSE CALL SCREEN
// =========================================================

function closeCallScreen() {

    const callScreen =
        document.getElementById(
            "callScreen"
        );

    if (callScreen) {

        callScreen.remove();

    }

}

// =========================================================
// CHAT MORE MENU
// =========================================================

const moreBtn = document.getElementById("moreBtn");
const chatMoreMenu = document.getElementById("chatMoreMenu");

if (moreBtn && chatMoreMenu) {

    moreBtn.addEventListener("click", (e) => {

        e.stopPropagation();

        chatMoreMenu.classList.toggle("show");

    });

}


// Close menu when tapping outside

document.addEventListener("click", (e) => {

    if (
        chatMoreMenu &&
        !chatMoreMenu.contains(e.target) &&
        e.target !== moreBtn
    ) {

        chatMoreMenu.classList.remove("show");

    }

});

// =========================================================
// AIZERCHAT V3 — FRIEND PROFILE / CHAT INFO
// =========================================================

const contactProfileBtn =
    document.getElementById("contactProfileBtn");

const chatInfoPage =
    document.getElementById("chatInfoPage");

const closeChatInfo =
    document.getElementById("closeChatInfo");

const infoContactAvatar =
    document.getElementById("infoContactAvatar");

const infoContactName =
    document.getElementById("infoContactName");

const infoContactStatus =
    document.getElementById("infoContactStatus");


// OPEN FRIEND PROFILE
if (contactProfileBtn) {

    contactProfileBtn.addEventListener("click", () => {

        if (!chatInfoPage) return;


        // Friend's name
        if (infoContactName) {
            infoContactName.textContent = contactName;
        }


        // Friend's profile picture
        if (infoContactAvatar) {

            const headerAvatar =
                document.getElementById("contactAvatar");

            if (headerAvatar && headerAvatar.src) {
                infoContactAvatar.src =
                    headerAvatar.src;
            }
        }


        // Friend's status
        if (infoContactStatus) {
            infoContactStatus.textContent = "online";
        }


        // Open profile
        chatInfoPage.classList.add("show");

    });

}


// CLOSE FRIEND PROFILE
if (closeChatInfo) {

    closeChatInfo.addEventListener("click", () => {

        if (chatInfoPage) {
            chatInfoPage.classList.remove("show");
        }

    });

}