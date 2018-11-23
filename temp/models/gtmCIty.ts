import mongoose from 'mongoose';
const date = require('./date');

// Beat Schema.
const gtmCitySchema = new mongoose.Schema({

    active: { type: Boolean, required: true, default: true }, //active status (true/false).
    inserted_at: { type: Object, default: date.dateNow() }, //timestamp.
    name: { type: String, required: true, lowercase: true, trim: true }, //beat name.
    sales_office: { type: String, required: true, uppercase: true, trim: true }, //sales office.

}, { collection: 'gtmCities' });

module.exports = mongoose.model('gtmCities', gtmCitySchema);