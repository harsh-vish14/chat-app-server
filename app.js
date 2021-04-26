const express = require('express');
require('dotenv').config();
const socket = require('socket.io');
const http = require('http');
const PORT = process.env.PORT || 4000;
const app = express();
const server = http.createServer(app);
const firebase = require('firebase');
const config = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGE_SENDER_ID,
  appId: process.env.APP_ID
};
const firebaseApp = firebase.initializeApp(config);
const db = firebaseApp.firestore()

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    next();
})
const io = socket(server);

io.on('connection', (socket) => {
    socket.on('chat-input', (data) => {
        socket.broadcast.emit(`message-came-${data.channelId}`, data.chatDetails);
        db.collection('channels').doc(data.channelId).update({
            chat: firebase.firestore.FieldValue.arrayUnion(data.chatDetails)
        })
    })
    socket.on('new-users-entered', (data) => {
        socket.broadcast.emit(`chat-${data.chatId} `, data);
    })
    socket.on('disconnect', () => {
        console.log('user joint disconnected');
    })

})


app.get('/', (req, res) => {
    res.send({
        message: 'hello from server new update'
    })
})


server.listen(PORT, () => {
    console.log(`server is on port ${PORT}`);
})
