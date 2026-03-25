const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const auth = require('..routes/auth'); // Middleware zaroori hai

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
    }
});

// Yahan 'auth' add kiya hai taaki token check ho sake
router.post('/confirm', auth, async (req, res) => {
    const { flightId, passengerName, age, gender, email, travelDate } = req.body;

    try {
        // 1. Check if flight exists
        const flight = await Flight.findById(flightId);
        if (!flight) return res.status(404).json({ msg: "Flight not found" });

        // 2. Database mein booking save karo (Ye aap bhool gaye the)
        const newBooking = new Booking({
            user: req.user.id, // Auth middleware se milta hai
            flight: flightId,
            passengerName,
            age,
            gender,
            email,
            travelDate
        });
        await newBooking.save();

        // 3. Email Options
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
                    <p><strong>Date of Journey:</strong> ${travelDate}</p> 
                    <p><strong>Route:</strong> ${flight.source} ➔ ${flight.destination}</p>
                    <p><strong>Departure Time:</strong> ${flight.departureTime}</p>
                    <p><strong>Fare Paid:</strong> ₹${flight.price}</p>
                    <hr>
                    <p style="text-align: center; color: #888;">Wish you a safe and happy journey!</p>
                </div>
            `
        };

        // 4. Send Mail & Send Final Response
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Email Error:", error);
                // Agar email fail bhi ho jaye, booking toh ho chuki hai
                return res.json({ msg: "Booking saved but Email failed", booking: newBooking });
            }
            res.json({ msg: "Success", booking: newBooking });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;