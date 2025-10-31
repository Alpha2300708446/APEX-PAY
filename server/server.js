// Simple Express server: stores loan requests and contact messages, demonstrates Flutterwave payment creation
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,'..')));

const DATA_DIR = path.join(__dirname,'..','data');
const LOANS_FILE = path.join(DATA_DIR,'loans.json');
if(!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR,{recursive:true});
if(!fs.existsSync(LOANS_FILE)) fs.writeFileSync(LOANS_FILE,'[]');

app.post('/api/loans', (req,res)=>{
  const loan = req.body;
  if(!loan.fullname||!loan.nid||!loan.amount) return res.status(400).json({ok:false,message:'Missing fields'});
  const loans = JSON.parse(fs.readFileSync(LOANS_FILE));
  loans.unshift(loan);
  fs.writeFileSync(LOANS_FILE, JSON.stringify(loans,null,2));
  return res.json({ok:true});
});

app.get('/api/loans', (req,res)=>{
  const loans = JSON.parse(fs.readFileSync(LOANS_FILE));
  res.json(loans);
});

// Contact forwarding via nodemailer (simple)
const nodemailer = require('nodemailer');
app.post('/contact', async (req,res)=>{
  const {name,email,message} = req.body;
  if(!name||!email||!message) return res.status(400).json({ok:false,message:'Missing fields'});
  try{
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT||587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    await transporter.sendMail({ from: process.env.SMTP_USER, to: process.env.CONTACT_EMAIL||process.env.SMTP_USER, subject:`Contact from ${name}`, text:`${name} <${email}>\n\n${message}` });
    res.json({ok:true});
  }catch(err){ console.error(err); res.status(500).json({ok:false}); }
});

// Payment: Create a Flutterwave Checkout session (server-side) — placeholder
// Requires FLUTTERWAVE_SECRET in .env. This creates a payment link via Flutterwave Invoices / Payments API
app.post('/create-payment', async (req,res)=>{
  const {amount,currency,email} = req.body;
  if(!process.env.FLUTTERWAVE_SECRET) return res.status(500).json({ok:false,message:'No payment key configured'});
  try{
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET}` },
      body: JSON.stringify({
        tx_ref: `apex_${Date.now()}`,
        amount: amount.toString(),
        currency: currency || 'UGX',
        redirect_url: process.env.FLUTTERWAVE_REDIRECT || 'https://example.com',
        customer: {email: email, phonenumber: '256770822929', name: 'Apex Customer'},
        payment_options: 'card,mobilemoneyuganda,mpesa',
        meta: {consumer_id: 'ApexDemo'}
      })
    });
    const data = await response.json();
    return res.json(data);
  }catch(err){ console.error(err); return res.status(500).json({ok:false}); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Server running on', PORT));