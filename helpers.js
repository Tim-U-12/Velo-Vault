async function fetchUsers(pool, genderChoice) {
    let genderValues;
    if (genderChoice === 'any') {
        genderValues = ['female', 'male']
    } else {
        genderValues = [genderChoice];
    }

    const text = `
SELECT u.first_name, u.last_name, MAX(t.throw_speed) AS throw_speed
FROM users u
JOIN throws t ON t.user_id = u.user_id
WHERE u.sex = ANY($1::text[])
GROUP BY u.user_id
ORDER BY throw_speed DESC`;

    const result = await pool.query(text, [genderValues])
    return result.rows
}

function getSafeName(input, whiteList) {
    if (whiteList.includes(input)) {
        return input;
    } else {
        throw new Error("Invalid column name")
    }
}

function getRows(table, colName) {
    return `SELECT * FROM ${table} WHERE ${colName}=$1`
}

function gracefulShutdown(pool) {
    console.log("Closing pool and shutting down the server...");
    pool.end(() => {
        console.log("Pool has ended.");
        process.exit(0);
    });
}

export { fetchUsers , gracefulShutdown , getSafeName , getRows };