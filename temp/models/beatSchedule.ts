import mongoose from 'mongoose';
const date = require('./date');

// Beat Schedule Schema.
const beatSchema = new mongoose.Schema({

    active: { type: Boolean, required: true, default: true }, //active status (true/false).
    inserted_at: { type: Object, default: date.dateNow() }, //timestamp.
    user: { type: String, required: true, trim: true }, //lasm who is scheduled.
    schedule: [{
        beat: { type: String, required: true, trim: true, lowercase: true }, //beat name.
        date: { type: Date, required: true }, //date of schedule.},
    }]
}, { collection: 'beatSchedules' });

module.exports = mongoose.model('beatSchedule', beatSchema);