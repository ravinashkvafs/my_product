import { Request, Response, NextFunction } from 'express';

const resS = require('./sendFormat');

'use strict';

const jwt = require('jsonwebtoken');

exports.getToken = (userD) => {
    userD.iat = new Date(new Date().getTime() + (330 * 60 * 1000));
    return jwt.sign(JSON.stringify(userD), process.env.TOKEN_CODE);
};

exports.verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (('user' in req) && ('role' in req['user']) && req['user']['role']['admin']) next();
    else return resS.sendError(res, 401, "You Are Not Authorized !");
};

exports.verifyClient = (req: Request, res: Response, next: NextFunction) => {
    if (('user' in req) && ('role' in req['user']) && req['user']['role']['client']) next();
    else return resS.sendError(res, 401, "You Are Not Authorized !");
};

exports.verifyIsp = (req: Request, res: Response, next: NextFunction) => {
    if (('user' in req) && ('role' in req['user']) && req['user']['role']['isp']) next();
    else return resS.sendError(res, 401, "You Are Not Authorized !");
};

module.exports = exports;