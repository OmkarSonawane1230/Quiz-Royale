const { initializeApp } = require('firebase/app');
const { getDatabase, ref, onValue, set } = require('firebase/database');

const express = require('express');
const path = require('path');
const app = express();
const port = 5500;

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, './pages')));

const appSettings = {
    databaseURL: "https://quiz-royale-6af4a-default-rtdb.asia-southeast1.firebasedatabase.app/"
}

const initialiseApp = initializeApp(appSettings);
const database = getDatabase(initialiseApp);
const usersDB = ref(database, "users");

onValue(usersDB, (snapshot) => {
    console.log("User Database updated..");
})

// End Points

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/index.html'));
})

app.get('/createroom', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/createroom.html'));
})

app.get('/joinroom', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/joinroom.html'));
})

app.get('/room/:roomId', (req, res) => {
    const { roomId } = req.params;
    // const data = JSON.parse(JSON.stringify(req.body))
    console.log("hello welcome: ", roomId);
    

    // Room is valid, you can now allow the user to join the game
    res.sendFile(path.join(__dirname, '/pages/room.html'));
});

// Helper function to generate a unique room ID (you can use uuid or other methods)
function generateRoomId() {
    return Math.random().toString(36).substring(2, 10);
}

/*** Creating a Room ***/
app.post('/createroom', async (req, res) => {
    const data = JSON.parse(JSON.stringify(req.body))
    console.log(data)

    const db = getDatabase();
    const userName = data['name'];

    // Generate a unique room ID
    const roomId = generateRoomId();
    data['roomId'] = roomId;
    set(ref(db, 'users/' + userName), data);
    
    // Send the generated room link
    const roomLink = `https://sturdy-space-doodle-q7v49xjv4rrr347pj-5500.app.github.dev/room/${roomId}`;
    
    // Redirect to the generated room link
    res.redirect(roomLink);  // Redirect the user to the generated room link
});

app.listen(port, () => {
    console.log(`listening on port http:/localhost:${port}`)
})