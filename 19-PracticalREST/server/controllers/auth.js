const User = require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty) {
        const err = new Error('Validation failed');
        err.statusCode = 422;
        err.data = validationErrors.array();
        throw err;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    bcrypt
        .hash(password, 12)
        .then((hashedPw) => {
            const user = new User({
                email: email,
                password: hashedPw,
                name: name,
            });
            user.save().then((user) => {
                res.status(201).json({
                    message: 'User created.',
                    userId: user._id,
                });
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.login = (req, res, next) => {
    const email = req.body.email;
    console.log(email);
    const password = req.body.password;
    let loadedUser;

    User.findOne({ email: email })
        .then((user) => {
            if (!user) {
                const err = new Error(
                    'A user with this email could not be found.'
                );
                err.statusCode = 401;
                throw err;
            }
            loadedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then((isEqual) => {
            if (!isEqual) {
                const err = new Error('Wrong password');
                err.statusCode = 401;
                throw err;
            }
            // creates and signs a JSON Web Token to return to the client.
            const token = jwt.sign(
                {
                    email: loadedUser.email,
                    userId: loadedUser._id.toString(),
                    // secret key is below
                    // 1 hour token expiry
                },
                'secret',
                { expiresIn: '1h' }
            );
            res.status(200).json({
                token: token,
                userId: loadedUser._id.toString(),
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};
