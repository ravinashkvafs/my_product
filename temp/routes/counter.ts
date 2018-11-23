import { Request, Response, NextFunction } from 'express-serve-static-core';
import _ from 'lodash';

const router = require('express-promise-router')();
const Counter = require('../models/counter');
const Distributor = require('../models/distributor');
const passport = require('passport');
const passportjs = require('../passport'); //passport.js
const xlsx = require('xlsx'); //Excel Library.

//Middleware
const passportJwt = passport.authenticate('jwt', { session: false });

//Get Counters.
router.post('/', passportJwt, async (req: Request, res: Response, next: NextFunction) => {
    const { division, sales_office, gtm_city, dc, active, counter_class } = req.body;

    var query: any = {};

    division.length > 0 ? query.division = { $in: division } : (req.user.division.length > 0 ? query.division = { $in: req.user.division } : null);
    sales_office.length > 0 ? query.sales_office = { $in: sales_office } : (req.user.sales_office.length > 0 ? query.sales_office = { $in: req.user.sales_office } : null);
    gtm_city.length > 0 ? query.gtm_city = { $in: gtm_city } : (req.user.gtm_city.length > 0 ? query.gtm_city = { $in: req.user.gtm_city } : null);
    counter_class.length > 0 ? query.counter_class = { $in: counter_class } : null;
    dc.length > 0 ? query.dc = { $in: dc } : null;
    active !== '' ? query.active = active : null;

    const counters = await Counter.find(query);

    if (counters.length <= 0) {
        res.status(404).json({ success: false, message: 'No Counters found!' });
    }
    //Response with Counters.
    res.status(200).json({ success: true, message: 'Counters Loaded Successfully!', counters });
});

//Add new counter route.
router.post('/add', passportJwt, async (req: Request, res: Response, next: NextFunction) => {
    const { sap_code, name, counter_class, sales_office, gtm_city, division, dc, distributor, pan_number, gst_number, image, weekly_off, opening_time, closing_time, address } = req.body;

    //Check if counter already exists.
    const foundCounter = await Counter.findOne({ sap_code });
    if (foundCounter) {
        return res.status(403).json({ success: false, message: 'Counter already exists with this sap_code.' });
    }
    //Create new counter.
    const newCounter = new Counter({ sap_code, name, counter_class, sales_office, gtm_city, division, dc, distributor, distributors: distributor, pan_number, gst_number, image, weekly_off, opening_time, closing_time, address, updated_on: [new Date()], updated_by: [req.user._id] });

    const counter = await newCounter.save();

    //Response with Counter.
    res.status(200).json({ success: true, message: 'Counter added successfully!', counter });
});

//Counter Distributor Mapping.
router.put('/distributorMapping', passportJwt, async (req: Request, res: Response, next: NextFunction) => {
    const { counters, distributor } = req.body;

    //Checking if mapping already exists, if not then update
    const result = await Counter.update({ sap_code: { $in: counters } }, { $addToSet: { distributor: distributor, distributors: distributor } }, { multi: true });

    //Response with Number of documents Modified.
    res.status(200).json({ success: true, message: 'Distributor Mapped Successfully!', result });
});

//Bulk counter distributor Mapping.
router.put('/bulkDistributorMapping', passportJwt, async (req: Request, res: Response, next: NextFunction) => {

    const workbook = xlsx.readFile('excel.xlsx');
    var rows = xlsx.utils.sheet_to_json(workbook.Sheets['Sheet1']);

    //Removing Duplicates.
    rows = _.uniqWith(rows, _.isEqual);

    //Map Counters and Beats.
    var counters = rows.map((item: any) => item.counter);
    var distributors = rows.map((item: any) => item.distributor);

    //Check whether counters exist or not.
    var countersFound = await Counter.find({ sap_code: { $in: counters } }, { sap_code: 1 });
    countersFound = countersFound.map((item: any) => item.sap_code);

    //Filtering Non Existing Counters.
    const _counters = _.difference(counters, countersFound);

    //Reponse with Non Existing Counters.
    if (_.size(_counters) > 0) return res.status(404).json({ success: true, message: `Following counters does not exist.`, _counters });

    //Check whether distributors exist or not.
    var distributorsFound = await Distributor.find({ sap_code: { $in: distributors } }, { sap_code: 1 });
    distributorsFound = distributorsFound.map((item: any) => item.sap_code);

    //Filtering Non Existing distributors.
    const _distributors = _.difference(distributors, distributorsFound);

    //Reponse with Non Existing distributors.
    if (_.size(_distributors) > 0) return res.status(404).json({ success: true, message: `Following distributors does not exist.`, _distributors });

    //Grouping excel data in to arrays of user. 
    rows = _.mapValues(_.groupBy(rows, 'distributor'), list => _(list).map('counter').value());
    const keys = Object.keys(rows);

    keys.forEach(async (key: any) => {
        counters = rows[key]; //key = distributor, rows[key] = counters.

        //Checking if mapping already exists, if not then update
        await Counter.update({ sap_code: { $in: counters } }, { $addToSet: { distributor: key, distributors: key } }, { multi: true });

    });

    //Response with number of documents modified.
    res.status(200).json({ success: true, message: `distributors' mapped successfully!`, rows });
});

//Remove counter distributor mapping.
router.post('/removeDistributorMapping', passportJwt, async (req: Request, res: Response, next: NextFunction) => {
    const { distributors } = req.body;

    const result = await Counter.update({ distributor: { $in: distributors } }, { $pull: { distributor: { $in: distributors } } }, { multi: true });

    //Response with number of documents modified.
    res.status(200).json({ success: true, message: `Distributors' mapping removed successfully!`, result });
});

//Activate Counters.
router.post('/active', passportJwt, async (req: Request, res: Response, next: NextFunction) => {

    const { counters, active } = req.body;

    var query: any = {};

    counters.length > 0 ? query._id = { $in: counters } : null;

    const result = await Counter.update(query, { $set: { active } }, { multi: true });

    //Response with number of documents modified.
    res.json({ success: true, message: 'Counters activated successfully!', result });
});


module.exports = router;