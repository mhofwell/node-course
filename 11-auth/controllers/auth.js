const User = require('../models/user');
const bcrypt = require('bcryptjs');

const crypto = require('crypto');

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message,
    });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message,
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email: email })
        .then((user) => {
            if (!user) {
                req.flash('error', 'Invalid email or password.');
                return res.redirect('/login');
            }
            bcrypt
                .compare(password, user.password)
                .then((doMatch) => {
                    // in both a matching or non matching case we make it into this then block.
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save((err) => {
                            console.log(err);
                            res.redirect('/');
                        });
                    }
                    req.flash('error', 'Invalid email or password.');
                    res.redirect('/login');
                })
                .catch((err) => {
                    console.log(err);
                    res.redirect('/login');
                });
        })
        .catch((err) => console.log(err));
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    User.findOne({
        email: email,
    })
        .then((userDoc) => {
            if (userDoc) {
                req.flash('error', 'Email exists, please pick another');
                return res.redirect('/signup');
            }
            return bcrypt
                .hash(password, 12)
                .then((hashedPw) => {
                    const user = new User({
                        email: email,
                        password: hashedPw,
                        cart: { items: [] },
                    });
                    return user.save();
                })
                .then((result) => {
                    console.log(result);
                    res.redirect('/login');
                    // return transporter.sendMail({
                    //     to: email,
                    //     from: 'shop@course.com',
                    //     subject: 'Success!',
                    //     html: '<h1> You did it!</h1>',
                    // });
                });
        })

        .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
};

exports.getReset = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    // view path
    res.render('auth/reset', {
        // url path
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message,
    });
};

exports.postReset = (req, res, next) => {
    crypto
        .randomBytes(32, (err, buffer) => {
            if (err) {
                return res.redirect('/reset');
            }
            // need hex to convert hex to ASCII
            const token = buffer.toString('hex');
            const user = User.findOne({ email: req.body.email })
                .then()
                .catch((err) => console.log(err));
            if (!user) {
                req.flash('error', 'No account found');
            }
            user.resetToken = token;
            // in milliseconds
            user.resetTokenExpiration = Date.now() + 3600000;
            user.save();
        })
        .then((result) => {
            res.redirect('/');
            transporter.sendMail({
                to: req.body.email,
                from: 'shop@course.com',
                subject: 'Password Reset Link',
                html: `
                <p>You requested a password reset</p>
                <p>Click this <a href="http://localhost:3000/reset/${token}>link</a> to set a new password</p>
                `,
            });
        })
        .catch((err) => {
            console.log(err);
        });
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    // view path
    res.render('auth/reset', {
        // url path
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message,
    });
};

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({
        resetToken: token,
        // find a user that has the token and whose expiry is greater than the date now.
        resetTokenExpiration: { $gt: Date.now() },
    })
        .then((user) => {
            let message = req.flash('error');
            if (message.length > 0) {
                message = message[0];
            } else {
                message = null;
            }
            res.render('auth/new-password', {
                // url path
                path: '/new-password',
                pageTitle: 'New Password',
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token,
            });
        })
        .catch((err) => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const token = req.body.passwordToken;
    let resetUser;

    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: { $gt: Date.now() },
        _id: userId,
    })
        .then((user) => {
            return bcrypt.hash(newPassword, 12);
        })
        .then((hashedPw) => {
            resetUser.password = hashedPw;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then((result) => {
            res.redirect('/login');
        })
        .catch((err) => {
            console.log(err);
        });
};
