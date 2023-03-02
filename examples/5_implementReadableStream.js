const { Readable } = require('stream');

class ReadableClass extends Readable {
  constructor(options) {
    super(options);
    this._data = ['Hello', 'my name is', 'Eloy'];
    this._position = 0;
  }

  _read(size) {
    const data = this._data[this._position];
    if (!data) {
      this.push(null);
      return;
    }

    this.push(`${data}\n`);
    this._position += 1;
  }
}

const readableClass = new ReadableClass();
readableClass.pipe(process.stdout);
