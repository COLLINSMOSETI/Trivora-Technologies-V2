require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const db = require('./db');
const app = express();
const PORT = Number(process.env.PORT || 5000);

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.startsWith('replace_with'))) {
  console.error('Production requires a strong JWT_SECRET of at least 32 characters.'); process.exit(1);
}
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://127.0.0.1:5500,http://localhost:5500').split(',').map(s=>s.trim()).filter(Boolean);
app.use(helmet({crossOriginResourcePolicy:{policy:'cross-origin'}}));
app.use(cors({origin(origin,callback){if(!origin||allowedOrigins.includes(origin))return callback(null,true);return callback(new Error('Origin is not allowed by CORS.'));}}));
app.use(express.json({limit:'30kb'}));
app.use('/api/auth/login', rateLimit({windowMs:15*60*1000,limit:10,standardHeaders:true,legacyHeaders:false,message:{message:'Too many sign-in attempts. Please try again later.'}}));
app.use('/api/inquiries', rateLimit({windowMs:15*60*1000,limit:8,standardHeaders:true,legacyHeaders:false,message:{message:'Too many submissions. Please try again later.'}}));
const asyncRoute = fn => (req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
function requireAdmin(req,res,next){
 const header=req.headers.authorization||'';const token=header.startsWith('Bearer ')?header.slice(7):'';
 if(!token)return res.status(401).json({message:'Please sign in to continue.'});
 try{req.admin=jwt.verify(token,process.env.JWT_SECRET||'development_only_change_me_before_deploying_123456');next();}catch{return res.status(401).json({message:'Your session has expired. Please sign in again.'});}
}
function cleanString(value,max){return typeof value==='string'?value.trim().slice(0,max):'';}
function validEmail(value){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);}
app.get('/api/health',asyncRoute(async(req,res)=>{await db.query('SELECT 1');res.json({status:'ok',service:'Trivora Technologies API',database:'connected'});}));
app.get('/api/services',asyncRoute(async(req,res)=>{const {rows:services}=await db.query('SELECT id,name,slug,description,starting_price_ksh FROM services WHERE is_active=TRUE ORDER BY id');res.json({services});}));
app.post('/api/inquiries',asyncRoute(async(req,res)=>{
 const name=cleanString(req.body.name,120),email=cleanString(req.body.email,190).toLowerCase(),phone=cleanString(req.body.phone,40),service=cleanString(req.body.service,100),budget=cleanString(req.body.budget,80),message=cleanString(req.body.message,5000);
 if(name.length<2)return res.status(400).json({message:'Please enter your name (at least 2 characters).'});
 if(!validEmail(email))return res.status(400).json({message:'Please enter a valid email address.'});
 if(!service)return res.status(400).json({message:'Please choose a service.'});
 if(message.length<10)return res.status(400).json({message:'Please add a little more detail (at least 10 characters).'});
 const result=await db.query('INSERT INTO inquiries (name,email,phone,service,budget,message) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',[name,email,phone||null,service,budget||null,message]);
 // Email notification is optional. Database storage succeeds even if SMTP is not configured.
 if(process.env.SMTP_HOST&&process.env.SMTP_USER&&process.env.SMTP_PASSWORD&&process.env.NOTIFY_EMAIL){
  try{const transporter=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:String(process.env.SMTP_SECURE)==='true',auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}});await transporter.sendMail({from:process.env.FROM_EMAIL||process.env.SMTP_USER,to:process.env.NOTIFY_EMAIL,replyTo:email,subject:`New Trivora website enquiry: ${service}`,text:`Name: ${name}\nEmail: ${email}\nPhone: ${phone||'Not provided'}\nService: ${service}\nBudget: ${budget||'Not specified'}\n\nMessage:\n${message}`});}catch(err){console.error('Optional enquiry notification email failed:',err.message);}
 }
 res.status(201).json({message:'Enquiry received successfully.',id:result.rows[0].id});
}));
app.post('/api/auth/login',asyncRoute(async(req,res)=>{
 const email=cleanString(req.body.email,190).toLowerCase(),password=typeof req.body.password==='string'?req.body.password:'';
 if(!validEmail(email)||!password)return res.status(400).json({message:'Enter your admin email and password.'});
 const {rows}=await db.query('SELECT id,name,email,password_hash FROM admins WHERE email=$1 LIMIT 1',[email]);
 const admin=rows[0];if(!admin||!(await bcrypt.compare(password,admin.password_hash)))return res.status(401).json({message:'Invalid email or password.'});
 const token=jwt.sign({sub:String(admin.id),email:admin.email,name:admin.name},process.env.JWT_SECRET||'development_only_change_me_before_deploying_123456',{expiresIn:process.env.JWT_EXPIRES_IN||'8h'});
 res.json({token,admin:{name:admin.name,email:admin.email}});
}));
app.get('/api/admin/inquiries',requireAdmin,asyncRoute(async(req,res)=>{const {rows:inquiries}=await db.query('SELECT id,name,email,phone,service,budget,message,status,created_at,updated_at FROM inquiries ORDER BY created_at DESC LIMIT 500');res.json({inquiries});}));
app.patch('/api/admin/inquiries/:id',requireAdmin,asyncRoute(async(req,res)=>{
 const id=Number(req.params.id),status=cleanString(req.body.status,30);const allowed=['new','in_progress','contacted','completed','archived'];
 if(!Number.isSafeInteger(id)||id<1)return res.status(400).json({message:'Invalid enquiry ID.'});if(!allowed.includes(status))return res.status(400).json({message:'Invalid enquiry status.'});
 const result=await db.query('UPDATE inquiries SET status=$1 WHERE id=$2',[status,id]);if(!result.rowCount)return res.status(404).json({message:'Enquiry not found.'});res.json({message:'Enquiry status updated.'});
}));
app.delete('/api/admin/inquiries/:id',requireAdmin,asyncRoute(async(req,res)=>{const id=Number(req.params.id);if(!Number.isSafeInteger(id)||id<1)return res.status(400).json({message:'Invalid enquiry ID.'});const result=await db.query('DELETE FROM inquiries WHERE id=$1',[id]);if(!result.rowCount)return res.status(404).json({message:'Enquiry not found.'});res.json({message:'Enquiry deleted.'});}));
app.use((req,res)=>res.status(404).json({message:'Endpoint not found.'}));
app.use((err,req,res,next)=>{if(err.message==='Origin is not allowed by CORS.')return res.status(403).json({message:err.message});console.error(err);res.status(500).json({message:'An unexpected server error occurred.'});});
app.listen(PORT,()=>console.log(`Trivora API listening on port ${PORT}`));
