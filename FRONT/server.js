var Pool = require('pg').Pool;
var dotenv = require('dotenv');
var express = require('express');
var http = require('http');
var https = require('https');
var fs = require('fs');
var logger = require('morgan');
var path = require('path');
var router = require('./routes/index');
var auth = require('express-openid-connect').auth;
var createProxyMiddleware = require("http-proxy-middleware").createProxyMiddleware;
var axios = require('axios');
dotenv.load();
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
var externalUrl = process.env.RENDER_EXTERNAL_URL;
var port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4092;
var apiBaseURL = 'https://localhost/8081';
var baseURL = externalUrl || "https://localhost:".concat(port);
var config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.CLIENT_SECRET,
    baseURL: baseURL,
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: 'https://dev-y7q23kiz1uhksjri.eu.auth0.com',
};
const pool = new Pool({
    connectionString: process.env.DBConfigLink,
    ssl: {
        rejectUnauthorized: false,
    },
});
module.exports = pool;

app.use(auth(config));
// Middleware to make the `user` object available for all views
app.use(function (req, res, next) {
    res.locals.user = req.oidc.user;
    res.locals.apiBaseURL = apiBaseURL;
    res.locals.baseURL = baseURL;
    next();
});
app.use('/', router);
if (externalUrl) {
    var hostname_1 = process.env.HOST; //ne 127.0.0.1
    console.log(hostname_1 + " " + port + " " + externalUrl);
    app.listen(port, hostname_1, function () {
        console.log("Server locally running at http://".concat(hostname_1, ":").concat(port, "/ and from\n    outside on ").concat(externalUrl));
    });
}
else {
    https.createServer({
        key: fs.readFileSync('server.key'),
        cert: fs.readFileSync('server.cert')
    }, app)
        .listen(port, function () {
        console.log("Server running at https://localhost:".concat(port, "/"));
    });
}
;

async function getCompetitionById(queryString) {
    try {
        const results = await pool.query("SELECT * FROM competition WHERE competition_id = " + queryString);
        console.log(results.rows[0]);
        return results.rows.map(r => ({ ...r }));
    } catch (error) {
        console.error('Error executing SQL query:', error);
    }
}

app.get('/competition/:id', async (req, res, next) => {
    try {
        const competitionId = req.params.id;
        const competition = await getCompetitionById(competitionId);

        if (competition) {
            res.json(competition);
        } else {
            console.log("error")
            res.json({ error: 'Competition not found' });
        }
    } catch (error) {
        console.error('Error in /competition/:id route:', error);
        next(error);
    }
    });
  
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.name = "404";
    next(err);
});
// Error handlers
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.redirect('/');
});
