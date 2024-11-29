let isDark = false;
const darkbtn = document.querySelector("#dark-toggle");
const body = document.body;
const about = document.querySelector(".about");
const eduSections = document.querySelectorAll(".edu");
const a = document.querySelectorAll(".a");
const footer = document.querySelector(".footer");
const h = document.querySelector(".name");

darkbtn.addEventListener('click',() => {
    isDark = !isDark;
    body.classList.toggle('dark');
    about.classList.toggle('dark');
    eduSections.forEach((edu) => edu.classList.toggle("dark"));
    a.forEach((aunit) => aunit.classList.toggle("dark"));
    footer.classList.toggle('dark');
    h.classList.toggle('dark');

    darkbtn.innerHTML = isDark 
    ? '<span class="material-icons"  style="color : yellow;">light_mode</span>' 
    : '<span class="material-icons">dark_mode</span>'; 
});