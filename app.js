import ejs from 'ejs';
import 'dotenv/config';
import express from "express";
import pg from "pg";
import bodyParser from 'body-parser';
import { fetchUsers } from './helpers.js';
import { gracefulShutdown } from './helpers.js';
// import indexRouter from './routes/index.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';
import passport from 'passport';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

const { Pool } = pg;
const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    }
});

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

//main page
app.get('/', async (req, res) => {
    try {
        let users;
        const genderChoice = "any"
        users = await fetchUsers(pool, genderChoice);
        res.render("main.ejs", {users: users});
    } catch (error) {
        console.error('Error fetching data', error);
        res.status(500).send('Error fetching data');
    }
});

app.get('/filter', async (req, res) => {
    try {
        const { genderChoice } = req.query;
        const users = await fetchUsers(pool, genderChoice);
        const usersHtml = await ejs.renderFile('./views/partials/ladder.ejs', { users: users });
        res.send(usersHtml);
    } catch (error) {
        console.error('Error fetching data', error);
        res.status(500).send('Error fetching data');
    }
})

export { pool }

// listen
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Handle termination and interrupt signals
process.on('SIGTERM', () => gracefulShutdown(pool));
process.on('SIGINT', () => gracefulShutdown(pool));