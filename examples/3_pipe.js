const { createReadStream } = require('fs');
const path = require('path');

const APP_PATH = path.join(__dirname, '..');
const filePath = `${APP_PATH}/static/dummyText.txt`;

const dummyTextStream = createReadStream(filePath, {
  highWaterMark: 1 * 1024, // chunk size 1MB
});

dummyTextStream.pipe(process.stdout);
