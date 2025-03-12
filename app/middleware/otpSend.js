const nodemailer = require('nodemailer');
const db = require('../database/db');
require('dotenv').config();
const logger = require('../services/logger')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
});

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPToEmail(email) {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    try {
        const otps = await db.OTPS.create({
            email, otp, expiresAt
        })
    
        const info = await transporter.sendMail({
            from: '"vishal bhilavala" <vishalbhilavala@gmail.com>',
            to: email,
            subject: "Set New Password ✔",
            text: "We Send a otp Please confirm its you",
            html: `Verify Using This Otp : <b>${otp}</b>
            <p><b>Note: </b>Otp will expire in 5 Minutes</p>`,
          });
    } catch (error) {
        logger.error(error);
    }
}

module.exports = sendOTPToEmail