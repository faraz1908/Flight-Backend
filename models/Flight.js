const mongoose = require('mongoose');

const FlightSchema = new mongoose.Schema({
    flightNumber: { type: String, required: true },
    airline: { type: String, required: true },
    source: { type: String, required: true },
    destination: { type: String, required: true },
    departureTime: { type: String, required: true }, 
    arrivalTime: { type: String, required: true },
    price: { type: Number, required: true },
    availableSeats: { type: Number, default: 60 } 
});

module.exports = mongoose.model('Flight', FlightSchema);