import 'dotenv/config';
import express from "express";
import pg from "pg";
import bodyParser from 'body-parser';
import session from 'express-session';
import * as helpers from './helpers.js';

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

app.get('/', async (req, res) => {
    try {
        const users = await helpers.fetchUsers(pool); 
        res.render("main.ejs", {users: users});
    } catch (error) {
        console.error('Error fetching data', error);
        res.status(500).send('Error fetching data');
    }
});

app.get('/login', async (req, res) => {
    res.render("login.ejs")
})

app.get('/admin', (req, res) => {
    if (!req.session.userID) {
        return res.redirect('/login')
    }
    res.render('admin.ejs')
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

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});