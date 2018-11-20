'use strict';

import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ModuleSchema = new Schema({
    module_name: { type: String, required: true, lowercase: true, unique: true, trim: true },
    parent_module: { type: String, default: '', lowercase: true, trim: true },
    allowed_to_projects: Array,
    for_admin: { type: Boolean, default: false },
    for_client: { type: Boolean, default: false },
    for_isp: { type: Boolean, default: false }
});

module.exports = mongoose.model('modules', ModuleSchema);