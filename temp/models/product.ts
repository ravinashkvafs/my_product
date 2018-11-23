import mongoose from 'mongoose';
const date = require('./date');

// Product Schema.
const productSchema = new mongoose.Schema({

    active: { type: Boolean, required: true, default: true }, //active status (true/false).
    sku_code: { type: String, required: true, unique: true, trim: true, uppercase: true }, //sku code.
    inserted_at: { type: Object, default: date.dateNow() }, //timestamp.
    division: { type: String, required: true, trim: true, lowercase: true }, //division.
    dvcode: { type: String, required: true, trim: true, lowercase: true }, //dvcode.
    client_dv_code: { type: Number, required: true, trim: true }, //client dv code.
    material_group: { type: String, required: true, trim: true, uppercase: true }, //Material Group.
    sku: { type: String, required: true, lowercase: true, trim: true }, //SKU.
    category: { type: String, required: true, lowercase: true, trim: true }, //category.
    subcategory1: { type: String, trim: true, lowercase: true }, //Subcategory 1.
    subcategory2: { type: String, trim: true, lowercase: true }, //Subcategory 2.

});

module.exports = mongoose.model('product', productSchema);