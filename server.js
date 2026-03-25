const mongoose = require('mongoose');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();


app.use(cors());
app.use(express.json());


app.use('/api/auth', require('./routes/auth'));
app.use('/api/flights', require('./routes/flights'));
app.use('/api/bookings' , require('./routes/bookings'));

app.get('/', (req, res) => {
    res.send("Flight Booking API is running...");
});


mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log(" MongoDB connected successfully"))
    .catch(err => console.log(" Connection Error:", err));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(` Server is running on port ${PORT}`));