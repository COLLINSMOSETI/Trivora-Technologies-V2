require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('./db');
(async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname,'../database/schema.sql'),'utf8');
    await db.query(sql);
    console.log('Trivora database and tables are ready.');
  } finally {
    await db.end();
  }
})().catch(err => { console.error('Database setup failed:',err.message); process.exit(1); });
