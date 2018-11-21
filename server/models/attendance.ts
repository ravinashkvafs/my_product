'user strict';

import * as mongoose from 'mongoose';

const dateFormat = require('../utility/date_format');

const AttendanceSchema = new mongoose.Schema({
    loginid: { type: String, required: true, trim: true },
    month: { type: Number, required: true, default: dateFormat.now().month },
    year: { type: Number, required: true, default: dateFormat.now().year },
    month_attendance: [new mongoose.Schema({
        date: { type: Number, default: dateFormat.now().date },
        check_in: {
            time: String,
            status: { type: String, required: true, uppercase: true, trim: true },
            remarks: { type: String, trim: true },
            image_path: { type: String, trim: true },
            latitude: Number,
            longitude: Number,
            updated_by: { type: String, required: true, trim: true }
        },
        check_out: {
            time: String,
            status: { type: String, required: true, uppercase: true, trim: true },
            remarks: { type: String, trim: true },
            image_path: { type: String, trim: true },
            latitude: Number,
            longitude: Number,
            updated_by: { type: String, required: true, trim: true }
        }
    })]
});

module.exports = mongoose.model('attendances', AttendanceSchema);