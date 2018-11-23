import { Request, Response, NextFunction } from 'express-serve-static-core';
import _ from 'lodash';

const router = require('express-promise-router')();
const Product = require('../models/product');
const passport = require('passport');
const passportjs = require('../passport'); //passport.js 
const xlsx = require('xlsx');

//Middleware.
const passportJwt = passport.authenticate('jwt', { session: false });

//Bulk Products Add.
router.post('/add', passportJwt, async (req: Request, res: Response, next: NextFunction) => {

    const workbook = xlsx.readFile('product.xlsx');
    var rows = xlsx.utils.sheet_to_json(workbook.Sheets['Sheet1']);

    //Removing Duplicates.
    rows = _.uniqWith(rows, _.isEqual);

    //Map SKU Code.
    const skuCodes = rows.map((item: any) => item.sku_code);

    //Check whether products already exists.
    const _products = await Product.find({ sku_code: { $in: skuCodes } }, { _id: 0 });

    //Filtering already existing products.
    var products = _.differenceBy(rows, _products, 'sku_code');

    //Add filtered products to database.
    const Result = await Product.insertMany(products);

    //Response with number of documents modified.
    res.status(200).json({ success: `Products added successfully!`, Result });
});

//Get Products.
router.post('/', passportJwt, async (req: Request, res: Response, next: NextFunction) => {
    const { division, category, subcategory1, subcategory2, dvcode, client_dv_code, active, material_group, sku, sku_code } = req.body;

    var query: any = {};

    division.length > 0 ? query.division = { $in: division } : (req.user.division.length > 0 ? query.dvcode = { $in: req.user.division } : null);
    category.length > 0 ? query.category = { $in: category } : null;
    subcategory1.length > 0 ? query.subcategory1 = { $in: subcategory1 } : null;
    subcategory2.length > 0 ? query.subcategory2 = { $in: subcategory2 } : null;
    client_dv_code.length > 0 ? query.client_dv_code = { $in: client_dv_code } : null;
    dvcode.length > 0 ? query.dvcode = { $in: dvcode } : null;
    sku.length > 0 ? query.sku = { $in: sku } : null;
    sku_code.length > 0 ? query.sku_code = { $in: sku_code } : null;
    material_group.length > 0 ? query.material_group = { $in: material_group } : null;
    active !== '' ? query.active = active : null;

    const products = await Product.find(query);

    if (products.length <= 0) {
        res.status(404).json({ success: false, message: 'No Products found!' });
    }
    //Response with Products.
    res.status(200).json({ success: true, message: 'Products Loaded Successfully!', products });
});

//Get Divisions Of Products.
router.post('/division', passportJwt, async (req: Request, res: Response, next: NextFunction) => {

    const { divisions } = req.body;

    var query: any = {}

    divisions.length > 0 ? query.division = { $in: divisions } : (req.user.division.length > 0 ? query.dvcode = { $in: req.user.division } : null);

    const division = await Product.aggregate([
        { $match: query },
        { $group: { '_id': { division: '$division', code: '$client_dv_code', dvcode: '$dvcode' } } },
        { $group: { '_id': null, 'division': { $push: '$_id' } } },
        { $project: { '_id': 0 } }
    ]);

    const category = await Product.aggregate([
        { $match: query },
        { $group: { '_id': { code: '$client_dv_code', category: '$category' } } },
        { $group: { '_id': null, 'category': { $push: '$_id' } } },
        { $project: { '_id': 0 } }
    ]);

    const subcategory1 = await Product.aggregate([
        { $match: query },
        { $group: { '_id': { subcategory1: '$subcategory1', category: '$category' } } },
        { $group: { '_id': null, 'subcategory1': { $push: '$_id' } } },
        { $project: { '_id': 0 } }
    ]);

    const subcategory2 = await Product.aggregate([
        { $match: query },
        { $group: { '_id': { subcategory2: '$subcategory2', subcategory1: '$subcategory1' } } },
        { $group: { '_id': null, 'subcategory2': { $push: '$_id' } } },
        { $project: { '_id': 0 } }
    ]);

    var result = {
        division: division[0].division,
        category: category[0].category,
        subcategory1: subcategory1[0].subcategory1,
        subcategory2: subcategory2[0].subcategory2
    }

    //Response with Products.
    res.status(200).json({ success: true, message: 'List Data Loaded Successfully!', result });
});


module.exports = router;