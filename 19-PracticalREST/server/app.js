const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const { default: mongoose } = require('mongoose');

const app = express();

// file upload configuration
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
// can parse JSON data from incoming JsON data to extract it on the body.
app.use(bodyParser.json()); // application/json

// register multer
app.use(
    // telling multer where we're storing, how we're filtering and where to extract a single file from the images folder
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);

// express/node serving image statically, we identify the /images route
app.use('/images', express.static(path.join(__dirname, 'images')));

// middleware to solve the CORS problem.
// you can set multiple domians with comma. * is anything.
// set all origins and all server methods.
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*'); // or OPTIONS, GET, POST, PUT, PATCH, DELETE
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
    ); // could use a wildcard (*).
    // This says clients can send requests that hold extra authorziation and content types in the header
    next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

// we use this as the next error middleware handler.
// for example the next() in the catch() block in the createPost method will hit this.
app.use((err, req, res, next) => {
    console.log(err);
    const status = err.statusCode || 500;
    const message = err.message;
    const data = err.data;
    // we return this to the user with a status and message from the createPost method
    res.status(status).json({
        message: message,
        data: data,
    });
});

const uri =
    'mongodb+srv://mhofwell:lHZO47CNmasKMr9S@cluster0.lgz2ngw.mongodb.net/messages?retryWrites=true&w=majority';

mongoose
    .connect(uri)
    .then((result) => {
        console.log('MongoDb Connected');
        const server = app.listen(8080);
        // when you () at the end of a function you execute the function that that function returns.
        // we use this http server to establish our socket connection.
        const io = require('./socket').init(server)
        // will get executed for every client that connects
        io.on('connection', (socket) => {
            console.log('Client connected');
        });
    })
    .catch((err) => console.log(err));
