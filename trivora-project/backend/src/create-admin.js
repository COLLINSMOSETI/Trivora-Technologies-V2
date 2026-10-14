require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');
const readline = require('readline/promises');
const { stdin: input, stdout: output } = require('process');
(async () => {
 const rl=readline.createInterface({input,output});
 try {
  const name=(await rl.question('Administrator name: ')).trim();
  const email=(await rl.question('Administrator email: ')).trim().toLowerCase();
  const password=await rl.question('Strong password (12+ characters recommended): ');
  if(!name||!email.includes('@')||password.length<10) throw new Error('Enter a name, valid email, and password with at least 10 characters.');
  const existing=await db.query('SELECT id FROM admins WHERE email=$1',[email]);
  if(existing.rowCount) throw new Error('An administrator with that email already exists.');
  const hash=await bcrypt.hash(password,12);
  await db.query('INSERT INTO admins (name,email,password_hash) VALUES ($1,$2,$3)',[name,email,hash]);
  console.log(`Administrator ${email} created. Keep the credentials private.`);
 } catch(e){console.error(e.message);process.exitCode=1;} finally {rl.close();await db.end();}
})();
