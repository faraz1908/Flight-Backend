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

        const newBooking = new Booking({
            flight: flightId,
            passengerName,
            age,
            gender,
            email,
            travelDate
        });
        await newBooking.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `E-Ticket Confirmation: ${flight.source} to ${flight.destination}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                    <div style="text-align: center; border-bottom: 2px solid #1a73e8; padding-bottom: 10px;">
                        <h2 style="color: #1a73e8; margin: 0;">Booking Confirmation</h2>
                    </div>
                    
                    <p style="font-size: 16px; color: #333;">Dear <strong>${passengerName}</strong>,</p>
                    <p style="color: #666;">Your flight reservation has been successfully confirmed. Please find your travel details below:</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Airline:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${flight.airline} (${flight.flightNumber})</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Departure Date:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${travelDate}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Route:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${flight.source} to ${flight.destination}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Departure Time:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${flight.departureTime}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Total Fare:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${flight.price}</td>
                        </tr>
                    </table>

                    <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; text-align: center;">
                        <p style="margin: 0; font-size: 14px; color: #555;">Thank you for choosing our service. We wish you a pleasant and safe journey!</p>
                    </div>
                    
                    <div style="margin-top: 20px; font-size: 12px; color: #999; text-align: center;">
                        This is an automated confirmation email. Please do not reply to this message.
                    </div>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ msg: "Booking saved, but email delivery failed." });
            }
            res.json({ msg: "Success", booking: newBooking });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;