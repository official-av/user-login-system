var express = require('express');
var User = require('../models/user');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var multer = require('multer');
var path = require('path');
var upload = multer({
    dest: './uploads'
});


/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.get('/register', function (req, res, next) {
    res.render('register', {
        title: 'Register'
    });
});

router.get('/login', function (req, res, next) {
    res.render('login', {
        title: 'Login'
    });
});

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/users/login',
    failureFlash: 'Invalid username or password'
}), function (req, res) {
    req.flash('success', 'You are now logged in');
    res.redirect('/');
});

passport.serializeUser(function (user, done) {
    done(null, user.id);
    console.log('yo serial');

});

passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
        done(err, user);
    });
    console.log('yo deserial');

});

passport.use(new LocalStrategy(function (username, password, done) {
    console.log('yo local');

    User.getUserByUsername(username, function (err, user) { //check username
        if (err) throw err;
        if (!user) {
            return done(null, false, {
                message: 'unknown user'
            });
        }
        User.comparePassword(password, user.password, function (err, isMatch) { //if found check password
            if (err) return done(err);
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, {
                    message: 'Invalid password'
                });
            }
        });

    });
}));

router.post('/register', upload.single('dp'), function (req, res, next) {
    var name = req.body.name;
    var email = req.body.email;
    var usr = req.body.usr;
    var pwd = req.body.pwd;
    var pwd2 = req.body.pwd2;
    if (req.file) {
        console.log('file uploaded');
        var dp = req.file.fileName;
    } else {
        console.log('no file uploaded');
        var dp = 'noimage.jpg';
    }

    //form validations
    req.checkBody('name', 'Name should not be empty').notEmpty();
    req.checkBody('email', 'email should not be empty').notEmpty();
    req.checkBody('email', 'email is invalid').isEmail();
    req.checkBody('usr', 'Username should not be empty').notEmpty();
    req.checkBody('pwd', 'Password should not be empty').notEmpty();
    req.checkBody('pwd2', 'Passwords should match').equals(req.body.pwd);

    //errors
    var errors = req.validationErrors();
    if (errors) {
        res.render('register', {
            errors: errors
        });
    } else {
        var newUser = new User({
            name: name,
            email: email,
            username: usr,
            password: pwd,
            dp: dp
        });

        User.createUser(newUser, function (err, user) {
            if (err) throw err;
            console.log(user);
        });

        req.flash('success', 'you are now registered and can login');
        res.location('/');
        res.redirect('/');
    }
});

router.get('/logout', function (req, res) {
    req.logout();
    req.flash('success', 'you are now logged out');
    res.redirect('/users/login');
});


module.exports = router;
