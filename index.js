import 'dotenv/config';
import express from "express";
import pg from "pg";
import bodyParser from 'body-parser';
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

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

async function fetchUsers() {
        const users = await pool.query("SELECT u.first_name, u.last_name, MAX(t.throw_speed_kmh) AS max_throw_speed_kmh FROM users u, throws t WHERE t.id = u.id GROUP BY u.id ORDER BY max_throw_speed_kmh DESC")
        return users.rows
}

app.get('/', async (req, res) => {
    try {
        const users = await fetchUsers() 
        res.render("main.ejs", {users: users})
    } catch (error) {
        console.error('Error fetching data', error);
        res.status(500).send('Error fetching data');
    }
});

app.get('/login', async (req, res) => {
    res.render("login.ejs")
})

const users = {
    'admin': 'password123'
  };

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (users[username] && users[username] === password) {
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