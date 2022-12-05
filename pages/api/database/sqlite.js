// const sqlite3 = require('sqlite3').verbose();
const sqlite3 = require('sqlite3');

// clean up prev session if there was
try {
    require('fs').rmSync("./data/rental.db");
} catch (e) {
    // do nothing
}

module.exports.db = new sqlite3.Database('./data/rental.db');