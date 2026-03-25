const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');

// 🔍 1. Search Flights (Frontend ke liye sabse zaroori)
router.get('/search', async (req, res) => {
    const { from, to } = req.query;
    try {
        // Regex use kar rahe hain taaki case-insensitive search ho (Udaipur ya udaipur dono chale)
        const flights = await Flight.find({
            source: { $regex: new RegExp(from, "i") },
            destination: { $regex: new RegExp(to, "i") }
        });
        res.json(flights);
    } catch (err) {
        console.error("Search Error:", err);
        res.status(500).json({ msg: "Search failed" });
    }
});

// ✈️ 2. Get Single Flight Details (Booking page ke liye)
router.get('/:id', async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id);
        if (!flight) return res.status(404).json({ msg: "Flight not found" });
        res.json(flight);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});

// 📋 3. Sabhi flights get karne ke liye (Admin View)
router.get('/all/list', async (req, res) => {
    try {
        const flights = await Flight.find();
        res.json(flights);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});

// ➕ 4. Nayi Flight Add karne ke liye
router.post('/add', async (req, res) => {
    try {
        console.log("Incoming Data:", req.body);
        const newFlight = new Flight(req.body);
        await newFlight.save();
        res.json({ msg: "Flight Added Successfully!", flight: newFlight });
    } catch (err) {
        console.error("Mongoose Save Error:", err);
        res.status(500).json({ msg: "Add Failed", error: err.message });
    }
});

// 📝 5. Flight Update karne ke liye
router.put('/update/:id', async (req, res) => {
    try {
        const updatedFlight = await Flight.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedFlight);
    } catch (err) {
        res.status(500).json({ msg: "Update Failed" });
    }
});

// 🗑️ 6. Flight Delete karne ke liye
router.delete('/delete/:id', async (req, res) => {
    try {
        await Flight.findByIdAndDelete(req.params.id);
        res.json({ msg: "Flight Deleted" });
    } catch (err) {
        res.status(500).json({ msg: "Delete Failed" });
    }
});

module.exports = router;