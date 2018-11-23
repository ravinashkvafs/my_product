import { Request, Response, NextFunction } from 'express-serve-static-core';
import _ from 'lodash';

const xlsx = require('xlsx');
const router = require('express-promise-router')();
const BeatSchedule = require('../models/beatSchedule');
const Beat = require('../models/beat');
const User = require('../models/user');
const passport = require('passport');
const passportjs = require('../passport'); //passport.js
const _date = require('../models/date');
const { getJsDateFromExcel } = require('excel-date-to-js');

//Middleware
const passportJwt = passport.authenticate('jwt', { session: false });

//Get BeatSchedules For APP.
router.post('/', passportJwt, async (req: Request, res: Response, next: NextFunction) => {
    const { month, year, user } = req.body;

    const beatSchedules = await BeatSchedule.findOne({ 'inserted_at.month': month, 'inserted_at.year': year, user });

    if (!beatSchedules) {
        res.status(404).json({ success: false, message: 'No BeatSchedules found!' });
    }
    //Response with BeatSchedules.
    res.status(200).json({ success: true, message: 'BeatSchedules loaded successfully!', beatSchedules });
});

//Add new beatSchedule route.
router.post('/add', passportJwt, async (req: Request, res: Response, next: NextFunction) => {
    const { beat, date, user } = req.body;
    const month = _date.dateParse(date).month;
    const year = _date.dateParse(date).year;

    //Check if Beat Schedule already exists.
    const foundBeatSchedule = await BeatSchedule.findOne({ 'inserted_at.month': month, 'inserted_at.year': year, user, 'schedule.beat': beat, 'schedule.date': new Date(date) });
    if (foundBeatSchedule) {
        return res.status(403).json({ error: 'Beat Schedule already exists.' });
    }
    const beatSchedule = await BeatSchedule.update({ 'inserted_at.month': month, 'inserted_at.year': year, user }, {
        $push: { 'schedule': { beat, 'date': new Date(date) } }, $set: { 'inserted_at': _date.dateParse(date) }
    }, { upsert: true });
    //Response with number of documents modified.
    res.status(200).json({ success: 'Beat Schedule added successfully!', beatSchedule });
});

//Remove beat Schedule.
router.delete('/delete', passportJwt, async (req: Request, res: Response, next: NextFunction) => {
    const { scheduleId } = req.body;

    const result = await BeatSchedule.update({ 'schedule._id': scheduleId }, {
        $pull: { schedule: { _id: scheduleId } }
    });

    //Response with number of documents modified.
    res.status(200).json({ success: `Beat Schedule removed successfully!`, result });
});

//Bulk add beat schedule.
router.post('/bulkAdd', passportJwt, async (req: Request, res: Response, next: NextFunction) => {

    const workbook = xlsx.readFile('beatschedule.xlsx');
    var rows = xlsx.utils.sheet_to_json(workbook.Sheets['Sheet1']);

    //Removing Duplicates.
    rows = _.uniqWith(rows, _.isEqual);

    //Map dates.
    for (let rw = 0; rw < rows.length; rw++) {
        rows[rw].date = getJsDateFromExcel(rows[rw].date);
        if (rows[0].date.getMonth() != rows[rw].date.getMonth() || rows[0].date.getFullYear() != rows[rw].date.getFullYear()) {
            return res.status(401).json({ error: `Make sure all dates are of same month and year!` });
        }
    }

    //Map beats and users.
    var beatCodes = rows.map((item: any) => item.beat);
    var loginids = rows.map((item: any) => item.user.toString());

    //Check whether users exist or not.
    var usersFound = await User.find({ loginid: { $in: loginids } }, { loginid: 1 });
    var users = usersFound.map((item: any) => item.loginid);

    //Filtering Non Existing Users.
    users = _.difference(loginids, users);

    //Reponse with Non Existing Users.
    if (_.size(users) > 0) return res.status(404).json({ error: `Following users does not exist.`, users });

    //Check whether beats exist or not.
    var beatsfound = await Beat.find({ name: { $in: beatCodes } }, { name: 1 });
    var beats = beatsfound.map((item: any) => item.name);

    //Filtering Non Existing Beats.
    beats = _.difference(beatCodes, beats);

    //Reponse with Non Existing Beats.
    if (_.size(beats) > 0) return res.status(404).json({ error: `Following beat codes does not exist.`, beats });

    //Grouping excel data in to arrays of user. 
    rows = _.mapValues(_.groupBy(rows, 'user'), list => list.map(u => _.omit(u, 'user')));
    const keys = Object.keys(rows);

    keys.forEach(async key => {
        const date = rows[key][0].date;
        const month = _date.dateParse(date).month;
        const year = _date.dateParse(date).year;
        var schedule = rows[key];

        //Cheking if beatschedules already exists for a user for that month and year.
        const foundSchedule = await BeatSchedule.findOne({ user: key, 'inserted_at.month': month, 'inserted_at.year': year });
        if (foundSchedule) {
            var schedules = foundSchedule.schedule;

            //checking if beat schedules already exists for a user.
            for (let j = 0; j < schedule.length; j++) {
                for (let i = 0; i < schedules.length; i++) {
                    if (schedules[i].beat == schedule[j].beat && new Date(schedules[i].date).getTime() == new Date(schedule[j].date).getTime()) {
                        schedule.splice(j, 1);//removing from excel array.
                        j--;
                        break;
                    }
                }
            }
            //Updating the already existing Schedule for that month and year.
            await BeatSchedule.update({ user: key, 'inserted_at.month': month, 'inserted_at.year': year }, {
                $push: { schedule: { $each: schedule } }
            });
        }
        //Inserting Fresh beat schedules. 
        else {

            await BeatSchedule.update({ 'inserted_at.month': month, 'inserted_at.year': year, user: key }, {
                $push: {
                    'schedule': { $each: schedule }
                }, $set: { 'inserted_at': _date.dateParse(date) }
            }, { upsert: true });
        }
    });

    //Response with number of documents modified.
    res.status(200).json({ success: `Beat Schedules were added successfully!`, keys });
});

//Get Beat Schedules for Report.
router.post('/getSchedules', passportJwt, async (req: Request, res: Response, next: NextFunction) => {
    const { division, sales_office, gtm_city, starting_date, ending_date } = req.body;

    const startDate = _date.dateParse(starting_date).fullDate;
    const endDate = _date.dateParse(ending_date).fullDate;

    var query: any = {}; var Query: any = {};

    division.length > 0 ? query.division = { $in: division } : (req.user.division.length > 0 ? query.division = { $in: req.user.division } : null);
    sales_office.length > 0 ? query.sales_office = { $in: sales_office } : (req.user.sales_office.length > 0 ? query.sales_office = { $in: req.user.sales_office } : null);
    gtm_city.length > 0 ? query.gtm_city = { $in: gtm_city } : (req.user.gtm_city.length > 0 ? query.gtm_city = { $in: req.user.gtm_city } : null);

    // Getting beats from Beats collection.
    var beats = await Beat.find(query, { name: 1, _id: 0 });
    if (beats.length == 0) return res.status(404).json({ success: false, message: 'No Beat Schedules Found!' });

    beats = beats.map((b: any) => b.name);

    beats.length > 0 ? Query['schedule.beat'] = { $in: beats } : null;
    starting_date !== '' && ending_date !== '' ? Query['schedule.date'] = { $gte: startDate, $lte: endDate } : null;

    //Finding Schedules in BeatSchedule Collection.
    var beatSchedules = await BeatSchedule.aggregate([
        { $match: Query },
        { $lookup: { from: 'users', localField: 'user', foreignField: 'loginid', as: 'userData' } },
        { $project: { name: '$userData.name', schedule: 1, user: 1 } },
        { $unwind: '$name' },
        { $unwind: '$schedule' },
        { $match: Query },
        { $project: { user: 1, _id: '$schedule._id', beat: '$schedule.beat', date: '$schedule.date', name: 1 } }
    ]);

    //Response with Beat Schedules.
    res.status(200).json({ success: 'Beat Schedules loaded successfully!', beatSchedules });
});

module.exports = router;