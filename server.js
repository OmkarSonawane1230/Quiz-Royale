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

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/index.html'));
})

app.post('/send-user-details', (req, res) => {
    const data = JSON.parse(JSON.stringify(req.body))
    console.log(data)

    const db = getDatabase();
    const userName = data['name']


    set(ref(db, 'users/' + userName), data)
    
    res.send({'status': 'successful'})
})

app.listen(port, () => {
    console.log(`listening on port http:/localhost:${port}`)
})