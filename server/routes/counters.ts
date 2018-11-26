'use strict';

import { Request, Response, NextFunction } from 'express';

const Router = require('express-promise-router')();
const passport = require('passport');
const _ = require('lodash');

const Counter = require('../models/counters');
const resS = require('./sendFormat');
const Verify = require('./verify');
const dateFormat = require('../utility/date_format');
const upload = require('../utility/multer');
const sheetOperation = require('../utility/sheet');

const passportJwt = passport.authenticate('jwt', { session: false });

Router.route('/')
    .get(passportJwt, Verify.verifyClient, Verify.verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
        const result = await Counter.find({}, { sap_code: 1 });

        return resS.send(res, "Counters Loaded Successfully !", result);
    })

    .post(passportJwt, Verify.verifyClient, async (req: Request, res: Response, next: NextFunction) => {
        const body = req.body;

        const existingC = await Counter.findOne({ sap_code: body.sap_code }, { sap_code: 1, _id: 0 });

        if (existingC)
            return resS.sendError(res, 501, "Some Counter with SAP Code " + body.sap_code + " Already Exists !");
        else {
            body.counter_name = body.counter_name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
            body.updated_by = req['user']['loginid'];
            body.project_code = req['user']['project_code'];

            const result = await Counter.create(body);

            return resS.send(res, "Counter Successfully Added !", result);
        }
    });

Router.route('/bulk/:sapCodeProvided')
    .post(passportJwt, Verify.verifyClient, upload.single('excel'), async (req: Request, res: Response, next: NextFunction) => {
        const sapCodeProvided = req.params.sapCodeProvided;
        const sheet = 'Sheet1';

        const rows = sheetOperation.getJsonFromSheet('uploads/' + req['user']['project_code'] + '/' + req['file']['fieldname'] + '/' + req['file']['filename'], sheet);

        if (sapCodeProvided == 'no' && 'sap_code' in rows[0])
            return resS.sendError(res, 501, "Kindly Remove SAP Code Column OR Select 'Providing SAP Code' In Options Provided !");

        let maxSap;
        if (sapCodeProvided == 'no') {
            maxSap = await Counter.aggregate([
                { $match: { project_code: req['user']['project_code'] } },
                { $group: { _id: null, max: { $max: '$sap_code' } } }
            ]);

            maxSap = maxSap.length ? maxSap[0].max : parseInt(req['user']['project_code'].charCodeAt(0) + req['user']['project_code'].charCodeAt(1) + '00000');
        }
        else {
            const invalidC = rows.filter(row => !row.sap_code || row.sap_code == '-');

            if (invalidC.length > 0) {
                return resS.sendError(res, 501, "There Are Some Counters With Invalid Data");
            }

            const allSapCodes = rows.map(row => row.sap_code);

            const uniqC = _.uniq(allSapCodes);

            if (uniqC.length != allSapCodes.length) {
                return resS.sendError(res, 501, "SAP Codes Are Used More Than Once");
            }

            const existingC = await Counter.find({ sap_code: { $in: allSapCodes } }, { _id: 0, sap_code: 1 });

            if (existingC.length > 0) {
                return resS.sendError(res, 501, "The Counters With Following SAP Codes Already Exist: " + existingC.map(item => item.sap_code));
            }
        }

        rows.forEach((row, i) => {
            if (sapCodeProvided == 'no')
                row.sap_code = maxSap + i + 1;

            row.updated_by = req['user']['loginid'];
            row.project_code = req['user']['project_code'];
        });

        const result = await Counter.create(rows);

        return resS.send(res, "Counters Added Successfully !", result);
    });

module.exports = Router;