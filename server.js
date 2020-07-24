'use strict';
const server = require('express');
const cors = require('cors');
// const { request } = require('express');
require('dotenv').config();

const app = server();
app.use(cors());

const PORT = process.env.PORT || 3100;

app.listen(PORT, ()=>{
    console.log('Server is listening to port ', PORT);
  });














