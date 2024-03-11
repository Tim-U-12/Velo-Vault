import express from 'express';
import { pool } from '../models/postgres_db.js';
const router = express.Router();

router.get('/admin', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('admin.ejs')
    } else {
        res.redirect('/login')
    }
})

router.get('/admin-create-user', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('./admin/create-user.ejs')
    } else {
        res.redirect('/login')
    }
})

router.post('/admin-create-user', async (req, res) => {
    if (req.isAuthenticated()) {
        const text = 'INSERT INTO users(first_name, last_name, height, dominant_arm, sex) VALUES($1, $2, $3, $4, $5) RETURNING *';
        const values = [
            req.body.first_name,
            req.body.last_name,
            req.body.height,
            req.body.dominant_arm,
            req.body.sex
        ];
    
        try {
            const result = await pool.query(text, values);
            console.log(result.rows[0])
            res.redirect('/admin-create-user')
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error')
        }
    } else {
        res.redirect('/login')
    }
});

router.get('/admin-insert-throw', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('./admin/insert-throw.ejs')
    } else {
        res.redirect('/login')
    }
    
})

router.post('/admin-insert-throw', async(req, res) => {
    if (req.isAuthenticated()) {
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
    } else {
        res.redirect('/login')
    }
});

export default router;