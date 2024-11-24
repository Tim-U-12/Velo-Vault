import 'dotenv/config';
import express from "express";
import passport from "passport";
import { Strategy } from "passport-local";
const router = express.Router();

passport.use(new Strategy(function verify(username, password, cb) {
    if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD) {
        return cb(null, {username: username})
    } else {
        return cb(null, false, { message: 'Incorrect username or password.' });
    }
}));

router.get('/admin-login', function(req, res, next) {
    res.render('login.ejs');
});

router.post('/admin-login', passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/admin-login'
}));

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
        cb(null, { id: user.id, username: user.username });
    });
});

passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, user);
    });
});

router.post('/logout', function(req, res, next) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

export default router;