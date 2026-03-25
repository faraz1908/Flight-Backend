const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
    }
});

router.post('/confirm', async (req, res) => {
    const { flightId, passengerName, age, gender, email, travelDate } = req.body;

    try {
        const flight = await Flight.findById(flightId);
        if (!flight) return res.status(404).json({ msg: "Flight not found" });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `E-Ticket Confirmation: ${flight.source} to ${flight.destination}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                    <h2 style="color: #1a73e8; text-align: center;">Booking Confirmed! ✈️</h2>
                    <p>Dear <strong>${passengerName}</strong>,</p>
                    <p>Your flight ticket has been successfully booked. Details are below:</p>
                    <hr>
                    <p><strong>Flight:</strong> ${flight.airline} (${flight.flightNumber})</p>
                    <p><strong>Date of Journey:</strong> ${travelDate}</p> <p><strong>Route:</strong> ${flight.source} ➔ ${flight.destination}</p>
                    <p><strong>Departure Time:</strong> ${flight.departureTime}</p>
                    <p><strong>Fare Paid:</strong> ₹${flight.price}</p>
                    <hr>
                    <p style="text-align: center; color: #888;">Wish you a safe and happy journey!</p>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) return res.status(500).json({ msg: "Email failed" });
            res.json({ msg: "Success" });
        });

    } catch (err) {
        res.status(500).send('Server Error');
    }
});
module.exports = router;