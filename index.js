import 'dotenv/config';
import express from "express";
import pg from "pg";
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';

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

// replace with database
const users = [
    {
        username: 'john',
        password: 'password123admin',
        role: 'admin'
    }, {
        username: 'anna',
        password: 'password123member',
        role: 'member'
    }
];

// hide access token in .env
const accessTokenSecret = 'youraccesstokensecret';

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => { return u.username === username && u.password === password});
    if (user) {
        const accessToken = jwt.sign({ username: user.username, role: user.role}, accessTokenSecret);
        
        res.json({
            accessToken
        });
    } else {
        res.send('Username or password is incorrect');
    }
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});