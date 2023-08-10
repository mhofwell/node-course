exports.getLogin = (req, res, next) => {
    console.log(req.session.isLoggedIn);
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false, // req.get('Cookie').split('=')[1],
    });
};

exports.postLogin = (req, res, next) => {
    // req.session.isLoggedIn = true;
    res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly');
    console.log(req.session.isLoggedIn);
    res.redirect('/');
};
