
require("dotenv").config()

const express = require("express");
const app = express()
const fetch = require('node-fetch') 
const {OpenAI} = require('openai')

const token = process.env.GITHUB_TOKEN
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1";

app.use(express.static(__dirname + "/public"))
app.use(express.static(__dirname + "/views"))

const server = app.listen(process.env.PORT ||  5000, ()=>{
    console.log(`listening to port ${process.env.PORT}`)
})
const io = require('socket.io')(server)



io.on("connection", (socket)=>{
    console.log("user is connected to socket")
})


io.on('connection', function(socket){
    socket.on('chat message', (text)=>{

        console.log(text);
        
        async function fetchResponse(inputText){
            console.log('inside the fetch functtion',inputText);
            try{
                const client = new OpenAI({baseURL: endpoint, apiKey: token})
                const response = await client.chat.completions.create({
                    messages: [
                        {role: "system", content: "You are a helpful assistant. Respond concisely and conversationally."},
                        {role: "user", content: inputText}
                    ],
                    temperature: 0.3,
                    top_p: 1,
                    model
                })
                console.log(response)
                
                console.log(response.choices?.[0].message.content);
                const data = response.choices?.[0].message.content || "No response."
                
                socket.emit('bot reply', data)
            }catch(error){
                socket.emit('The bot encountered an error:', error.message)
            }
        }
        
        fetchResponse(text)
    })
})



app.get('/', (req, res)=>{
    return res.status(200).sendFile('index.html')
})

// const resp = await fetch('https://api.deepai.org/api/text2img', {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json',
//         'api-key': 'YOUR_API_KEY'
//     },
//     body: JSON.stringify({
//         text: "YOUR_TEXT_URL",
//     })
// });