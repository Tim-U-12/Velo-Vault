import express from 'express';
import { pool } from '../models/postgres_db.js';
import { getSafeName } from "../helpers.js"
import { getRows } from "../helpers.js"
import { getAllUsers } from '../helpers.js';
const router = express.Router();

router.route('/admin')
    .get(async (req, res) => {
        if (req.isAuthenticated()) {
            const users = await getAllUsers(pool)
            res.render('admin.ejs', {users : users})
        } else {
            res.redirect('/admin-login')
        }
    }
)

router.route('/user-profile')
    .get(async (req, res) => {
        if (req.isAuthenticated()) {
            const userID = req.query.id;
            const userName = req.query.name;
            // query the db for all user's throws
            const text = "SELECT * FROM throws WHERE throws.user_id = $1";
            const params = [userID];
            const results = await pool.query(text, params);
            // render the user profile with all the information
            res.render('./admin/user-profile.ejs', {
                userThrows: results.rows,
                userID: userID, 
                name: userName
            });
        } else {
            res.redirect('/admin-login')
        }
    }
)

router.route('/admin-create-user')
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
                res.redirect('/admin')
            } catch (error) {
                console.error(error);
                res.status(500).send('Server error')
            }
        } else {
            res.redirect('/admin-login')
        }
    })

router.route('/admin-create-throw')
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
                res.redirect(`/user-profile?id=${req.body.user_id}&name=${req.body.user_name}`);
            } catch (error) {
                console.error(error);
                res.status(500).send('Server error')
            }
        } else {
            res.redirect('/admin-login')
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
            res.redirect('/admin-login')
        }
    })

export default router;