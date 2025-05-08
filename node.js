document.addEventListener('DOMContentLoaded', function() {
   
    document.body.classList.add('dark-mode');
    
    document.getElementById('dark-mode-toggle').addEventListener('click', toggleDarkMode);
});

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contact-form');

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    try {
      const response = await fetch('http://localhost:3000/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      const result = await response.json();
      alert(result.message); // Show success message
    } catch (error) {
      alert('Failed to send email: ' + error.message); // Show error message
    }
  });
});

