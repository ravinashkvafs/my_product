'user strict';

import * as mongoose from 'mongoose';

const dateFormat = require('../utility/date_format');

const AttendanceSchema = new mongoose.Schema({
    loginid: { type: String, required: true, trim: true },
    month: { type: Number, required: true, default: dateFormat.now().month },
    year: { type: Number, required: true, default: dateFormat.now().year },
    month_attendance: [new mongoose.Schema({
        date: { type: Number, default: dateFormat.now().date, unique: true },
        time: { type: String, default: dateFormat.now().time },
        attendance: { type: String, required: true, uppercase: true, trim: true },
        reason: { type: String, default: '', trim: true },
        check_in: { type: Object, default: dateFormat.now() },
        check_out: Object
    })]
}, { collection: 'attendance' });

module.exports = mongoose.model('attendance', AttendanceSchema);