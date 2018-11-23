import mongoose from 'mongoose';
const date = require('./date');

// Beat Schema.
const beatSchema = new mongoose.Schema({

    active: { type: Boolean, required: true, default: true }, //active status (true/false).
    inserted_at: { type: Object, default: date.dateNow() }, //timestamp.
    name: { type: String, required: true, lowercase: true, trim: true }, //beat name.
    sales_office: { type: String, required: true, uppercase: true, trim: true }, //sales office.
    gtm_city: { type: String, required: true, lowercase: true, trim: true }, //gtm city.
    division: { type: [String], required: true, trim: true }, //division.
    dc: { type: [String], required: true, trim: true }, //distribution channel.
    counter: { type: [Number], trim: true } //list of mapped counters.

});

module.exports = mongoose.model('beat', beatSchema);