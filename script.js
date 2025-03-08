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

function createMobileNav() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelector('.nav-links');
    
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.classList.add('mobile-menu-btn');
    mobileMenuBtn.innerHTML = '<span class="material-icons">menu</span>';
    
    navbar.insertBefore(mobileMenuBtn, darkToggleBtn);
    
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        
        if (navLinks.classList.contains('active')) {
            mobileMenuBtn.innerHTML = '<span class="material-icons">close</span>';
        } else {
            mobileMenuBtn.innerHTML = '<span class="material-icons">menu</span>';
        }
    });
    
    // Close mobile menu when a link is clicked
    const navLinksArray = document.querySelectorAll('.nav-links a');
    navLinksArray.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileMenuBtn.innerHTML = '<span class="material-icons">menu</span>';
        });
    });
}

//
