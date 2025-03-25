const submitBtn = document.getElementById('submit');
const exitBtn = document.getElementById('exit');
const mcqQuestion = document.getElementById('mcq-question');
const playerInfo = document.getElementById('playerinfo');

let index = 0, playercount = 0;

if (!localStorage.getItem('approve')) {
    const baseURL = location.href;
    const roomid = baseURL.substring(baseURL.length - 8, baseURL.length);
    location.replace(`${baseURL.substring(0, baseURL.length - 13)}joinroom-${roomid}`);
}

const baseURL = location.href;
const roomid = baseURL.substring(baseURL.length - 8, baseURL.length);

// const url = `/questions-${index}` // Replace with your server URL

async function setQuestion(data) {

    result = await postData("/room", data, "POST");
    
    index++;
    mcqQuestion.innerHTML = `
        <h2 id="question">${result['question']}</h2>
        <hr>
        <div class="multiple-choice">
            <ul class="flex-container mcq-holder">
                <li>
                    <input type="radio" id="radio-1" name="mcq-answer" value="${result['options'][0]}">
                    <label for="radio-1">${result['options'][0]}</l<abel>
                </li>

                <li>
                    <input type="radio" id="radio-2" name="mcq-answer" value="${result['options'][1]}">
                    <label for="radio-2">${result['options'][1]}</label>
                </li>

                <li>
                    <input type="radio" id="radio-3" name="mcq-answer" value="${result['options'][2]}">
                    <label for="radio-3">${result['options'][2]}</label>
                </li>

                <li>
                    <input type="radio" id="radio-4" name="mcq-answer" value="${result['options'][3]}">
                    <label for="radio-4">${result['options'][3]}</label>
                </li>
            </ul>
        </div>
    `
}

let data = {
    room_id: roomid,
    q_index: index,
}

setQuestion(data);

async function postData(url = "", data = {}, method_ = "") {
    const response = await fetch(url, {
        method: method_,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    return response.json();
}

submitBtn.addEventListener('click', async () => {
    var radios = Array.from(document.getElementsByTagName('input'));
    var value;
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            // get value, set checked flag or do whatever you need to
            value = radios[i].value;
        }
    }


    let data = {
        room_id: roomid,
        q_index: index,
        player: `${localStorage.getItem('player')}`,
        answer: value,
    }
    index++;
    console.log(index)

    result = await postData("/room", data, "POST");
    
    mcqQuestion.innerHTML = `
        <h2 id="question">${result['question']}</h2>
        <hr>
        <div class="multiple-choice">
            <ul class="flex-container mcq-holder">
                <li>
                    <input type="radio" id="radio-1" name="mcq-answer" value="${result['options'][0]}">
                    <label for="radio-1">${result['options'][0]}</l<abel>
                </li>

                <li>
                    <input type="radio" id="radio-2" name="mcq-answer" value="${result['options'][1]}">
                    <label for="radio-2">${result['options'][1]}</label>
                </li>

                <li>
                    <input type="radio" id="radio-3" name="mcq-answer" value="${result['options'][2]}">
                    <label for="radio-3">${result['options'][2]}</label>
                </li>

                <li>
                    <input type="radio" id="radio-4" name="mcq-answer" value="${result['options'][3]}">
                    <label for="radio-4">${result['options'][3]}</label>
                </li>
            </ul>
        </div>
    `;
});

async function setPlayerInfo() {
    playerInfo.innerHTML = "";
    const data = {
        room_id: roomid 
    }

    let players = await postData("/players", data, "POST");

    for (const player in players) {
        playercount++;
        playerInfo.insertAdjacentHTML('beforeend', `
                <div class="player flex-container ">
                    <div class="avatar flex-container">
                        <span class="score">${players[player]['score']}</span>
                    </div>
                    <span class="username">${player}</span>
                </div>
            `)
    }

    setInterval(async () => {
        let currentCount = 0, diff;
        players = await postData("/players", data, "POST");
    
        for (const player in players) {
            currentCount++;
            diff = currentCount - playercount;
        }
    
        if (diff > 0) {
            for (let i = diff; i > 0; i--) {
                playerInfo.insertAdjacentHTML('beforeend', `
                    <div class="player flex-container ">
                        <div class="avatar flex-container">
                            <span class="score"></span>
                        </div>
                        <span class="username"></span>
                    </div>
                `)
            }
        }
    
        const score = Array.from(document.getElementsByClassName('score'));
        const username = Array.from(document.getElementsByClassName('username'));
        let i = 0;
        for (const player in players) {
            score[i].innerHTML = players[player]['score'];
            username[i].innerHTML = player;
            i++;
        }
        
        if (playercount < currentCount)
            playercount = currentCount;
        
    }, 1000);
}

setPlayerInfo();


exitBtn.addEventListener('click', () => {
    const baseURL = location.href;

    location.replace(`${baseURL.substring(0, baseURL.length - 13)}`);
})