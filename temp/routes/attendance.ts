import { Request, Response, NextFunction } from 'express-serve-static-core';

const router = require('express-promise-router')();
const Attendance = require('../models/attendance');
const User = require('../models/user');
const passport = require('passport');
const passportjs = require('../passport'); //passport.js 
const _date = require('../models/date');

//Middleware
const passportJwt = passport.authenticate('jwt', { session: false });

//Add new attendance checkin route.
router.post('/checkin', passportJwt, async (req: Request, res: Response, next: NextFunction) => {
    const { checkin, date, user, status, reason, at, source } = req.body;
    const month = _date.dateParse(date).month;
    const year = _date.dateParse(date).year;
    checkin.updated_by = req.user._id;

    //Check if attendance already exists.
    const foundattendance = await Attendance.findOne({ 'inserted_at.month': month, 'inserted_at.year': year, user, 'attendance.date': new Date(date) });
    if (foundattendance) {
        return res.status(403).json({ success: false, message: 'Attendance Already Marked!' });
    }

    const attendance = await Attendance.update({ 'inserted_at.month': month, 'inserted_at.year': year, user }, {
        $push: { 'attendance': { status, checkin, reason, at, source, 'date': new Date(date) } }, $set: { 'inserted_at': _date.dateParse(date) }
    }, { upsert: true });
    //Response with number of documents modified.
    res.status(200).json({ success: true, message: 'Attendance Marked successfully!', attendance });
});

//Add new attendance checkout route.
router.post('/checkout', passportJwt, async (req: Request, res: Response, next: NextFunction) => {
    const { checkout, date, user } = req.body;
    const month = _date.dateParse(date).month;
    const year = _date.dateParse(date).year;
    checkout.updated_by = req.user._id;

    //Check if Checkin attendance is marked.
    const foundCheckin = await Attendance.findOne({ 'inserted_at.month': month, 'inserted_at.year': year, user, 'attendance.date': new Date(date) });
    if (!foundCheckin) {
        return res.status(403).json({ success: false, message: 'Checkin Attendance not Marked!' });
    }

    //Check if checkout attendance already exists.
    const foundCheckout = await Attendance.findOne({ 'inserted_at.month': month, 'inserted_at.year': year, user, 'attendance.date': new Date(date), 'attendance.checkout.time': checkout.time });
    if (foundCheckout) {
        return res.status(403).json({ success: false, message: 'Attendance Already Marked!' });
    }

    const attendance = await Attendance.update({ 'inserted_at.month': month, 'inserted_at.year': year, user, 'attendance.date': new Date(date) }, {
        $set: { 'inserted_at': _date.dateParse(date), 'attendance.$.checkout': checkout }
    });
    //Response with number of documents modified.
    res.status(200).json({ success: true, message: 'Attendance Marked successfully!', attendance });
});

//Get Attendances.
router.post('/', passportJwt, async (req: Request, res: Response, next: NextFunction) => {
    const { division, sales_office, gtm_city, starting_date, ending_date, dc, active } = req.body;

    const startDate = _date.dateParse(starting_date).fullDate;
    const endDate = _date.dateParse(ending_date).fullDate;

    var query: any = {}; var Query: any = {};

    division.length > 0 ? query.division = { $in: division } : (req.user.division.length > 0 ? query.division = { $in: req.user.division } : null);
    sales_office.length > 0 ? query.sales_office = { $in: sales_office } : (req.user.sales_office.length > 0 ? query.sales_office = { $in: req.user.sales_office } : null);
    gtm_city.length > 0 ? query.gtm_city = { $in: gtm_city } : (req.user.gtm_city.length > 0 ? query.gtm_city = { $in: req.user.gtm_city } : null);
    dc.length > 0 ? query.dc = { $in: dc } : null;
    active !== '' ? query.active = active : null;

    // Getting users from Users collection.
    var users = await User.find(query, { loginid: 1, _id: 0 });
    if (users.length == 0) return res.status(404).json({ success: false, message: 'No Attendances Found!' });

    users = users.map((u: any) => u.loginid);

    users.length > 0 ? Query['user'] = { $in: users } : null;
    starting_date !== '' && ending_date !== '' ? Query['attendance.date'] = { $gte: startDate, $lte: endDate } : null;

    //Finding Attendances in Attendance Collection.
    var attendances = await Attendance.aggregate([
        { $match: Query },
        { $lookup: { from: 'users', localField: 'user', foreignField: 'loginid', as: 'userData' } },
        { $project: { name: '$userData.name', user: '$userData.loginid', attendance: 1 } },
        { $unwind: '$name' },
        { $unwind: '$user' },
        { $unwind: '$attendance' },
        { $match: Query },
        { $project: { name: 1, user: 1, date: '$attendance.date', reason: '$attendance.reason', at: '$attendance.at', source: '$attendance.source', status: '$attendance.status', checkin: '$attendance.checkin', checkout: '$attendance.checkout' } },
    ]);

    //Response with Attendances.
    res.status(200).json({ success: true, message: 'Attendances loaded successfully!', attendances });
});


module.exports = router;