const express = require('express');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your_jwt_secret'; 

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'qadeershiza22@gmail.com',
    pass: 'txit zjtn wfxt uvuh',
  },
});

app.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send('Email is required');
  }

  try {
    const otp = Math.floor(1000 + Math.random() * 9000); 
    const expiration = moment().add(2, 'minutes').unix(); 

    const token = jwt.sign({ otp, expiration }, JWT_SECRET, { expiresIn: '2m' });

    await transporter.sendMail({
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`,
    });

    res.status(200).send({ message: 'OTP sent successfully', token });
  } catch (error) {
    res.status(500).send('Error sending OTP');
  }
});

app.post('/verify-otp', (req, res) => {
  const { token, enteredOtp } = req.body;

  if (!token || !enteredOtp) {
    return res.status(400).send('Token and OTP are required');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { otp, expiration } = decoded;

    if (moment().unix() > expiration) {
      return res.status(400).send('OTP has expired');
    }

    if (parseInt(enteredOtp) !== otp) {
      return res.status(400).send('Invalid OTP');
    }

    res.status(200).send('OTP verified successfully');
  } catch (error) {
    res.status(500).send('Error verifying OTP');
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
