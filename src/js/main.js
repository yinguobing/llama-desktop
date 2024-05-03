const { invoke } = window.__TAURI__.core;

let msgInputEl;
let sendButtonEl;
async function process() {
    showUserMessage(msgInputEl.value, getCurrentTimestamp());
    let msg = await invoke("process", { msg: msgInputEl.value });
    showBotMessage(msg, getCurrentTimestamp());
}

/**
 * 触发操作
 */
window.addEventListener("DOMContentLoaded", () => {
    msgInputEl = document.querySelector("#msg_input");
    sendButtonEl = document.querySelector("#send_button");

    document.querySelector("#input_form").addEventListener("submit", (e) => {
        e.preventDefault();
        process();
        msgInputEl.value = "";
        msgInputEl.focus();
        sendButtonEl.disabled = true;
    });

    msgInputEl.addEventListener("input", (e) => {
        e.preventDefault();
        if (msgInputEl.value != "") {
            sendButtonEl.disabled = false;
        } else {
            sendButtonEl.disabled = true;
        }
    });
});

/**
 * Returns the current datetime for the message creation.
 */
function getCurrentTimestamp() {
    return new Date();
}

/**
 * Renders a message on the chat screen based on the given arguments.
 * This is called from the `showUserMessage` and `showBotMessage`.
 */
function renderMessageToScreen(args) {
    // local variables
    let messagesContainer = $('#msgbox');

    // init element
    let message = $(`
	<li class="message ${args.message_side}">
		<div class="avatar"></div>
		<div class="text_wrapper">
			<div class="text">${args.text}</div>
		</div>
	</li>
	`);

    // add to parent
    messagesContainer.append(message);

    // animations
    setTimeout(function () {
        message.addClass('appeared');
    }, 0);
    messagesContainer.scrollTop(messagesContainer.prop('scrollHeight'));
}

/* Sends a message when the 'Enter' key is pressed.
 */
$(document).ready(function () {
    $('#msg_input').keydown(function (e) {
        // Check for 'Enter' key
        if (e.key === 'Enter') {
            // Prevent default behavior of enter key
            e.preventDefault();
            // Trigger send button click event
            $('#send_button').click();
        }
    });
});

/**
 * Displays the user message on the chat screen. This is the right side message.
 */
function showUserMessage(message, datetime) {
    renderMessageToScreen({
        text: message,
        time: datetime,
        message_side: 'right',
    });
}

/**
 * Displays the chatbot message on the chat screen. This is the left side message.
 */
function showBotMessage(message, datetime) {
    renderMessageToScreen({
        text: message,
        time: datetime,
        message_side: 'left',
    });
}

/**
 * Set initial bot message to the screen for the user.
 */
$(window).on('load', function () {
    showBotMessage('你好!');
});
