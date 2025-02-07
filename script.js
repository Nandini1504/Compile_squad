let promptInput = document.querySelector("#prompt");
let chatContainer = document.querySelector(".chat-container");
let aiSelection = document.querySelector("#aiSelection");
let selectedAI = aiSelection.value; // Default AI Model

const API_URLS = {
    gemini: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDliZeiWoNgfeOvMtZGVtsTM-DLOJ0R-Do",
    openai: "https://api.openai.com/v1/chat/completions",
    huggingface: "https://api-inference.huggingface.co/models/gpt2key=curser"
};

let user = {
    data: null,
};

function getGreeting() {
    const hour = new Date().getHours();
    let greeting;

    if (hour < 12) {
        greeting = "Good Morning!";
    } else if (hour < 18) {
        greeting = "Good Afternoon!";
    } else {
        greeting = "Good Evening!";
    }
    return greeting;
}

document.getElementById('greeting').textContent = getGreeting();

// Handle AI selection change
aiSelection.addEventListener("change", (event) => {
    selectedAI = event.target.value;
    console.log("Selected AI Model:", selectedAI);
});

// Function to send request to the selected AI model
async function generateResponse(aiChatBox) {
    let text = aiChatBox.querySelector(".ai-chat-area");
    
    let requestBody;
    let requestHeaders = { 'Content-Type': 'application/json' };

    // Prepare request based on selected AI model
    if (selectedAI === "gemini") {
        requestBody = {
            "contents": [{ "parts": [{ "text": user.data }] }]
        };
    } else if (selectedAI === "openai") {
        requestBody = {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: user.data }]
        };
        requestHeaders["Authorization"] = "Bearer YOUR_OPENAI_API_KEY";
    } else if (selectedAI === "huggingface") {
        requestBody = {
            model: "claude-2",
            prompt: user.data,
            max_tokens_to_sample: 300
        };
        requestHeaders["x-api-key"] = "YOUR_ANTHROPIC_API_KEY";
    }

    try {
        let response = await fetch(API_URLS[selectedAI], {
            method: "POST",
            headers: requestHeaders,
            body: JSON.stringify(requestBody)
        });

        let data = await response.json();
        let apiResponse = "";

        if (selectedAI === "gemini") {
            apiResponse = data.candidates[0].content.parts[0].text.trim();
        } else if (selectedAI === "openai") {
            apiResponse = data.choices[0].message.content.trim();
        } else if (selectedAI === "huggingface") {
            apiResponse = data.completion.trim();
        }

        text.innerHTML = apiResponse;
    } catch (error) {
        console.log(error);
        text.innerHTML = "Error fetching response. Please try again.";
    } finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
    }
}

// Function to create chat message box
function createChatBox(html, classes) {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

// Function to handle user input and AI response
function handleChatResponse(message) {
    user.data = message;

    let userHtml = `
        <img id="userImage" src="user.png" alt="userImage" width="60">
        <div class="user-chat-area">${user.data}</div>
    `;
    promptInput.value = "";

    let userChatBox = createChatBox(userHtml, "user-chat-box");
    chatContainer.appendChild(userChatBox);
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

    setTimeout(() => {
        let aiHtml = `
            <img id="aiImage" src="ai.png" alt="aiImage" width="60">
            <div class="ai-chat-area">
                <img class="load" src="loading.gif" alt="Loading..." width="50px">
            </div>
        `;
        let aiChatBox = createChatBox(aiHtml, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);
        generateResponse(aiChatBox);
    }, 600);
}

// Handle user input on Enter key press
promptInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && promptInput.value.trim() !== "") {
        handleChatResponse(promptInput.value);
    }
});

// Handle user input on button click
document.querySelector("#submit").addEventListener("click", () => {
    if (promptInput.value.trim() !== "") {
        handleChatResponse(promptInput.value);
    }
});
