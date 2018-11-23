import { User } from '../models/user';
import { Request, Response, NextFunction } from 'express-serve-static-core';
const JWT = require('jsonwebtoken');
const router = require('express-promise-router')();
const User = require('../models/user');
const passport = require('passport');
const passportjs = require('../passport'); //passport.js

//Middleware.
const passportLocal = passport.authenticate('local', { session: false });
const passportJwt = passport.authenticate('jwt', { session: false });

//Sign Token.
const signToken = function (user: User) {
    return JWT.sign({
        iss: 'Ayush Pratap', //issuer.
        sub: user.id, //subject.
        iat: new Date().getTime(), //Current Time.
        exp: new Date().setDate(new Date().getDate() + 1) //Current Time + 1 day ahead.
    }, process.env.JWT_SECRET);

}

//User Signup Route.
router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, loginid, active, name, mobile, role, joining_date, leaving_date, inserted_at, sales_office, gtm_city, division, dc, beat, weekly_off } = req.body;

    //Check if user already exists.
    const foundUser = await User.findOne({ email });
    if (foundUser) {
        return res.status(406).json({ success: false, message: 'Email already exists.' });
    }
    //Create new user.
    const newUser = new User({ email, password, loginid, active, name, mobile, role, joining_date, leaving_date, inserted_at, sales_office, gtm_city, division, dc, beat, weekly_off });
    const user = await newUser.save();

    //Generate Token.
    const token = signToken(user);

    //Response with Token.
    res.status(200).json({ success: true, message: 'New User Added Successfully!', token });
});

//User Signin Route.
router.post('/signin', passportLocal, async (req: Request, res: Response, next: NextFunction) => {
    //Generate Token.
    const token = signToken(req.user);

    //Response with Token.
    res.json({
        success: true,
        message: 'Signed in successfully!',
        token,
        user: req.user
    });
});

//Get Users.
router.post('/', passportJwt, async (req: Request, res: Response, next: NextFunction) => {
    const { division, sales_office, gtm_city, dc, active } = req.body;

    var query: any = { role: 'isp' };

    req.user.role == 'client' ? query.role == 'isp' : null;
    division.length > 0 ? query.division = { $in: division } : (req.user.division.length > 0 ? query.division = { $in: req.user.division } : null);
    sales_office.length > 0 ? query.sales_office = { $in: sales_office } : (req.user.sales_office.length > 0 ? query.sales_office = { $in: req.user.sales_office } : null);
    gtm_city.length > 0 ? query.gtm_city = { $in: gtm_city } : (req.user.gtm_city.length > 0 ? query.gtm_city = { $in: req.user.gtm_city } : null);
    dc.length > 0 ? query.dc = { $in: dc } : null;
    active !== '' ? query.active = active : null;

    const users = await User.find(query);

    if (users.length <= 0) {
        res.status(404).json({ success: false, message: 'No Users found!' });
    }
    //Response with Beats.
    res.status(200).json({ success: true, users });
});

//Activate Users.
router.post('/active', passportJwt, async (req: Request, res: Response, next: NextFunction) => {

    const { users, active } = req.body;

    var query: any = {};

    users.length > 0 ? query._id = { $in: users } : null;

    const result = await User.update(query, { $set: { active } }, { multi: true });

    //Response with number of documents modified.
    res.json({ success: true, message: 'Users activated successfully!', result });
});

//Change Password.
router.put('/changePassword', passportJwt, async (req: Request, res: Response, next: NextFunction) => {

    const { oldPassword, newPassword } = req.body;

    //Find the user with given _id.
    const user = await User.findOne({ _id: req.user.id });

    //Check if the password is correct.
    const isMatch = await user.isValidPassword(oldPassword);
    const password = await user.encryptPassword(newPassword);

    if (!isMatch) return res.status(401).json({ success: false, message: 'Old Password is incorrect.' });

    await User.findOneAndUpdate({ _id: req.user.id }, {
        $set: { password }
    });

    res.json({ success: true, message: 'New password changed successfully!' });
});

//User Secret Route.
router.get('/secret', passportJwt, async (req: Request, res: Response, next: NextFunction) => {

    res.json({ success: true, message: 'You have access to this secret Route!' });
});

module.exports = router;
