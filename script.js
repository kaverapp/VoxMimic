// DOM Elements
let btn = document.querySelector("#btn");
let dropdown = document.querySelector("#languages");
let listenerGif = document.querySelector(".voicegif");
let mouthElement = document.querySelector(".imgvir");  // Assuming .imgvir represents the mouth image

function startMouthMovement() {
    mouthElement.classList.add("mouth-open");    // Add class for opening
    mouthElement.classList.remove("mouth-closed"); // Remove class for closed mouth
}

function stopMouthMovement() {
    mouthElement.classList.remove("mouth-open");  // Remove class for opening
    mouthElement.classList.add("mouth-closed");   // Add class for closed mouth
}

// Function to Speak Text
function speak(txt, lang) {
    let txt_speak = new SpeechSynthesisUtterance(txt);
    txt_speak.rate = 1;
    txt_speak.pitch = 1;
    txt_speak.volume = 1;
    txt_speak.lang = lang;
    
     // Start mouth movement when speech starts
     txt_speak.onstart = () => {
        startMouthMovement();
        mouthElement.setAttribute("src","public\\robotMOuth open talk.jpeg")

    };

    // Stop mouth movement when speech ends
    txt_speak.onend = () => {
        stopMouthMovement();
        mouthElement.setAttribute("src","public\\img wth close d mouth.jpeg")

    };

    window.speechSynthesis.speak(txt_speak);
}

// Function to Handle Greeting on Page Load
function greetUser() {
    let defaultLanguage = dropdown.value;
    let greeting = `Hello, welcome! Good ${wishMe()}`;
    speak(greeting, defaultLanguage);
}

// Function to Wrap Speech Recognition Logic
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        console.log("Speech Recognition not supported");
        return;
    }

    console.log("Speech Recognition supported");
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";  
    recognition.interimResults = false; 
    recognition.maxAlternatives = 1;

    // Start recognition when the button is clicked
    btn.addEventListener("click", () => {
        recognition.start();
        displayListeningState();
    });

    // Handle recognition result
    recognition.addEventListener("result", (event) => {
        let transcript = event.results[0][0].transcript;
        console.log("You said: ", transcript);

       
        updateOutput(`You said: ${transcript}`);
        processSpeech(transcript);
    });

    // Handle end of recognition
    recognition.addEventListener("end", () => {
        console.log("Speech recognition ended");
        endListeningState();
    });

    // Handle recognition errors
    recognition.addEventListener("error", (event) => {
        console.error("Error occurred in speech recognition: ", event.error);
        updateOutput(`Error: ${event.error}`);
    });
}

// Display listening state with GIF and output message
function displayListeningState() {
    document.querySelector("#output").textContent = "Listening...";
    listenerGif.style.display = "block";
}

// End listening state by hiding GIF and updating output
function endListeningState() {
    document.querySelector("#output").textContent += " (Recognition stopped)";
    listenerGif.style.display = "none";
}

// Function to Process Speech and Analyze with Backend
function processSpeech(transcript) {
    let selectedLanguage = dropdown.value; 
    speak(`You said: ${transcript}`, selectedLanguage);

    fetchEntities(transcript).then(entities => {
        displayEntities(entities);
        takeCommand(transcript,entities);
    }).catch(error => {
        console.error('Error fetching entities:', error);
    });
}

// Function to Fetch Entities from Backend
function fetchEntities(text) {
    return fetch("http://127.0.0.1:5000/analyse", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text })
    })
    .then(response => response.json());
}

// Display Entities in the Output Section
function displayEntities(entities) {
    let output = document.querySelector("#output");
    output.innerHTML = "<h3>Entities detected:</h3><ul>";

   
    output.innerHTML += "</ul>";
}



// Microphone Access Permission
function grantMicrophoneAccess() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(() => console.log("Microphone access granted"))
            .catch(err => {
                console.error("Microphone access error: " + err.name);
                alert("Please enable microphone access in your browser settings.");
            });
    } else {
        console.error("getUserMedia not supported by this browser.");
        alert("getUserMedia not supported by your browser.");
    }

    navigator.permissions.query({ name: 'microphone' }).then((result) => {
        console.log(result.state);  // granted, denied, or prompt
    });
}

// Retrieve and Display Available Voices for Speech Synthesis
function getSpeakers() {
    window.speechSynthesis.onvoiceschanged = function () {
        let voices = window.speechSynthesis.getVoices();
        console.log(voices);
    };
}

// Function to Wish Based on the Time of Day
function wishMe() {
    let state = "";
    let date = new Date();
    let hour = date.getHours();

    if (hour >= 0 && hour < 12) {
        state = "morning";
    } else if (hour >= 12 && hour < 15) {
        state = "afternoon";
    } else if (hour >= 15 && hour < 18) {
        state = "evening";
    } else {
        state = "night";
    }
    return state;
}

// Function to Update Output
function updateOutput(text) {
    let output = document.querySelector("#output");
    output.textContent = text;
}

// Initialize on Page Load
window.addEventListener("DOMContentLoaded", () => {
    greetUser();
    initSpeechRecognition();
    grantMicrophoneAccess();
});

function takeCommand(transcript,entities){
    let wordsInTranscript=transcript.split(" ")
    let shouldOpen=wordsInTranscript.some(word => word.toLowerCase().includes("open"));
    let shouldSearch=wordsInTranscript.some(word => word.toLowerCase().includes("search"));
    
    const timeKeyword=["time","what is the time","current time","tell me the time"];
    let timeSearch = wordsInTranscript.some(word => 
        timeKeyword.some(keyword => word.toLowerCase().includes(keyword))
    );
   // entities.forEach(ent => {
      //  output.innerHTML += `<li><strong>Text:</strong> ${ent.text}, <strong>Label:</strong> ${ent.label}</li>`;
       
   
    if(/*ent.text && ent.label==="ORG"*/  shouldOpen){
        try {
            let searchText=transcript.replace(/open/i,"").trim();
            let capitalise=searchText.toLowerCase().replace(/[^a-z0-9]/g, ""); // Remove unwanted characters
            
                let opening="Opening organization URL...";
                speak(opening,"en-US");
                let orgUrl = `https://www.${capitalise}.com/`;

                let DesktopUrl=`${capitalise}://`

                // Attempt to open the URL in a new tab
                if(!window.open(orgUrl)){
                    console.warn('Failed to open  URL, falling back to web URL.');
                    window.open(DesktopUrl)
                    //window.open(orgUrl, '_blank');
                }
            }
        catch (error) {
            console.error('Failed to open organization URL:', error);
        }     
       } ;
   // }); 
    if(shouldSearch){
        let searchText=transcript.replace(/search/i,"").trim();
        let capitalise=searchText.toLowerCase();
        
        let searchUrl=`https://www.bing.com/search?pglt=163&q=${encodeURIComponent(capitalise)}`

        
        speak(`Searching for ${searchUrl}`, "en-US");
        window.open(searchUrl, "_blank");

    }
    if (timeSearch) {
        let date = new Date();
        let time = date.toLocaleTimeString();  // Corrected to get the current time as a string
        speak(`The current time is ${time}`, "en-US");
    }
}


