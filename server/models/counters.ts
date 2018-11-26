'use strict';

import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;
const dateFormat = require('../utility/date_format');

const CounterSchema = new Schema({
    sap_code: { type: Number, required: true, unique: true, index: true },
    counter_name: { type: String, required: true, trim: true },
    owner_name: { type: String, trim: true },
    owner_email: { type: String, lowercase: true, trim: true },
    owner_mobile: { type: String, trim: true },
    state: { type: String, trim: true },
    city: { type: String, trim: true },
    pincode: Number,
    address: { type: String, trim: true },
    region: { type: String, trim: true },
    project_code: { type: String, required: true, trim: true, lowercase: true },
    isActive: { type: Boolean, default: true },
    inserted_at: { type: Object, default: dateFormat.now() },
    updated_by: { type: String, trim: true }
});

module.exports = mongoose.model('counters', CounterSchema);