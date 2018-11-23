import { Request, Response, NextFunction } from 'express-serve-static-core';
import _ from 'lodash';

const router = require('express-promise-router')();
const Beat = require('../models/beat');
const Counter = require('../models/counter');
const passport = require('passport');
const passportjs = require('../passport'); //passport.js 
const xlsx = require('xlsx');

//Middleware.
const passportJwt = passport.authenticate('jwt', { session: false });

//Get Counters from Beat (via mobile app).
router.post('/counter', passportJwt, async (req: Request, res: Response, next: NextFunction) => {
    const { beat } = req.body;

    //Get counter list mapped to the beat.
    const result = await Beat.findOne({ name: beat }, { counter: 1 });

    if (result.counter.length == 0) {
        res.status(404).json({ success: true, message: 'No Counters are mapped to this beat!' });
    }

    //Get counters from counter collection.
    const counters = await Counter.find({ sap_code: { $in: result.counter } });

    //Response with Counters.
    res.status(200).json({ success: true, message: 'Counters loaded successfully!', counters });
});


//Get Beats.
router.post('/', passportJwt, async (req: Request, res: Response, next: NextFunction) => {
    const { division, sales_office, gtm_city, dc, active } = req.body;

    var query: any = {};

    division.length > 0 ? query.division = { $in: division } : (req.user.division.length > 0 ? query.division = { $in: req.user.division } : null);
    sales_office.length > 0 ? query.sales_office = { $in: sales_office } : (req.user.sales_office.length > 0 ? query.sales_office = { $in: req.user.sales_office } : null);
    gtm_city.length > 0 ? query.gtm_city = { $in: gtm_city } : (req.user.gtm_city.length > 0 ? query.gtm_city = { $in: req.user.gtm_city } : null);
    dc.length > 0 ? query.dc = { $in: dc } : null;
    active !== '' ? query.active = active : null;

    console.log(query);

    const beats = await Beat.find(query);

    if (beats.length <= 0) {
        res.status(404).json({ success: false, message: 'No Beats found!' });
    }
    //Response with Beats.
    res.status(200).json({ success: true, beats });
});

//Activate Beats.
router.post('/active', passportJwt, async (req: Request, res: Response, next: NextFunction) => {

    const { beats, active } = req.body;

    var query: any = {};

    beats.length > 0 ? query._id = { $in: beats } : null;

    const result = await Beat.update(query, { $set: { active } }, { multi: true });

    //Response with number of documents modified.
    res.json({ success: true, message: 'Beats activated successfully!', result });
});


//Add new beat route.
router.post('/add', passportJwt, async (req: Request, res: Response, next: NextFunction) => {
    const { sales_office, gtm_city, name, division, dc } = req.body;

    //Check if beat already exists.
    const foundBeat = await Beat.findOne({ sales_office, gtm_city, name });
    if (foundBeat) {
        return res.status(403).json({ success: false, message: 'Beat already exists.' });
    }
    //Create new beat.
    const newBeat = new Beat({ sales_office, gtm_city, name, division, dc });

    const beat = await newBeat.save();

    //Response with Beat.
    res.status(200).json({ success: true, message: 'Beat added successfully!', beat });
});

//Beat Counter Mapping.
router.put('/counterMapping', passportJwt, async (req: Request, res: Response, next: NextFunction) => {
    const { counters, beat } = req.body;

    //Check if Mapping already exists.
    const result = await Beat.findOne({ _id: beat }, { counter: 1 });

    //Filtering Counters which already exists.
    const counter = _.difference(counters, result.counter); //(1,2,3) - (4,5,6,2) = (1,3).

    //Map counters with beat
    const updatedBeat = await Beat.findOneAndUpdate({ _id: beat }, { $push: { counter: { $each: counter } } }, { new: true });

    //Response with Updated beat.
    res.status(200).json({ success: 'Counters Mapped Successfully!', updatedBeat });
});

//Remove Beat counter mapping.
router.post('/removeCounterMapping', passportJwt, async (req: Request, res: Response, next: NextFunction) => {
    const { counters } = req.body;

    const result = await Beat.update({ counter: { $in: counters } }, { $pull: { counter: { $in: counters } } }, { multi: true });

    //Response with number of documents modified.
    res.status(200).json({ success: true, message: `Counters' mapping removed successfully!`, result });
});

//Bulk beat counter mapping.
router.put('/bulkCounterMapping', passportJwt, async (req: Request, res: Response, next: NextFunction) => {

    const workbook = xlsx.readFile('myexcel.xlsx');
    var rows = xlsx.utils.sheet_to_json(workbook.Sheets['Sheet1']);

    //Removing Duplicates.
    rows = _.uniqWith(rows, _.isEqual);

    //Map Counters and Beats.
    const sapCodes = rows.map((item: any) => item.sap_code);
    const beatCodes = rows.map((item: any) => item.beat);

    //Check whether counters exist or not.
    var counters = await Counter.find({ sap_code: { $in: sapCodes } }, { sap_code: 1 });
    counters = counters.map((item: any) => item.sap_code);

    //Filtering Non Existing Counters.
    counters = _.difference(sapCodes, counters);

    //Reponse with Non Existing Counters.
    if (_.size(counters) > 0) return res.status(404).json({ error: `Following counters does not exist.`, counters });

    //Check whether beats exist or not.
    var beatsfound = await Beat.find({ name: { $in: beatCodes } }, { name: 1, counter: 1 });
    var beats = beatsfound.map((item: any) => item.name);

    //Filtering Non Existing Beats.
    beats = _.difference(beatCodes, beats);

    //Reponse with Non Existing Beats.
    if (_.size(beats) > 0) return res.status(404).json({ error: `Following beat codes does not exist.`, beats });

    //Check whether counter is already mapped.
    beatsfound.forEach(async (beat: any, index: number) => {
        for (let j = 0; j < rows.length; j++) {
            if (beat.name == rows[j].beat) {
                if (beat.counter.indexOf(rows[j].sap_code) == -1) {
                    beat.counter.push(rows[j].sap_code);
                }
                rows.splice(j, 1);
                j--;
            }
        }
        //update counter mapping in Beat.
        await Beat.updateOne({ name: beat.name }, {
            $set: {
                counter: beat.counter
            }
        });
    });


    //Response with number of documents modified.
    res.status(200).json({ success: `counters mapped successfully!`, rows });
});

module.exports = router;