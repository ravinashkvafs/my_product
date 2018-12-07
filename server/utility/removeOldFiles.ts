'use script';

const _fs = require('fs');
const rimraf = require('rimraf');

module.exports = (project_code, whichFolder, currentFile) => {
    //extracting time from file
    currentFile = currentFile.split('_')[0].split('.')[0];

    //array files in folder
    const files = _fs.readdirSync(`${process.env.FOLDER_PATH}/uploads/${project_code}/${whichFolder}`);

    //iterating over files
    files.forEach(file => {
        //extracting time from iteratee file
        let fileTime = file.split('_')[0].split('.')[0];

        //checking time gap more than 5 min
        if ((currentFile - fileTime) > 5 * 60 * 1000) {
            let fullPath = `${process.env.FOLDER_PATH}/uploads/${project_code}/${whichFolder}/${file}`;
            let fileType = _fs.statSync(fullPath);

            if (fileType.isDirectory())
                rimraf(fullPath);
            else if (fileType.isFile())
                _fs.unlinkSync(fullPath);
        }
    });
};