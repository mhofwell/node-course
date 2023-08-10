const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    //   const isLoggedIn = req
    //     .get('Cookie')
    //     .split(';')[1]
    //     .trim()
    //     .split('=')[1] === 'true';
    console.log(req.session.isLoggedIn);
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: true,
    });
};

exports.postLogin = (req, res, next) => {
    User.findById('64d276b07df2abdc506b5035')
        .then((user) => {
            req.session.isLoggedIn = true;
            req.session.user = user;
            // save the session before you redirect. Redirect fires independently meaning page renders before information is refreshed. 
            req.session.save((err) => {
                console.log(err);
                res.redirect('/');
            });
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.postLogout = (req, res, next) => {
    // destroys the session saved on the session store on the sever.
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
};
