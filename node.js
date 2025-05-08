document.addEventListener('DOMContentLoaded', function() {
   
    document.body.classList.add('dark-mode');
    
    document.getElementById('dark-mode-toggle').addEventListener('click', toggleDarkMode);
});

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

