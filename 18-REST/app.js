const express = require('express');
const bodyParser = require('body-parser');

const feedRoutes = require('./routes/feed');

const app = express();

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
// can parse JSON data from incoming JsON data to extract it on the body.
app.use(bodyParser.json()); // application/json

// middleware to solve the CORS problem.
// you can set multiple domians with comma. * is anything.
// set all origins and all server methods.
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*'); // or GET, POST, PUT, PATCH, DELETE
    res.setHeader('Access-Control-Allow-Header', 'Content-Type, Authorization'); // could use a wildcard (*).
    // This says clients can send requests that hold extra authorziation and content types in the header
    next();
});

app.use('/feed', feedRoutes);

app.listen(8080);
