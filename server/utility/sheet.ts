'use strict';

const xlsx = require('xlsx');
const path = require('path');

const Useless = require('../models/useless_files');
const RemoveFilesFolders = require('./removeOldFiles');

module.exports = {
    getJsonFromSheet: (filePath, sheetName) => {
        const workbook = xlsx.readFile(filePath);

        const fs = require('fs');
        fs.unlinkSync(filePath);

        return xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    },
    getArrayFromSheet: (filePath, sheetName) => {
        const workbook = xlsx.readFile(filePath);

        const fs = require('fs');
        fs.unlinkSync(filePath);

        return xlsx.utils.make_json(workbook.Sheets[sheetName], { header: 1 });
    },
    getSheetPathFromJson: (project_code, headerData, fileName, sheetName = 'Sheet1') => {
        const fs = require('fs');
        if (!fs.existsSync(`uploads`))
            fs.mkdirSync(`uploads`);
        if (!fs.existsSync(`uploads/${project_code}`))
            fs.mkdirSync(`uploads/${project_code}`);
        if (!fs.existsSync(`uploads/${project_code}/download_format`))
            fs.mkdirSync(`uploads/${project_code}/download_format`);

        //making worksheet from json
        const ws = xlsx.utils.json_to_sheet(headerData);

        /* add to workbook */
        // const workbook = xlsx.utils.book_new();
        // xlsx.utils.book_append_sheet(workbook, ws, sheetName);

        //making workbook
        const workbook = {
            Sheets: {},
            SheetNames: [sheetName]
        };
        workbook['Sheets'][sheetName] = {};
        workbook['Sheets'][sheetName]['!ref'] = `A1:${String.fromCharCode(65 + headerData.length - 1)}1`;
        // workbook['Sheets'][sheetName]['!dataValidation'] = [
        //     { sqref: '$A:$A', values: ['foo', 'bar', 'baz'] }
        // ];

        headerData.forEach((column, keyI) => {
            workbook['Sheets'][sheetName][String.fromCharCode(65 + keyI) + 1] = { t: 's', v: column.field };
            workbook['Sheets'][sheetName][String.fromCharCode(65 + keyI) + 2] = { t: 'n', v: 123 };
            // for (let i = 2; i <= 1000; i++) {
            //     workbook['Sheets'][sheetName][String.fromCharCode(65 + keyI) + i] = { t: 's', v: 'true' };
            // }
        });

        const finalFileName = `${Date.now()}_${fileName}.xlsx`;
        const finalPath = `${process.env.FOLDER_PATH}/uploads/${project_code}/download_format/${finalFileName}`;
        // console.log(JSON.stringify(workbook));

        //removing old files/folders
        RemoveFilesFolders(project_code, 'download_format', finalFileName);

        xlsx.writeFile(workbook, finalPath, { bookType: 'xlsx', type: 'buffer' });

        Useless.create({ project_code, type: fileName, path: finalPath });

        return { finalPath, finalFileName };
    }
};