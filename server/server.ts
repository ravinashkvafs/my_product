'use strict';

import { Request, Response } from 'express';

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const sanitize = require('express-mongo-sanitize');
const passport = require('passport');

require('dotenv').load();
require('./routes/passport');

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(sanitize());
app.use(passport.initialize());

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);

(async () => {
    await mongoose.connect(process.env.MONGO_URL, (err: any) => {
        if (!err)
            console.log("Connected to mLab !");
    });

    const port: any = process.env.PORT || '3000';

    await app.listen(port, (err: any) => {
        if (!err)
            console.log(`Server listening on port ${port}`);
    });
})();

const resS = require('./routes/sendFormat');
const users = require('./routes/users');
const attendances = require('./routes/attendances');
const modules = require('./routes/modules');
const counters = require('./routes/counters');
const projects = require('./routes/projects');

app.use('/user', users);
app.use('/attendance', attendances);
app.use('/module', modules);
app.use('/counter', counters);
app.use('/project', projects);

app.use((req: Request, res: Response) => {
    resS.sendError(res, 404, "No Matching Route Found !");
});

app.use((err: Error, req: Request, res: Response) => {
    resS.sendError(res, 501, "Error Occured !", err);
});