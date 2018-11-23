import { Request, Response, NextFunction } from 'express-serve-static-core';
const router = require('express-promise-router')();
const Sale = require('../models/sale');
const User = require('../models/user');
const passport = require('passport');
const passportjs = require('../passport'); //passport.js
const _date = require('../models/date');

//Middleware
const passportJwt = passport.authenticate('jwt', { session: false });

//Add new sale route.
router.post('/add', passportJwt, async (req: Request, res: Response, next: NextFunction) => {
    const { order_id, active, beat, counter, distributor, reason, user, order_placed, order } = req.body;

    //Check if sale already exists.
    const foundSale = await Sale.findOne({ order_id });
    if (foundSale) {
        return res.status(403).json({ error: 'Sale was already made.' });
    }
    //Create new sale.
    const newSale = new Sale({ order_id, active, beat, counter, distributor, reason, user, order_placed, order });

    const sale = await newSale.save();

    //Response with sale data.
    res.status(200).json({ success: true, message: 'Sale made successfully!', sale });
});

//Get Sales.
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
    if (users.length == 0) return res.status(404).json({ success: false, message: 'No Sales Found!' });

    users = users.map((u: any) => u.loginid);

    users.length > 0 ? Query['user'] = { $in: users } : null;
    starting_date !== '' && ending_date !== '' ? Query['date'] = { $gte: startDate, $lte: endDate } : null;

    //Finding Attendances in Attendance Collection.
    var sales = await Sale.aggregate([
        { $match: Query },
        { $lookup: { from: 'users', localField: 'user', foreignField: 'loginid', as: 'userData' } },
        { $lookup: { from: 'counters', localField: 'counter', foreignField: 'sap_code', as: 'counterData' } },
        { $project: { name: '$userData.name', user: '$userData.loginid', date: 1, order_id: 1, beat: 1, reason: 1, order_placed: 1, order: 1, counter_name: '$counterData.name', counter_code: '$counterData.sap_code', counter_address: '$counterData.address' } },
        { $unwind: '$name' },
        { $unwind: '$user' },
        { $unwind: '$order' },
        { $unwind: '$counter_name' },
        { $unwind: '$counter_code' },
        { $unwind: '$counter_address' },
        { $match: Query },
        { $lookup: { from: 'distributors', localField: 'order.distributor', foreignField: 'sap_code', as: 'distributorData' } },
        { $lookup: { from: 'products', localField: 'order.sku_code', foreignField: 'sku_code', as: 'productsData' } },
        { $project: { name: 1, user: 1, date: 1, order_id: 1, beat: 1, reason: 1, order_placed: 1, order: 1, counter_name: 1, counter_code: 1, counter_address: 1, division: '$productsData.division', client_dv_code: '$productsData.client_dv_code', dvcode: '$productsData.dvcode', sku: '$productsData.sku', distributor_name: '$distributorData.name', distributor_code: '$distributorData.sap_code', distributor_email: '$distributorData.email' } },
        { $unwind: '$distributor_name' },
        { $unwind: '$distributor_code' },
        { $unwind: '$distributor_email' },
        { $unwind: '$division' },
        { $unwind: '$client_dv_code' },
        { $unwind: '$dvcode' },
        { $unwind: '$sku' }
    ]);

    //Response with Attendances.
    res.status(200).json({ success: true, message: 'Sales loaded successfully!', sales });
});

module.exports = router;