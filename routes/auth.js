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

router.get('/login', function(req, res, next) {
    res.render('login.ejs');
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));

export default router;