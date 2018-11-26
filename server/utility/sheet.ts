'use strict';

const xlsx = require('xlsx');

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
    }
};