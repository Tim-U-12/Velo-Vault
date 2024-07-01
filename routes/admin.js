import express from 'express';
import { pool } from '../models/postgres_db.js';
import { getSafeName } from "../helpers.js"
import { getRows } from "../helpers.js"
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
                
                if (req.query.get_by == "last_input") {
                    const text = "SELECT * FROM USERS ORDER BY user_id DESC LIMIT 1"
                    const result = await pool.query(text)
                    users = result.rows
                } else {
                    const columnWhiteList = ["user_id", "first_name", "last_name"]
                    const column = getSafeName(req.query.get_by, columnWhiteList)
                    const text = getRows("users", column)
                    const value = req.query.get_user
                    const result = await pool.query(text, [value]) 
                    users = result.rows
                }
            }
            res.render("./admin/read-user.ejs", { users })
        } else {
            res.redirect('/login')
        }
    })

export default router;