'use strict';

import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;
const dateFormat = require('../utility/date_format');

const ProjectSchema = new Schema({
    client_code: { type: String, required: true, unique: true, trim: true, lowercase: true },
    projects: [new Schema({
        project_code: { type: String, required: true, trim: true, lowercase: true },
        project_name: { type: String, required: true, trim: true },
        inserted_at: { type: Object, default: dateFormat.now() }
    })]
});

module.exports = mongoose.model('projects', ProjectSchema);