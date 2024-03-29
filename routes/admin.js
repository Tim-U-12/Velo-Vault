import express from 'express';
import { pool } from '../models/postgres_db.js';
import { getSafeColumnName } from "../helpers.js"
const router = express.Router();

router.get('/admin', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('admin.ejs')
    } else {
        res.redirect('/login')
    }
})

router.route('/admin-create-user')
    .get((req,res) => {
        if (req.isAuthenticated()) {
            res.render('./admin/create-user.ejs')
        } else {
            res.redirect('/login')
        }
    })
    .post(async (req, res) => {
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
    })

router.route('/admin-create-throw')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            res.render('./admin/create-throw.ejs')
        } else {
            res.redirect('/login')
        }
        
    })
    .post(async (req, res) => {
        if (req.isAuthenticated()) {
            const text = 'INSERT INTO throws(user_id, throw_date, throw_type, throw_speed) VALUES ($1, $2, $3, $4) RETURNING *'
            const currentDate = new Date().toISOString().split('T')[0];
            const values = [
                req.body.user_id,
                currentDate,
                req.body.throw_type,
                req.body.throw_speed,
            ];
            
            try {
                const result = await pool.query(text, values);
                res.redirect('/admin-create-throw')
            } catch (error) {
                console.error(error);
                res.status(500).send('Server error')
            }
        } else {
            res.redirect('/login')
        }
    })

router.route('/admin-read-user')
    .get(async (req,res) => {
        if (req.isAuthenticated()) {
            let users = {}
            if (Object.keys(req.query).length > 0) { 
                const column = getSafeColumnName(req.query.get_by)
                const text = `SELECT * FROM users WHERE ${column}=$1`;
                const values = [req.query.get_user]
                try {
                    const result = await pool.query(text, values)
                    users = result.rows
                } catch (error) {
                    console.error('Error fetching data', error);
                    res.status(500).send('Error fetching data')
                }
            }
            res.render("./admin/read-user.ejs", { users })
        } else {
            res.redirect('/login')
        }
    })

export default router;