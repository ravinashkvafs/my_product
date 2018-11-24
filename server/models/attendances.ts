'user strict';

import * as mongoose from 'mongoose';

const dateFormat = require('../utility/date_format');

const AttendanceSchema = new mongoose.Schema({
    loginid: { type: String, required: true, trim: true },
    month: { type: Number, required: true, default: dateFormat.now().month },
    year: { type: Number, required: true, default: dateFormat.now().year },
    last_updated: { type: Date, default: Date.now },
    month_attendance: [new mongoose.Schema({
        status: { type: String, required: true, uppercase: true, trim: true },
        reason: { type: String, trim: true },
        at: { type: String, trim: true },
        date: { type: Number, default: dateFormat.now().date },
        check_in: {
            time: String,
            remarks: { type: String, trim: true },
            image_path: { type: String, trim: true },
            latitude: Number,
            longitude: Number,
            updated_by: { type: String, required: true, trim: true },
            source: { type: String, lowercase: true, trim: true }       //'web', 'app', 'ios'
        },
        check_out: {
            time: String,
            remarks: { type: String, trim: true },
            image_path: { type: String, trim: true },
            latitude: Number,
            longitude: Number,
            updated_by: { type: String, required: true, trim: true },
            source: { type: String, lowercase: true, trim: true }       //'web', 'app', 'ios'
        }
    })]
});

module.exports = mongoose.model('attendances', AttendanceSchema);