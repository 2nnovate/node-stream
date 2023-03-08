const { Readable, Writable, pipeline } = require('stream');
const fs = require('fs');
const path = require('path');

const APP_PATH = path.join(__dirname, '..');

const KB = 1024;

class CsvReadStream extends Readable {
  constructor({
    filePath = '',
    rules = {},
  }, readableOptions = {}) {
    super(readableOptions);
    this._filePath = filePath;
    this._rules = rules;
    this._part = 0;
    this._leftover = null;
  }

  getValidContact(contactValue) {
    if (!this._leftover) {
      const [name, email, phone] = contactValue.split(',');
      return { name, email, phone };
    }

    let contact = {
      name: this._leftover.name,
      email: this._leftover.email,
      phone: this._leftover.phone,
    };
    const currentProperties = contactValue.split(',').filter(v => v);
    switch (currentProperties.length) {
      case 1:
        contact.phone = `${contact.phone || ''}${currentProperties[0]}`;
        break;
      case 2:
        contact.email = `${contact.email || ''}${currentProperties[0]}`;
        contact.phone = `${contact.phone || ''}${currentProperties[1]}`;
        break;
      case 3:
        contact.name = `${contact.name || ''}${currentProperties[0]}`;
        contact.email = `${contact.email || ''}${currentProperties[1]}`;
        contact.phone = `${contact.phone|| ''}${currentProperties[2]}`;
        break;
      default:
        throw new Error('Cannot get valid contact');
    }

    return contact;
  }

  _read(size) {
    const fileDescriptor = fs.openSync(this._filePath, 'r');
    if (!fileDescriptor) return;

    const buffer = Buffer.alloc(size);
    const offset = this._part * size;
    const bytesRead = fs.readSync(fileDescriptor, buffer, 0, size, offset);
    if (!bytesRead) {
      fs.closeSync(fileDescriptor);
      this.push(null);
      return;
    }

    this._part += 1;

    const data = buffer.slice(0, bytesRead).toString();
    const list = data.split('\r\n').filter(v => v);
    list.forEach((item, index) => {
      let contact = {};
      const isFirstItem = index === 0;
      if (isFirstItem) {
        contact = this.getValidContact(item);
        if (!contact) return;

        this.push(contact);
        return;
      }

      const [name, email, phone] = item.split(',');
      const isLastItem = index === (list.length - 1);
      if (isLastItem) {
        const isValidItem = (name && this._rules.name.test(name))
          && (email && this._rules.phone.test(phone))
          && (phone && this._rules.phone.test(phone));
        if (!isValidItem) {
          this._leftover = {
            name: name || null,
            email: email || null,
            phone: phone || null,
          };
          return;
        }
      }

      this._leftover = null;
      contact = this.getValidContact(item);
      this.push(contact);
    });
  }
}

class ContactWriteStream extends Writable {
  constructor(writableOptions = {}) {
    super(writableOptions);
    this._contactRepository = {
      insert: (data) => {
        console.log(`INSERT INTO contact (name, email, phone) VALUES (\'${data.name}\', \'${data.email}\', \'${data.phone}\');`);
      }
    };
  }

  _createContact({ name, email, phone }) {
    if (!name) throw new Error('name is required');
    if (!email) throw new Error('email is required');
    if (!phone) throw new Error('phone is required');

    this._contactRepository.insert({ name, email, phone });
  }

  _write(contact, encoding, callback) {
    try {
      this._createContact(contact);
      callback();
    } catch (error) {
      callback(error);
    }
  }
}

const csvReadStream = new CsvReadStream({
  filePath: `${APP_PATH}/static/contacts.csv`,
  rules: {
    name: /.+/,
    email: /.+@.+\.com.?/,
    phone: /\d{3}-\d{4}-\d{4}/,
  },
}, {
  highWaterMark: 1 * KB,
  objectMode: true,
});
const contactWriteStream = new ContactWriteStream({ objectMode: true });

pipeline(
  csvReadStream,
  contactWriteStream,
  (err) => {
    if (err) {
      console.log('[err]', err);
      // Handle error
      return;
    }

    // Notify to user (by email)
    console.log('모든 연락처를 저장하였습니다.');
  },
);
