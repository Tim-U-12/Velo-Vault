async function fetchUsers(pool) {
    const users = await pool.query("SELECT u.first_name, u.last_name, MAX(t.throw_speed_kmh) AS max_throw_speed_kmh FROM users u, throws t WHERE t.id = u.id GROUP BY u.id ORDER BY max_throw_speed_kmh DESC")
    return users.rows
}

function isAuthenticated(req, res, next) {
    if (!req.session.userID) {
        return res.redirect('/login');
    }
    next();
}

function gracefulShutdown(pool) {
    console.log("Closing pool and shutting down the server...");
    pool.end(() => {
        console.log("Pool has ended.");
        process.exit(0);
    });
}

export { fetchUsers , isAuthenticated , gracefulShutdown };