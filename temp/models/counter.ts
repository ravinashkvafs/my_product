import mongoose from 'mongoose';
const date = require('./date');

// Counter Schema.
const counterSchema = new mongoose.Schema({

    sap_code: { type: Number, required: true, unique: true, trim: true }, //sap code.
    name: { type: String, required: true, lowercase: true, trim: true }, //counter name.
    counter_class: { type: String, required: true, uppercase: true, trim: true }, //counter Class.
    sales_office: { type: String, required: true, uppercase: true, trim: true }, //sales office.
    gtm_city: { type: String, required: true, lowercase: true, trim: true }, //gtm city.
    division: { type: [String], required: true, trim: true, lowercase: true }, //division.
    dc: { type: [String], required: true, trim: true, lowercase: true }, //distribution channel.
    distributor: [Number], //list of active distributors.
    distributors: [Number], //list of all existing distributors.
    pan_number: { type: String, trim: true, uppercase: true }, //PAN number of counter.
    gst_number: { type: String, trim: true, uppercase: true }, //GST number of counter.
    image: { type: [String], lowercase: true, trim: true }, //Image url.
    weekly_off: { type: String, default: 'Sunday', trim: true, required: true }, //weekly off.
    opening_time: String, //counter opening time.
    closing_time: String, //counter closing time.
    updated_on: [Date], //list of dates on which counter was updated.
    updated_by: [String], //list of users who updated counter.
    active: { type: Boolean, required: true, default: true }, //active status (true/false).
    address: { sco: String, locality: String, pincode: { type: String, trim: true, required: true } }, //counter address.
    inserted_at: { type: Object, default: date.dateNow() } //timestamp.

});


counterSchema.pre('save', async function (this: any, next: any) {
    try {

        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('counter', counterSchema);