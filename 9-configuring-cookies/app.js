const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session);

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGO_URI =
    'mongodb+srv://mhofwell:ZDTQ8kJZLvtnkarX@cluster0.lgz2ngw.mongodb.net/shop?retryWrites=true&w=majority';

const app = express();
const store = new MongoDbStore({
    uri: MONGO_URI,
    collection: 'sessions',
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
// initialize the session. Secret should be a long garble
app.use(
    session({
        secret: 'mysecret',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 10 },
        store: store,
    })
);

app.use((req, res, next) => {
    User.findById('64d276b07df2abdc506b5035')
        .then((user) => {
            req.user = user;
            next();
        })
        .catch((err) => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
    .connect(MONGO_URI, { useUnifiedTopology: true, useNewUrlParser: true })
    .then((result) => {
        User.findOne().then((user) => {
            if (!user) {
                const user = new User({
                    name: 'Michael',
                    email: 'mike@mike.com',
                    cart: {
                        items: [],
                    },
                });
                user.save();
            }
        });
        app.listen(3000);
    })
    .catch((err) => {
        console.log(err);
    });
