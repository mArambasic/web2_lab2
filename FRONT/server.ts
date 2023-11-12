const dotenv = require('dotenv');
const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const logger = require('morgan');
const path = require('path');
const router = require('./routes/index');
const { createProxyMiddleware } = require("http-proxy-middleware");
const axios = require('axios');
const { Pool } = require('pg')
dotenv.config()

dotenv.load();

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());

const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4092;
const baseURL = externalUrl || `https://localhost:${port}`

const config = {
  baseURL: baseURL
};

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
  ssl : true
  })

// Middleware to make the `user` object available for all views
app.use(function (req, res, next) {
  res.locals.user = req.oidc.user;
  res.locals.baseURL = baseURL;
  next();
});

app.use('/', router);


if (externalUrl) {
  const hostname = process.env.HOST; //ne 127.0.0.1
  console.log(hostname + " " + port + " " + externalUrl) 
  app.listen(port, hostname, () => {
    console.log(`Server locally running at http://${hostname}:${port}/ and from
    outside on ${externalUrl}`);
    }
  )
} else {
  https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
    }, app)
  .listen(port, function () {
    console.log(`Server running at https://localhost:${port}/`);
  });
};

app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.name = "404";
  next(err);
});

// Error handlers
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.redirect('/');
});

export async function query(queryString) {
  const results = await pool.query(queryString);
  return results.rows.map(r => ({ ...r }));
}