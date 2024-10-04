async function fetchUsers(pool, genderChoice, typeChoice) {
    genderChoice = genderChoice.toLowerCase();
    typeChoice = typeChoice.toLowerCase();

    let genderValues;
    if (genderChoice === 'all') {
        genderValues = ['female', 'male'];
    } else {
        genderValues = [genderChoice];
    }

    const params = [genderValues];
    let whereClauses = "u.sex = ANY($1::text[])";

    if (typeChoice !== 'both') {
        whereClauses += ` AND t.throw_type = $2`;
        params.push(typeChoice);
    }

    const text = `
SELECT u.first_name, u.last_name, t.throw_type, MAX(t.throw_speed) AS throw_speed
FROM users u
JOIN throws t ON t.user_id = u.user_id
WHERE ${whereClauses}
GROUP BY u.user_id, t.throw_type
ORDER BY throw_speed DESC`;

    const result = await pool.query(text, params);
    return result.rows;
}

async function getAllUsers(pool) {
    const text = 'SELECT * FROM users'
    const result = await pool.query(text)
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

export { fetchUsers , gracefulShutdown , getSafeName , getRows , getAllUsers};