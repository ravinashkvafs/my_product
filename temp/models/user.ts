import mongoose from 'mongoose';
const date = require('./date');
const bcrypt = require('bcryptjs');

//User Schema.
const userSchema = new mongoose.Schema({

    email: { type: String, required: true, unique: true, lowercase: true, trim: true }, //email.
    loginid: { type: String, unique: true, required: true, trim: true, lowercase: true }, //username/loginid.
    password: { type: String, required: true, default: 'password@123' }, //login password.
    active: { type: Boolean, required: true, default: true }, //active status (true/false).
    name: { type: String, required: true, lowercase: true, trim: true }, //full user name.
    mobile: { type: String, unique: true, required: true, trim: true }, //mobile number.
    role: { type: String, required: true, lowercase: true, default: 'user', trim: true }, //role (lasm/flsp/pic/bu/client/admin).
    joining_date: { type: [Date], required: true, default: Date.now }, //list of dates.
    leaving_date: [Date], //list of dates.
    inserted_at: { type: Object, default: date.dateNow() }, //Timestamp.
    sales_office: { type: [String], required: true, uppercase: true, trim: true }, //sales office.
    gtm_city: { type: [String], required: true, lowercase: true, trim: true }, //list cites.
    beat: [String], //list of mapped beats.
    division: { type: [String], required: true, trim: true }, //list of divisions.
    dc: { type: [String], required: true, trim: true }, //list of distribution channels.
    weekly_off: { type: [String], required: true, default: 'Sunday', trim: true } //list of weekly offs.

})

//Hashing Password before saving.
userSchema.pre('save', async function (this: any, next: any) {
    try {
        //Generate a salt.
        const salt = await bcrypt.genSalt(10);
        //Generate a password hash (salt + hash).
        const passwordHash = await bcrypt.hash(this.password, salt);
        this.password = passwordHash;
        next();
    } catch (error) {
        next(error);
    }
});

//Password Validation.
userSchema.methods.isValidPassword = async function (newPassword: string) {
    try {
        return await bcrypt.compare(newPassword, this.password);
    } catch (error) {
        throw new Error(error);
    }
}

//Encrypt Password.
userSchema.methods.encryptPassword = async function (newPassword: string) {
    try {
        //Generate a salt.
        const salt = await bcrypt.genSalt(10);
        //Generate a password hash (salt + hash) and return HashedPassword.
        return await bcrypt.hash(newPassword, salt);
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = mongoose.model('user', userSchema)

//User Interface.
export interface User {
    id: string,
    email: string,
    password: string,
    loginid: string,
    active: boolean,
    name: string,
    mobile: string,
    role: string,
    joining_date: [Date],
    leaving_date: [Date],
    inserted_at: Date,
    sales_office: string,
    gtm_city: [string],
    beat: [string],
    division: [string],
    dc: [string],
    weekly_off: [string]
}