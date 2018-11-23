import { Request, Response, NextFunction } from 'express-serve-static-core';

const router = require('express-promise-router')();
const SalesOffice = require('../models/salesOffice');
const passport = require('passport');
const passportjs = require('../passport'); //passport.js 

//Middleware.
const passportJwt = passport.authenticate('jwt', { session: false });

//Get Sales Offices.
router.post('/', passportJwt, async (req: Request, res: Response, next: NextFunction) => {
    const { active } = req.body;

    var query: any = {};

    active !== '' ? query.active = active : null;

    const sales_offices = await SalesOffice.find(query, { inserted_at: 0 });

    if (sales_offices.length <= 0) {
        res.status(404).json({ success: false, message: 'No sales Office found!' });
    }
    //Response with Beats.
    res.status(200).json({ success: true, message: 'Gtm Cities loaded successfully!', sales_offices });
});

module.exports = router;