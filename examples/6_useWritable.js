const { createWriteStream } = require('fs');
const path = require('path');

const APP_PATH = path.join(__dirname, '..');

const outputTextFilePath = `${APP_PATH}/static/output.txt`;
const fileWriteStream = createWriteStream(outputTextFilePath);

fileWriteStream.write('This is a file.\n');
fileWriteStream.write('Created by a Stream.');
fileWriteStream.end();
