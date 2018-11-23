import mongoose from 'mongoose';
const date = require('./date');

// Beat Schema.
const salesOfficeSchema = new mongoose.Schema({

    active: { type: Boolean, required: true, default: true }, //active status (true/false).
    inserted_at: { type: Object, default: date.dateNow() }, //timestamp.
    name: { type: String, required: true, lowercase: true, trim: true }, //beat name.

}, { collection: 'salesOffices' });

module.exports = mongoose.model('salesOffices', salesOfficeSchema);