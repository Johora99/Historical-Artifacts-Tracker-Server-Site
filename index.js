const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/',async(req,res)=>{
  res.send('My Historical Artifacts Tracker')
})






app.listen(port,()=>{
  console.log(`My Server Port is :${port}`)
})