'use script';

const _fs = require('fs');
const rimraf = require('rimraf');

module.exports = (project_code, whichFolder, currentFile) => {
    currentFile = currentFile.split('_')[0].split('.')[0];
    console.log('myfile', currentFile);

    const files = _fs.readdirSync(`${process.env.FOLDER_PATH}/uploads/${project_code}/${whichFolder}`);

    files.forEach(file => {
        let fileTime = file.split('_')[0].split('.')[0];
        console.log('fileLoop', fileTime);

        if ((currentFile - fileTime) > 5 * 60 * 1000) {
            let fileType = _fs.statSync(`${process.env.FOLDER_PATH}/uploads/${project_code}/${whichFolder}/${file}`);
            console.log('fileType', `${process.env.FOLDER_PATH}/uploads/${project_code}/${whichFolder}/${file}`);

            if (fileType.isDirectory())
                rimraf(fileType);
            else if (fileType.isFile())
                _fs.unlinkSync(fileType);
        }
    });
};