import ejs from 'ejs';
import 'dotenv/config';
import express from "express";
import pg from "pg";
import bodyParser from 'body-parser';
import session from 'express-session';
import { fetchUsers } from './helpers.js';
import { isAuthenticated } from './helpers.js';
import { gracefulShutdown } from './helpers.js';

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
app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false,
        httpOnly: true
    }
}));

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
app.get('/login', async (req, res) => {
    res.render("login.ejs")
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD) {
        req.session.userID = username;
        res.render('admin.ejs')
    } else {
        res.send('Invalid username or password');
    }
});

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
app.get('/admin', isAuthenticated, (req, res) => {
    res.render('admin.ejs')
})

app.get('/admin-create-user', isAuthenticated, (req, res) => {
    res.render('./admin/create-user.ejs')
})

app.post('/admin-create-user', isAuthenticated, async (req, res) => {
    // insert user information
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

app.get('/admin-insert-throw', isAuthenticated, (req, res) => {
    res.render('./admin/insert-throw.ejs')
})

app.post('/admin-insert-throw', isAuthenticated, async(req, res) => {
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