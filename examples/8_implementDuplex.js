const { Duplex, pipeline } = require('stream');

class CustomDuplex extends Duplex {
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

  _write(chunk, encoding, callback) {
    console.log(chunk.toString());
    callback();
  }
}

const customDuplex = new CustomDuplex();
const customDuplex2 = new CustomDuplex();

pipeline(
  customDuplex,
  customDuplex2,
  (err) => {
    if (err) {
      // handel error
      return;
    }

    console.log('end pipeline');
  },
);
