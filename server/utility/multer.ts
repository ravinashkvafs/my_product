'use strict';

const multer = require('multer');
const fs = require('fs');

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync('uploads/' + req['user']['project_code']))
            fs.mkdirSync('uploads/' + req['user']['project_code']);
        if (!fs.existsSync('uploads/' + req['user']['project_code'] + '/' + file.fieldname))
            fs.mkdirSync('uploads/' + req['user']['project_code'] + '/' + file.fieldname);

        cb(null, 'uploads/' + req['user']['project_code'] + '/' + file.fieldname);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname);
    }
});

module.exports = multer({ storage: diskStorage });