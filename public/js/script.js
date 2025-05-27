const socket = io("https://web-speech-ai-2uvz.onrender.com/")

const speakButton = document.querySelector('#click-button')
const userOutput = document.querySelector('#userText')
const botOutput = document.querySelector('#botText')
const botFace = document.querySelector('.bot-face')
const stopButton = document.querySelector('.stop-button')
const speechStatus = document.querySelector('.track-speech')
const userInput = document.querySelector('#userInput')
const sendButton = document.querySelector('#sendButton')
console.log(speakButton, userOutput, botOutput, stopButton)

//speech recognition - to transcribe users word to text string
const speechRecognition = window.speechRecognition || window.webkitSpeechRecognition;

const recognition = new speechRecognition()

recognition.lang = 'en-US'
recognition.interimResults = false;
recognition.maxAlternatives = 1

speakButton.addEventListener('click', ()=>{
    console.log("buutton has  been clicked")
    recognition.start()
    speechStatus.textContent = 'Speak Now.'
})

recognition.addEventListener('speechstart', ()=>{
    console.log("speech has been detected")
    botFace.classList.add('bot-listening')
    speechStatus.textContent = 'Listening...'
})

recognition.addEventListener('speechend', ()=>{
    console.log("speech has stopped being detected")
    botFace.classList.remove('bot-listening')
});

recognition.addEventListener('error', (e)=>{
    userOutput.textContent = `Error: ${e.error}`
})

recognition.addEventListener('result', (e)=>{
    console.log(e.results.length)
    let last = e.results.length - 1;
    let text = e.results[last][0].transcript;
    userOutput.textContent = text

    socket.emit('chat message', text)

    function synthVoice(textInput){
        window.speechSynthesis.cancel()
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance()
        utterance.text = textInput;
        utterance.addEventListener('end', ()=>{
            botFace.classList.remove('pulse')
            speechStatus.textContent=""    
        })
        synth.speak(utterance)
    }

    socket.off('bot reply')
    socket.on('bot reply', (data)=>{
        botFace.classList.add('pulse')
        synthVoice(data)

        if (data === '') botOutput.textContent = 'No Answer'
        speechStatus.textContent = "Bot Speaking..."
        botOutput.textContent = data
    });
})

// Text input and send button functionality
sendButton.addEventListener('click', () => {
    const text = userInput.value.trim()
    if (text) {
        userOutput.textContent = text
        socket.emit('chat message', text)
        userInput.value = '' // Clear the input after sending
        
        socket.off('bot reply')
        socket.on('bot reply', (data) => {
            if (data === '') botOutput.textContent = 'No Answer'
            botOutput.textContent = data
        })
    }
})

// Allow sending message with Enter key
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault() // Prevent new line
        sendButton.click()
    }
})

//speech synthesis - to read out the bot response
stopButton.addEventListener('click', ()=>{
    window.speechSynthesis.cancel()
})
