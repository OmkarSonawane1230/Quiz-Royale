const submitBtn = document.getElementById('submit');
const nameEle = document.getElementById('name');
const password = document.getElementById('password');

const baseURL = location.href;
const roomid = baseURL.substring(baseURL.length - 8, baseURL.length);

const roomForm = document.getElementById('room');

if (!baseURL.includes("joinroom-")) {
    roomForm.insertAdjacentHTML('afterbegin', `
         <input type="text" id="room_id" name="room_id" class="br-2 input-ele input-parm" required placeholder="Enter Room Id">
        `)
}


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

submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    let data;
    const rid = document.getElementById('room_id');
    if (!baseURL.includes("joinroom-")) {

        data = {
            name: `${nameEle.value}`,
            password: `${password.value}`,
            g_roomid: `${rid.value}`
        }
    } else {
        data = {
            name: `${nameEle.value}`,
            password: `${password.value}`,
            g_roomid: `${roomid}`
        }
    }
    
    resp = await postData("/joinroom", data, "POST");
    
    localStorage.setItem('approve', resp['approve']);
    
    if (resp['approve']) {
        password.classList.remove('wrong-input');
        localStorage.setItem('player', nameEle.value);
        let url;
        if (!baseURL.includes("joinroom-")) {
            url = `${baseURL.substring(0, baseURL.length - 8)}room-${rid.value}`
        } else {
            url = `${baseURL.substring(0, baseURL.length - 17)}room-${roomid}`;
        }
        location.replace(url);
    } else {
        password.classList.add('wrong-input');
    }
})
