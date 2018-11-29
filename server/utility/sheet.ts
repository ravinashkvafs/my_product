'use strict';

const xlsx = require('xlsx');
const path = require('path');

const Useless = require('../models/useless_files');

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

        /* make the worksheet */
        const ws = xlsx.utils.json_to_sheet(headerData);

        /* add to workbook */
        // const workbook = xlsx.utils.book_new();
        // xlsx.utils.book_append_sheet(workbook, ws, sheetName);

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
            // for (let i = 2; i <= 1000; i++) {
            //     workbook['Sheets'][sheetName][String.fromCharCode(65 + keyI) + i] = { t: 'b', v: true };
            // }
        });

        const finalFileName = `${Date.now()}_${fileName}.xlsx`;
        const finalPath = path.join(__dirname, `../uploads/${project_code}/download_format/`, finalFileName);
        // console.log(JSON.stringify(workbook));
        xlsx.writeFile(workbook, finalPath, { bookType: 'xlsx', type: 'buffer' });

        Useless.create({ project_code, type: fileName, path: finalPath });

        return finalPath;
    }
};