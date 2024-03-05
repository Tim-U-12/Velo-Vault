async function fetchUsers(pool, genderChoice) {
    let genderValues;
    if (genderChoice === 'any') {
        genderValues = ['female', 'male']
    } else {
        genderValues = [genderChoice];
    }

    const text = `
SELECT u.first_name, u.last_name, MAX(t.throw_speed_kmh) AS max_throw_speed_kmh
FROM users u
JOIN throws t ON t.id = u.id
WHERE u.sex = ANY($1::text[])
GROUP BY u.id
ORDER BY max_throw_speed_kmh DESC`;

    const result = await pool.query(text, [genderValues])
    return result.rows
}

function isAuthenticated(req, res, next) {
    if (!req.session.userID) {
        return res.redirect('/login');
    }
    console.log("Successfully Authenticated")
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