'use strict';

import { Request, Response, NextFunction } from 'express';

const Router = require('express-promise-router')();
const passport = require('passport');

const Counter = require('../models/counters');
const resS = require('./sendFormat');
const Verify = require('./verify');
const dateFormat = require('../utility/date_format');

const passportJwt = passport.authenticate('jwt', { session: false });

Router.route('/push')
    .post(passportJwt, async (req: Request, res: Response, next: NextFunction) => {
        const body = req.body;
        const today = new Date(dateFormat.now().full);

        body.counter_name = body.counter_name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');

        const existingC = await Counter.findOne({ sap_code: body.sap_code }, { sap_code: 1, _id: 0 });

        if (existingC)
            return resS.sendError(res, 501, "Some Counter with SAP Code " + body.sap_code + " Already Exists !");
        else {
            const result = await Counter.create(body);

            return resS.send(res, "Counter Successfully Added !", result);
        }
    });

module.exports = Router;