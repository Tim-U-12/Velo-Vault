/* */
import express from 'express';
const router = express.Router();

router.get('/about', (req, res)=>{
    res.render('../views/about.ejs', {isAuthenticated: req.isAuthenticated()})
})

export default router;