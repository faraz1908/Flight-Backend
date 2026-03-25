const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    flight:{type:mongoose.Schema.Types.ObjectId, ref:'Flight'},
    passengerName:{type:String , required:true},
    age:{type:Number , required:true},
    gender:{type:String , required:true},
    email:{type:String , required:true},
    bookingDate:{type:Date, default:Date.now} 
});

module.exports = mongoose.model('Booking' , BookingSchema);