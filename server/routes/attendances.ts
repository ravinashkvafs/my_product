import { Request, Response, NextFunction } from 'express';

const Router = require('express-promise-router')();
const passport = require('passport');

const Attendance = require('../models/attendances');
const resS = require('./sendFormat');
const Verify = require('./verify');
const dateFormat = require('../utility/date_format');

const passportJwt = passport.authenticate('jwt', { session: false });

Router.route('/fetchdate')
    .get(passportJwt, async (req: Request, res: Response, next: NextFunction) => {
        const body = req.body;
        const today = new Date(dateFormat.now().full);
        const sDate = body.sDate ? new Date(body.sDate) : dateFormat.custom(new Date(Date.parse(today.toISOString()) - (7 * 60 * 60 * 1000))).full;
        const eDate = body.eDate ? new Date(body.eDate) : new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

        resS.send(res, "Dates:", { today, t: today.getDate(), sDate, eDate });
    });

Router.route('/check-in')
    .post(passportJwt, async (req: Request, res: Response, next: NextFunction) => {
        const body = req.body;
        const today = new Date(dateFormat.now().full);

        const markedToday = await Attendance.findOne({ loginid: req['user']['loginid'], month: body.month || today.getMonth() + 1, year: body.year || today.getFullYear(), 'month_attendance.date': body.date || today.getDate() }, { _id: 0, loginid: 1 });

        if (markedToday) {
            return resS.sendError(res, 501, "Check-in Already Marked !");
        }
        else {
            //check-in data
            body.updated_by = req['user']['loginid'];
            body.time = dateFormat.now().time;
            body.latitude = body.latitude || 0.0;
            body.longitude = body.longitude || 0.0;
            if (!('source' in body) || ['web', 'app', 'ios'].indexOf(body.source) == -1)
                return resS.sendError(res, 501, "Kindly Enter Valid Source !");

            const toPush = { date: body.date || today.getDate(), check_in: body };
            body.reason ? toPush['reason'] = body.reason : null;

            const toSet = { last_updated: today };

            const updatedAttendance = await Attendance.updateOne({ loginid: req['user']['loginid'], month: body.month || today.getMonth() + 1, year: body.year || today.getFullYear() }, { $push: { 'month_attendance': { $each: [toPush], $sort: { date: 1 } } }, $set: toSet }, { upsert: true });

            resS.send(res, "Updated !", updatedAttendance);
        }
    });

Router.route('/check-out')
    .post(passportJwt, async (req: Request, res: Response, next: NextFunction) => {
        const body = req.body;
        const today = new Date(dateFormat.now().full);

        const markedToday = await Attendance.findOne({ loginid: req['user']['loginid'], month: body.month || today.getMonth() + 1, year: body.year || today.getFullYear(), month_attendance: { $elemMatch: { date: body.date || today.getDate(), check_out: { $exists: true } } } }, { _id: 0, loginid: 1, 'month_attendance.$.check_out': 1 });
        console.log(markedToday);
        if (markedToday) {
            return resS.sendError(res, 501, "Check-out Already Marked !");
        }
        else {
            body.updated_by = req['user']['loginid'];
            body.time = dateFormat.now().time;
            body.latitude = body.latitude || 0.0;
            body.longitude = body.longitude || 0.0;
            if (!('source' in body) || ['web', 'app', 'ios'].indexOf(body.source) == -1)
                return resS.sendError(res, 501, "Kindly Enter Valid Source !");

            var updatedAttendance = await Attendance.updateOne({ loginid: req['user']['loginid'], month: body.month || today.getMonth() + 1, year: body.year || today.getFullYear(), 'month_attendance.date': body.date || today.getDate() }, { $set: { last_updated: today, 'month_attendance.$.check_out': body } });

            if (updatedAttendance.nModified)
                resS.send(res, "Updated !", updatedAttendance);
            else
                resS.sendError(res, 501, "Not Updated !", updatedAttendance);
        }
    });

module.exports = Router;