// UI Elements
const submitBtn = document.getElementById('submit');
const backBtn = document.getElementById('back');
const nameEle = document.getElementById('name');
const roomGenere = document.getElementById('roomGenere');
const password = document.getElementById('password');

backBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const baseURL = location.href;
    const len = baseURL.length

    location.replace(baseURL.substring(0, len - 10));
})

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

submitBtn.addEventListener('click', () => {
    let d = new Date()
    d = d.toString()
    const data = {
        name: `${nameEle.value}`,
        roomGenere: `${roomGenere.value}`,
        password: `${password.value}`,
        time: `${d.substring(0, 24)}`,
    }
    
    postData("/createroom", data, "POST")
})

// To get data from server

// const getData = async () => {
//     const response = await fetch('/undetermineInfo')
//     const data = await response.json()
//     for (let i = 0; i < data.length; i++) {
//         user.push(new inventoryManagement)
//         user[i].createUserAccount(data[i].firstName, data[i].lastName, data[i].emailAddress, data[i].password, data[i].time)
//     }
// }