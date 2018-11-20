import { Request, Response, NextFunction } from 'express';

const Router = require('express-promise-router')();
const passport = require('passport');

const Module = require('../models/modules');
const resS = require('./sendFormat');
const Verify = require('./verify');
const dateFormat = require('../utility/date_format');
const _ = require('lodash');

const passportJwt = passport.authenticate('jwt', { session: false });

Router.route('/getMenu')
    .get(passportJwt, async (req: Request, res: Response, next: NextFunction) => {
        const query = {};
        query['allowed_to_projects'] = req['user']['project_code'];
        if (req['user']['role']['admin']) query['for_admin'] = true;
        else if (req['user']['role']['client']) query['for_client'] = true;
        else if (req['user']['role']['isp']) query['for_isp'] = true;

        let menus = await Module.find(query, { _id: 0, module_name: 1, parent_module: 1 });

        menus = _.mapValues(_.groupBy(menus, 'parent_module'), clist => clist.map(item => item.module_name));

        resS.send(res, "Module(s) Found !", menus);
    });

Router.route('/addModule')
    .post(passportJwt, Verify.verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
        const insertedObj = await Module.create(req.body);
        resS.send(res, "Module Created !", insertedObj);
    });

module.exports = Router;