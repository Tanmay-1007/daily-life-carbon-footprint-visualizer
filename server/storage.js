const fs = require('fs');
const path = require('path');

const storagePath = path.join(__dirname, 'storage.json');

function readRecords() {
  try {
    const raw = fs.readFileSync(storagePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function writeRecords(records) {
  fs.writeFileSync(storagePath, JSON.stringify(records, null, 2));
}

function addRecord(record) {
  const records = readRecords();
  records.unshift(record);
  writeRecords(records.slice(0, 20));
  return records;
}

module.exports = { readRecords, addRecord };
