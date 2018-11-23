import mongoose from 'mongoose';
const date = require('./date');

// Distributor Schema.
const saleSchema = new mongoose.Schema({

    active: { type: Boolean, required: true, default: true }, //active status (true/false).
    inserted_at: { type: Object, required: true, default: date.dateNow() }, //timestamp.
    date: { type: Date, required: true, default: date.dateNow().fullDate }, //date of sale.
    beat: { type: String, required: true, trim: true, lowercase: true }, //beat on which sale was made.
    counter: { type: Number, required: true }, //counter at which sale was made.
    reason: { type: String, required: false, trim: true }, //reason why sale was not successfull.
    user: { type: String, required: true, trim: true }, //lasm who made the sale.
    order_placed: { type: Boolean, required: true }, //order placed (true/false).
    order_id: { type: String, required: true, trim: true, unique: true }, //order id.
    order: [{
        sku_code: { type: String, required: true, trim: true, uppercase: true },
        quantity: { type: Number, required: true },
        distributor: { type: Number, required: true, trim: true }, //distributor under which sale was made.
    }] //list of orders placed.

});

module.exports = mongoose.model('sale', saleSchema); 