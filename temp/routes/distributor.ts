import { Request, Response, NextFunction } from 'express-serve-static-core';
const router = require('express-promise-router')();
const Distributor = require('../models/distributor');
const passport = require('passport');
const passportjs = require('../passport'); //passport.js

//Middleware.
const passportJwt = passport.authenticate('jwt', { session: false });

//Add new distributor route.
router.post('/add', passportJwt, async (req: Request, res: Response, next: NextFunction) => {
    const { sap_code, email, joining_date, leaving_date, sales_office, gtm_city, name, division, dc } = req.body;

    //Check if distributor already exists.
    const foundDistributor = await Distributor.findOne({ sap_code });
    if (foundDistributor) {
        return res.status(403).json({ success: false, message: 'Distributor already exists with this sap code.' });
    }
    //Create new Distributor.
    const newDistributor = new Distributor({ sap_code, email, joining_date, leaving_date, sales_office, gtm_city, name, division, dc });

    const distributor = await newDistributor.save();

    //Response with new Distributor.
    res.status(200).json({ success: true, message: 'New distributor added successfully!', distributor });
});

//Get Distributors.
router.post('/', passportJwt, async (req: Request, res: Response, next: NextFunction) => {
    const { division, sales_office, gtm_city, dc, active, sap_code } = req.body;

    var query: any = {};

    division.length > 0 ? query.division = { $in: division } : (req.user.division.length > 0 ? query.division = { $in: req.user.division } : null);
    sales_office.length > 0 ? query.sales_office = { $in: sales_office } : (req.user.sales_office.length > 0 ? query.sales_office = { $in: req.user.sales_office } : null);
    gtm_city.length > 0 ? query.gtm_city = { $in: gtm_city } : (req.user.role != 'isp' ? (req.user.gtm_city.length > 0 ? query.gtm_city = { $in: req.user.gtm_city } : null) : null);
    dc.length > 0 ? query.dc = { $in: dc } : null;
    sap_code.length > 0 ? query.sap_code = { $in: sap_code } : null;
    active !== '' ? query.active = active : null;

    const distributors = await Distributor.find(query);

    if (distributors.length <= 0) {
        res.status(404).json({ success: false, message: 'No Distributors found!' });
    }
    //Response with Distributors.
    res.status(200).json({ success: true, message: 'Distributors loaded successfully', distributors });
});

//Activate Distributors.
router.post('/active', passportJwt, async (req: Request, res: Response, next: NextFunction) => {

    const { distributors, active } = req.body;

    var query: any = {};

    distributors.length > 0 ? query._id = { $in: distributors } : null;

    const result = await Distributor.update(query, { $set: { active } }, { multi: true });

    //Response with number of documents modified.
    res.json({ success: true, message: 'Distributors activated successfully!', result });
});


module.exports = router;