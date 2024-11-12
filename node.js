document.addEventListener('DOMContentLoaded', function() {
   
    document.body.classList.add('dark-mode');
    
    document.getElementById('dark-mode-toggle').addEventListener('click', toggleDarkMode);
});

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}




document.getElementById('scrollLeft').addEventListener('click', function() {
    document.querySelector('.projects-content').scrollBy({
        left: -300,
        behavior: 'smooth'
    });
});

document.getElementById('scrollRight').addEventListener('click', function() {
    document.querySelector('.projects-content').scrollBy({
        left: 300,
        behavior: 'smooth'
    });
});





document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        Email.send({
            // Get this from your SMTPJS account
            Host : "smtp.elasticemail.com",
            Username : "rcabdw@gmail.com",
            Password : "CC918E904DECED8972D276B045C35F20D44F",
            To: 'rcabdw@gmail.com',
            From: email,
            Subject: "New message from contact form",
            Body: `Name: ${name}<br>Email: ${email}<br>Message: ${message}`
        }).then(
            message => alert(message)
        );
    });
});

