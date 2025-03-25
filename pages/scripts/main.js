const createroomBtn = document.getElementById('createroom');
const joinroomBtn = document.getElementById('joinroom');
const menuBtn = document.getElementById('menubtn');
const gridEle = document.getElementsByClassName('grid-element');

localStorage.clear();

menuBtn.addEventListener('click', () => {
    if (menuBtn.classList.contains('active')) {
        createroomBtn.classList.add('show');
        joinroomBtn.classList.add('show');
    } else {
        createroomBtn.classList.remove('show');
        joinroomBtn.classList.remove('show');
    }
})

createroomBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const baseURL = location.href;

    location.replace(`${baseURL}createroom`);
})

joinroomBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const baseURL = location.href;

    location.replace(`${baseURL}joinroom`);
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

Array.from(gridEle).forEach(element => {
    element.addEventListener('click', () => {
        const data = {
            name: `You`,
            roomGenere: `${element.value}`,
            password: `12345678`
        }
        localStorage.setItem('approve', true);
        localStorage.setItem('player', "You");

        let baseURL = location.href + "createroom";
        postData(baseURL, data, "POST")
    })
})