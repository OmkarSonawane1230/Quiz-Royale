const { initializeApp } = require('firebase/app');
const { getDatabase, onValue, ref, query, onChildAdded, orderByChild, startAt, endAt, get, set } = require('firebase/database');

// import the Genkit and Google AI plugin libraries
const { gemini20Flash, googleAI } = require('@genkit-ai/googleai');
const { genkit } = require('genkit');
const { z } = require('genkit');

// configure a Genkit instance
const ai = genkit({
    plugins: [googleAI()],
    model: gemini20Flash, // set default model
});


// Function to generate and log MCQ
const MCQSchema = z.object({
    question: z
        .string()
        .describe("The question text (Required, max 500 characters)"),

    options: z
        .array(z.string().max(200).min(1))
        .describe("The list of answer options (Required 4 options and max 200 characters)"),

    correct_answer: z
        .string()
        .describe("The correct answer (Required, should match one of the options)"),

    additional_info: z
        .string()
        .describe("Any extra information or explanation for the answer (Optional)"),
}).array()
    .describe("minimum 10 Multiple Choice Question");


async function generateMCQ(topic) {
    const { output } = await ai.generate({
        prompt: `Generate multiple-choice question on following topic: ${topic}`,
        output: { schema: MCQSchema }
    });

    return output;
}

const express = require('express');
const path = require('path');
const app = express();
const port = 5500;

const bodyParser = require('body-parser');
const { stringify } = require('querystring');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, '/pages')));

const appSettings = {
    databaseURL: "https://quiz-royale-6af4a-default-rtdb.asia-southeast1.firebasedatabase.app/"
}

const initialiseApp = initializeApp(appSettings);
const database = getDatabase(initialiseApp);
const usersDB = ref(database, "users");
const questionAnswerDB = ref(database, "questionAnswers");
const playersDB = ref(database, "players")
let currentRecord;

// Listen for new user additions only
onChildAdded(usersDB, (snapshot) => {
    const newUser = snapshot.val();  // The newly added user data
    currentRecord = newUser['roomId'];
});

onValue(usersDB, (snapshot) => {
    console.log("User Database updated..");
})

onValue(questionAnswerDB, (snapshot) => {
    console.log("Question Answer Database updated..");
})

onValue(playersDB, (snapshot) => {
    console.log("Players Database updated..");
})

// End Points
app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/index.html'));
})

app.get('/createroom', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/createroom.html'));
})

app.get('/room-:roomId', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/room.html'))
});

app.get('/joinroom', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/joinroom.html'))
})

app.get('/joinroom-:roomid', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/joinroom.html'))
})

/*** Creating a Room ***/
app.post('/createroom', async (req, res) => {
    const data = JSON.parse(JSON.stringify(req.body))
    console.log("room created...");

    const db = getDatabase();

    const result = await generateMCQ(data.roomGenere);

    // Generate a unique room ID
    const roomId = Math.random().toString(36).substring(2, 10);
    data['roomId'] = roomId;

    searchTermLower = data['name']

    const usersQuery = query(
        usersDB,
        orderByChild('name'), // Order by 'name' field
        startAt(searchTermLower), // Search starts from the given term
        endAt(searchTermLower + '\uf8ff') // End search to include all characters after searchTerm
    );

    // Get the data from Firebase
    const snapshot = await get(usersQuery);

    if (snapshot.exists()) {
        // Return the results (users that match the search criteria)
        record = snapshot.val();

        if (record['name'] == searchTermLower) {
            console.log("Record Already Exist");
        }
    } else {
        result['roomId'] = data['roomId'];
        const playerData = {
            score: 0
        }
        set(ref(db, 'users/' + data['roomId']), data);
        set(ref(db, 'questionAnswers/' + data['roomId']), result);

        const roomRef = ref(db, `players/${data['roomId']}/${data['name']}`);

        // Set the player data in the room
        set(roomRef, playerData)
    }

    res.redirect(`https://sturdy-space-doodle-q7v49xjv4rrr347pj-5500.app.github.dev/room-${currentRecord}`);
});

app.post('/joinroom', async (req, res) => {
    const data = JSON.parse(JSON.stringify(req.body));
    console.log(data)
    searchTermLower = data['g_roomid'];
    console.log("-----", searchTermLower)

    const db = getDatabase();

    const usersQuery = query(
        usersDB,
        orderByChild('roomId'), // Order by 'name' field
        startAt(searchTermLower), // Search starts from the given term
        endAt(searchTermLower + '\uf8ff') // End search to include all characters after searchTerm
    );

    // Get the data from Firebase
    const snapshot = await get(usersQuery);

    if (snapshot.exists()) {
        // Return the results (users that match the search criteria)
        let record = snapshot.val()[searchTermLower];
        console.log("----", record.password);

        if (record.roomId === searchTermLower && record.password == data.password) {
            const playerData = {
                score: 0
            }
            const roomRef = ref(db, `players/${data['g_roomid']}/${data['name']}`);

            // Set the player data in the room
            set(roomRef, playerData)

            res.json({ 'approve': true });
        } else {
            res.json({ 'approve': false });
        }
    } else {
        res.json({ 'approve': false });
    }
})

app.post('/room', async (req, res) => {
    const data = JSON.parse(JSON.stringify(req.body));
    console.log("*********************", data)


    /*** Update player score ***/
    const playerRef = ref(database, `players/${data['room_id']}/${data['player']}/score`);
    let currentScore;

    // Use the transaction method to safely increment the score
    get(playerRef).then((snapshot) => {
        if (snapshot.exists()) {
            currentScore = snapshot.val();
        } else {
            console.log('Player does not exist or no score found');
        }
    })


    searchTermLower = data['room_id'];

    const usersQuery = query(
        questionAnswerDB,
        orderByChild('roomId'), // Order by 'name' field
        startAt(searchTermLower), // Search starts from the given term
        endAt(searchTermLower + '\uf8ff') // End search to include all characters after searchTerm
    );

    // Get the data from Firebase
    const snapshot = await get(usersQuery);

    if (snapshot.exists()) {
        // for checking if player choose correction option
        if (data['q_index'] != 0) {
            let recordCheck = snapshot.val()[searchTermLower][data['q_index'] - 1];
            console.log(recordCheck['correct_answer'], " === ", data['answer']);

            if (recordCheck['correct_answer'] === data['answer']) {
                set(playerRef, (currentScore + 1))
            }
        }

        // Return the results (users that match the search criteria)
        let record = snapshot.val()[searchTermLower][data['q_index']];
        res.json(record);

    } else {
        console.log(record)
        res.json({ 'approve': false });
    }
})

app.post('/players', async (req, res) => {
    const data = JSON.parse(JSON.stringify(req.body));
    console.log(data)

    searchTermLower = data['room_id'];

    const roomRef = ref(database, `players/${searchTermLower}`);

    // Fetch the data once
    get(roomRef).then((snapshot) => {
        if (snapshot.exists()) {
            const players = snapshot.val();
            res.json(players);
        } else {
            console.log('No players found in this room');
        }
    }).catch((error) => {
        console.error('Error fetching players:', error);
    });
})

app.listen(port, () => {
    console.log(`listening on port http:/localhost:${port}`)
})