require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
(async () => {
  const connection = await mysql.createConnection({host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER||'root',password:process.env.DB_PASSWORD||'',multipleStatements:true});
  try { const sql = fs.readFileSync(path.join(__dirname,'../database/schema.sql'),'utf8'); await connection.query(sql); console.log('Trivora database and tables are ready.'); }
  finally { await connection.end(); }
})().catch(err => { console.error('Database setup failed:',err.message); process.exit(1); });
