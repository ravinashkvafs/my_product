import mongoose from 'mongoose';
const date = require('./date');

// Distributor Schema.
const distributorSchema = new mongoose.Schema({

    active: { type: Boolean, required: true, default: true }, //active status (true/false).
    sap_code: { type: Number, required: true, unique: true, trim: true }, //sap code.
    inserted_at: { type: Object, default: date.dateNow() }, //timestamp.
    email: { type: String, required: true, unique: true, lowercase: true, trim: true }, //email.
    name: { type: String, required: true, lowercase: true, trim: true }, //beat name.
    sales_office: { type: String, required: true, uppercase: true, trim: true }, //sales office.
    gtm_city: { type: [String], required: true, lowercase: true, trim: true }, //gtm city.
    division: { type: [String], required: true, trim: true }, //division.
    dc: { type: [String], required: true, trim: true }, //distribution channel.
    joining_date: { type: [Date], required: true, default: Date.now }, //list of dates.
    leaving_date: [Date], //list of dates.

});

module.exports = mongoose.model('distributor', distributorSchema);