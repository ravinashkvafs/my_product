'use strict';

import { Request, Response, NextFunction } from 'express';

const Router = require('express-promise-router')();
const passport = require('passport');
const fs = require('fs');

const Format = require('../models/download_format');
const resS = require('./sendFormat');
const Verify = require('./verify');
const dateFormat = require('../utility/date_format');
const sheetOperation = require('../utility/sheet');

const passportJwt = passport.authenticate('jwt', { session: false });

Router.route('/')
    .post(passportJwt, async (req: Request, res: Response, next: NextFunction) => {
        const { type, format } = req.body;

        const foundObj = await Format.findOne({ project_code: req['user']['project_code'], type }, { _id: 1 });

        if (foundObj)
            return resS.sendError(res, 501, `Format Type '${type}' Already Exists !`);

        const result = await Format.create({ project_code: req['user']['project_code'], type, format });

        resS.send(res, "Format Added !", result);
    });

Router.route('/:type')
    .get(passportJwt, async (req: Request, res: Response, next: NextFunction) => {
        const { type } = req.params;

        const formatObj = await Format.findOne({ project_code: req['user']['project_code'], type }, { _id: 0, format: 1 });

        if (!formatObj)
            return resS.sendError(res, 404, "Format Not Found !");

        const finalPath = sheetOperation.getSheetPathFromJson(req['user']['project_code'], formatObj.format, type, 'Sheet1');

        resS.sendFile(res, finalPath);
    });

module.exports = Router;