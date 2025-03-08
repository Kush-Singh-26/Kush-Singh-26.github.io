const darkToggleBtn = document.querySelector("#dark-toggle");
const body = document.body;
let isDark = localStorage.getItem('darkMode') === 'true';

if (isDark) {
    enableDarkMode();
}

darkToggleBtn.addEventListener('click', () => {
    isDark = !isDark;
    localStorage.setItem('darkMode', isDark);
    
    if (isDark) {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
});

function enableDarkMode() {
    body.classList.add('dark');
    darkToggleBtn.innerHTML = '<span class="material-icons" style="color: yellow;">light_mode</span>';
}

function disableDarkMode() {
    body.classList.remove('dark');
    darkToggleBtn.innerHTML = '<span class="material-icons">dark_mode</span>';
}