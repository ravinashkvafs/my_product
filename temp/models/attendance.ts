import mongoose from 'mongoose';
const date = require('./date');

// Beat Schedule Schema.
const attendanceSchema = new mongoose.Schema({

    active: { type: Boolean, required: true, default: true }, //active status (true/false).
    inserted_at: { type: Object, default: date.dateNow() }, //timestamp.
    user: { type: String, required: true, trim: true }, //user.
    attendance: [{
        status: { type: String, trim: true, lowercase: true }, //present/absent name.
        date: { type: Date }, //date of attendance.
        reason: { type: String, trim: true }, //reason.
        at: { type: String, trim: true }, //at meeting/store/office/home.
        checkin: {
            time: { type: String }, //Checkin time.
            remarks: { type: String, trim: true },//Checkin remarks.
            latitude: { type: String, trim: true }, //latitude.
            longitude: { type: String, trim: true }, //longitude.
            image: { type: String, trim: true }, //Checkin Image.
            updated_by: { type: String, required: true, trim: true }, //Updated by user.
        },
        checkout: {
            time: { type: String }, //checkout time.
            remarks: { type: String, trim: true },//checkout remarks.
            latitude: { type: String, trim: true }, //latitude.
            longitude: { type: String, trim: true }, //longitude.
            image: { type: String, trim: true }, //checkout Image.
            updated_by: { type: String, required: true, trim: true }, //Updated by user.
        },
        source: { type: String, trim: true }, //source (app/web).
    }]
});

module.exports = mongoose.model('attendance', attendanceSchema);