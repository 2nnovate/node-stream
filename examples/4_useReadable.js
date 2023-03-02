const { Readable } = require('stream');

const customReadable = new Readable();

customReadable.push('Hello\n');
customReadable.push('my name is\n');
customReadable.push('Eloy\n');
customReadable.push(null);

customReadable.pipe(process.stdout);
