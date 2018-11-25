'use strict';

import { Request, Response, NextFunction } from 'express';

const Router = require('express-promise-router')();
const passport = require('passport');
const xlsx = require('xlsx');

const Counter = require('../models/counters');
const resS = require('./sendFormat');
const Verify = require('./verify');
const dateFormat = require('../utility/date_format');
const upload = require('../utility/multer');

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

Router.route('/bulk')
    .post(passportJwt, Verify.verifyClient, upload.single('excel'), async (req: Request, res: Response, next: NextFunction) => {
        const sheet = 'Sheet1';

        const workbook = xlsx.readFile('uploads/' + req['user']['project_code'] + '/' + req['file']['fieldname'] + '/' + req['file']['filename']);
        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);

        return resS.send(res, "Rows", rows);

        // const body = req.body;

        // const existingC = await Counter.findOne({ sap_code: body.sap_code }, { sap_code: 1, _id: 0 });

        // if (existingC)
        //     return resS.sendError(res, 501, "Some Counter with SAP Code " + body.sap_code + " Already Exists !");
        // else {
        //     body.counter_name = body.counter_name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
        //     body.updated_by = req['user']['loginid'];
        //     body.project_code = req['user']['project_code'];

        //     const result = await Counter.create(body);

        //     return resS.send(res, "Counter Successfully Added !", result);
        // }
    });

module.exports = Router;