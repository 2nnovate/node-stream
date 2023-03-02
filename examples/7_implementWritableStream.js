const { Writable, Readable } = require('stream');

class CustomWritable extends Writable {
  _write(chunk, encoding, callback) {
    console.log('[in writable]', chunk.toString());
    callback();
  }
}

const customWritable = new CustomWritable();

const customReadable = new Readable();
customReadable.push('Hello');
customReadable.push('my name is');
customReadable.push('Eloy');
customReadable.push(null);

customReadable.pipe(customWritable);
