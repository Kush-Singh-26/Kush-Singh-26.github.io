let isDark = false;
const darkbtn = document.querySelector("#dark-toggle")
const body = document.body;

darkbtn.addEventListener('click',() => {
    isDark = !isDark;
    body.classList.toggle('dark');

    darkbtn.innerHTML = isDark 
    ? '<span class="material-icons"  style="color : yellow;">light_mode</span>' 
    : '<span class="material-icons">dark_mode</span>'; 
});