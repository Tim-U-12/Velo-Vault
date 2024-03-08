import ejs from 'ejs';
import 'dotenv/config';
import express from "express";
import pg from "pg";
import bodyParser from 'body-parser';
import { fetchUsers } from './helpers.js';
import { gracefulShutdown } from './helpers.js';
// import indexRouter from './routes/index.js';
import authRouter from './routes/auth.js'
import passport from 'passport';
import session from 'express-session';

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
app.use('/', authRouter)

app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    // store: ... || https://www.passportjs.org/tutorials/password/session/
}));
app.use(passport.authenticate('session'));

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

// Logins and logout
app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/')
        }
        res.clearCookie('connect.sid');
        res.redirect('/')
    })
})

// Admin
app.get('/admin', (req, res) => {
    res.render('admin.ejs')
})

app.get('/admin-create-user', (req, res) => {
    res.render('./admin/create-user.ejs')
})

app.post('/admin-create-user', async (req, res) => {
    const text = 'INSERT INTO users(first_name, last_name, dominant_arm, height_metres, sex) VALUES($1, $2, $3, $4, $5) RETURNING *';
    const values = [
        req.body.first_name,
        req.body.last_name,
        req.body.dominant_arm,
        req.body.height_metres,
        req.body.sex
    ];

    try {
        const result = await pool.query(text, values);
        console.log(result.rows[0])
        res.redirect('/admin-create-user')
    } catch (error) {
        console.error(err);
        res.status(500).send('Server error')
    }
});

app.get('/admin-insert-throw', (req, res) => {
    res.render('./admin/insert-throw.ejs')
})

app.post('/admin-insert-throw', async(req, res) => {
    const text = 'INSERT INTO throws(id, date, throw_speed_kmh) VALUES ($1, $2, $3) RETURNING *'
    const currentDate = new Date().toISOString().split('T')[0];
    const values = [
        req.body.id,
        currentDate,
        req.body.throw_speed,
    ];
    
    try {
        const result = await pool.query(text, values);
        console.log(result.rows[0])
        res.redirect('/admin-insert-throw')
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error')
    }
});

// listen
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Handle termination and interrupt signals
process.on('SIGTERM', () => gracefulShutdown(pool));
process.on('SIGINT', () => gracefulShutdown(pool));