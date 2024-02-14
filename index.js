import 'dotenv/config';
import express from "express";
import pg from "pg";

const { Pool } = pg;
const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    }
});

app.use(express.static("public"));
app.set('view engine', 'ejs'); // Ensure EJS is set as the view engine

async function fetchUsers() {
    const users = await pool.query("SELECT * FROM users")
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

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});