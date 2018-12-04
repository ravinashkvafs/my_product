'use strict';

import { Response } from "express";

const ErrorLog = require('../models/error_log');
// const path = require('path');

module.exports = {
    send: (res: Response, message: string, data: any) => {
        return res.status(200).json({ success: true, message, data: data || {} });
    },
    download: (res: Response, filePath: string, fileName: string) => {
        return res.status(200).download(filePath, fileName);
    },
    sendError: (res: Response, status: number, message: string, error: any) => {
        var now: Date = new Date();
        const sendObj: object = { success: false, message, error: error || {}, date: new Date(now.getTime() + (330 * 60 * 1000)) };
        ErrorLog.create(sendObj);
        return res.status(status).json(sendObj);
    }
};