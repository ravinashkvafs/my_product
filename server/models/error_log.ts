'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

function getDate() { return new Date(new Date().getTime() + (330 * 60000)); }

const ErrSchema = new Schema({
    success: { type: Boolean, default: false },
    message: String,
    error: Object,
    date: { type: Date, default: getDate() }
}, { collection: 'error-log' });

module.exports = mongoose.model('error-log', ErrSchema);