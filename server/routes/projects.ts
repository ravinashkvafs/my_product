'use strict';

import { Request, Response, NextFunction } from 'express';

const Router = require('express-promise-router')();
const passport = require('passport');

const Project = require('../models/projects');
const resS = require('./sendFormat');
const Verify = require('./verify');
const dateFormat = require('../utility/date_format');

const passportJwt = passport.authenticate('jwt', { session: false });

Router.route('/')
    .get(passportJwt, Verify.verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
        const list = await Project.aggregate([
            { $unwind: '$projects' },
            { $project: { client_code: 1, _id: '$projects._id', project_code: '$projects.project_code', project_name: '$projects.project_name' } }
        ]);

        return resS.send(res, "Projects Loaded Successfully !", list);
    })

    .post(passportJwt, Verify.verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {
        const { client_code, project_code, project_name } = req.body;
        const today = new Date(dateFormat.now().full);

        const existingStore = await Project.findOne({ client_code, 'projects': { $elemMatch: { project_code, project_name } } }, { 'projects.$': 1 });

        if (existingStore)
            return resS.sendError(res, 501, "Project Already Exists !", existingStore);
        else {
            const result = await Project.update({ client_code }, { $push: { projects: { project_code, project_name } } }, { upsert: true });
            return resS.send(res, "Project Successfully Added !", result);
        }
    });

module.exports = Router;