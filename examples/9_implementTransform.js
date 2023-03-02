const { Transform, Readable, pipeline } = require('stream');

class CustomReadable extends Readable {
  constructor(options = {}) {
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

    this.push(`${data}`);
    this._position += 1;
  }
}

class CustomTransform extends Transform {
  constructor(options = {}) {
    super(options);
    this._count = 0;
  }

  _transform(chunk, encoding, callback) {
    console.log(`[transform] ${chunk.toString()}`);
    this._count += 1;
    this.push(`${String(this._count)}\n`);
    callback();
  }
}

const customReadable = new CustomReadable();
const customTransform = new CustomTransform();

pipeline(
  customReadable,
  customTransform,
  process.stdout,
  (err) => {
    if (err) {
      // handel error
      return;
    }

    console.log('end pipeline');
  },
);
