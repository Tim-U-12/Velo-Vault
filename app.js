import ejs from 'ejs';
import express from "express";
import bodyParser from 'body-parser';
import passport from 'passport';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';
import aboutRouter from './routes/about.js';
import { fetchUsers } from './helpers.js';
import { gracefulShutdown } from './helpers.js';
import { pool } from './models/postgres_db.js';
import 'dotenv/config';

const app = express();
const port = 3000;

// middle ware
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

const pgSession = connectPgSimple(session);
app.use(session({
    store: new pgSession({
        pool : pool, // Use the existing pool instance
        tableName : 'session' // Optional. Use a different table name (default is 'session')
    }),
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days    
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/', authRouter)
app.use('/', adminRouter)
app.use('/', aboutRouter)

//main page
app.get('/', async (req, res) => {
    try {
        const genderChoice = req.query.genderChoice || "all";
        const typeChoice = req.query.typeChoice || "both";
        const users = await fetchUsers(pool, genderChoice, typeChoice);
        
        if (req.query.genderChoice) {
            const usersHtml = await ejs.renderFile('./views/partials/ladder.ejs', { users: users });
            res.send(usersHtml);
        } else {
            res.render("main.ejs", {users: users, isAuthenticated: req.isAuthenticated()});
        }
    } catch (error) {
        console.error('Error fetching data', error);
        res.status(500).send('Error fetching data');
    }
});

// listen
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Handle termination and interrupt signals
process.on('SIGTERM', () => gracefulShutdown(pool));
process.on('SIGINT', () => gracefulShutdown(pool));