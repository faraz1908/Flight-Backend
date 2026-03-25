const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');

router.post('/confirm', async (req, res) => {
    const { flightId, passengerName, age, gender, email, travelDate } = req.body;

    try {
        console.log("Incoming Booking Request:", req.body);

        // ✅ Flight check
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

        // ✅ Only success response (NO EMAIL HERE)
        res.json({
            success: true,
            msg: "Booking saved successfully",
            booking: newBooking,
            flightDetails: {
                airline: flight.airline,
                flightNumber: flight.flightNumber,
                source: flight.source,
                destination: flight.destination,
                price: flight.price
            }
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