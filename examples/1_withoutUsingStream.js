const { readFileSync } = require('fs');
const path = require('path');

const APP_PATH = path.join(__dirname, '..');

const dummyText = readFileSync(`${APP_PATH}/static/dummyText.txt`);
console.log('[dummyText.toString()]', dummyText.toString());

const used = Math.ceil(process.memoryUsage().heapUsed / 1024 / 1024);
console.log(`약 ${used}MB 메모리를 사용했습니다.`);
