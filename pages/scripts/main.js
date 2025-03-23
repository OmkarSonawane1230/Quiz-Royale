const createroomBtn = document.getElementById('createroom');
const joinroomBtn = document.getElementById('joinroom');
const menuBtn = document.getElementById('menubtn');

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