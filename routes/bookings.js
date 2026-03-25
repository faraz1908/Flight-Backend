const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');

// ✅ ENV based transporter (IMPORTANT)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ✅ Verify connection (server start pe check hoga)
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Email Server Error:", error);
    } else {
        console.log("✅ Email Server Ready");
    }
});

router.post('/confirm', async (req, res) => {
    const { flightId, passengerName, age, gender, email, travelDate } = req.body;

    try {
        // 🔍 Debug logs (important for live)
        console.log("Incoming Booking Request:", req.body);
        console.log("EMAIL_USER:", process.env.EMAIL_USER);

        const flight = await Flight.findById(flightId);
        if (!flight) {
            return res.status(404).json({ msg: "Flight not found" });
        }

        // ✅ Save booking
        const newBooking = new Booking({
            flight: flightId,
            passengerName,
            age,
            gender,
            email,
            travelDate
        });

        await newBooking.save();

        // ✅ Email Template
        const mailOptions = {
            from: `"Flight Booking" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `E-Ticket Confirmation: ${flight.source} to ${flight.destination}`,
            html: `
                <div style="font-family: Arial; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                    
                    <h2 style="text-align:center; color:#1a73e8;">✈️ Booking Confirmed</h2>

                    <p>Hello <b>${passengerName}</b>,</p>
                    <p>Your flight has been successfully booked. Here are your details:</p>

                    <table style="width:100%; margin-top:15px;">
                        <tr><td><b>Airline:</b></td><td>${flight.airline} (${flight.flightNumber})</td></tr>
                        <tr><td><b>Date:</b></td><td>${travelDate}</td></tr>
                        <tr><td><b>Route:</b></td><td>${flight.source} → ${flight.destination}</td></tr>
                        <tr><td><b>Time:</b></td><td>${flight.departureTime}</td></tr>
                        <tr><td><b>Fare:</b></td><td>₹${flight.price}</td></tr>
                    </table>

                    <p style="margin-top:20px;">We wish you a happy journey ✈️</p>

                    <hr/>
                    <p style="font-size:12px; text-align:center; color:gray;">
                        This is an automated email. Do not reply.
                    </p>
                </div>
            `
        };

        // ✅ Send Mail (Promise version - better)
        await transporter.sendMail(mailOptions);

        // ✅ Final response
        res.json({
            success: true,
            msg: "Booking confirmed & email sent",
            booking: newBooking
        });

    } catch (err) {
        console.error("❌ Booking Error:", err);

        res.status(500).json({
            success: false,
            msg: "Server Error",
            error: err.message
        });
    }
});

module.exports = router;