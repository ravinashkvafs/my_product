'use strict';

import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

const FormatSchema = new Schema({
    project_code: { type: String, required: true, lowercase: true, trim: true },
    type: { type: String, required: true, lowercase: true, trim: true },
    format: [new Schema({
        field: { type: String, required: true, trim: true },
        required: { type: Boolean, default: true }
    })]
}, { collection: 'download_format' });

module.exports = mongoose.model('download_format', FormatSchema);