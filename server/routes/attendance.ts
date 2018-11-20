import { Request, Response, NextFunction } from 'express';

const Router = require('express-promise-router')();
const passport = require('passport');

const Attendance = require('../models/attendance');
const resS = require('./sendFormat');
const Verify = require('./verify');
const dateFormat = require('../utility/date_format');

const passportJwt = passport.authenticate('jwt', { session: false });

Router.route('/check-in')
    .post(passportJwt, async (req: Request, res: Response, next: NextFunction) => {
        const today = new Date();

        const monthObj = await Attendance.findOne({ loginid: req['user']['loginid'], month: today.getMonth() + 1, year: today.getFullYear() }, { _id: 0, loginid: 1 });

        const body = req.body;

        if (!monthObj) {
            const final = await Attendance.create({ loginid: req['user']['loginid'], month_attendance: [body] });
            resS.send(res, "Inserted !", final);
        }
        else {
            const updatedAttendance = await Attendance.updateOne({ loginid: req['user']['loginid'], month: today.getMonth() + 1, year: today.getFullYear() }, { $addToSet: { 'month_attendance': body } });

            if (updatedAttendance.nModified)
                resS.send(res, "Updated !", updatedAttendance);
            else
                resS.sendError(res, 501, "Not Updated !", updatedAttendance);
        }
    });

Router.route('/check-out')
    .post(passportJwt, async (req: Request, res: Response, next: NextFunction) => {
        const today = new Date();

        var updatedAttendance = await Attendance.updateOne({ loginid: req['user']['loginid'], month: today.getMonth() + 1, year: today.getFullYear(), 'month_attendance.date': today.getDate() }, { 'month_attendance.$.check_out': dateFormat.now() });

        if (updatedAttendance.nModified)
            resS.send(res, "Updated !", updatedAttendance);
        else
            resS.sendError(res, 501, "Not Updated !", updatedAttendance);
    });

module.exports = Router;