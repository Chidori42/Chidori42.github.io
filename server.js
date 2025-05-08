const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// POST endpoint to handle email sending
app.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.elasticemail.com',
      port: 2525,
      secure: false,  // Use TLS (true) or not (false)
      auth: {
        user: 'rcabdw@gmail.com',
        pass: '645810428DDE0192597E4CAA3F5A51B11803'
      }
    });

    // Send email
    await transporter.sendMail({
      from: `"Website Contact" <rcabdw@gmail.com>`,
      to: 'rcabdw@gmail.com',
      subject: `New message from ${name}`, 
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `Name: ${name}<br>Email: ${email}<br>Message: ${message}`, 
    });

    // Send success response
    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

// Start server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
