import { Request, Response, NextFunction } from 'express-serve-static-core';

const router = require('express-promise-router')();
const GtmCity = require('../models/gtmCity');
const passport = require('passport');
const passportjs = require('../passport'); //passport.js 


//Middleware.
const passportJwt = passport.authenticate('jwt', { session: false });

//Get GtmCities.
router.post('/', passportJwt, async (req: Request, res: Response, next: NextFunction) => {
    const { sales_office, names, active } = req.body;

    var query: any = {};

    names.length > 0 ? query.name = { $in: names } : null;
    sales_office.length > 0 ? query.sales_office = { $in: sales_office } : null;
    active !== '' ? query.active = active : null;

    const gtm_cities = await GtmCity.find(query, { inserted_at: 0 });

    if (gtm_cities.length <= 0) {
        return res.status(404).json({ success: false, message: 'No Gtm City found!' });
    }
    //Response with Beats.
    res.status(200).json({ success: true, message: 'Gtm Cities loaded successfully!', gtm_cities });
});

module.exports = router;