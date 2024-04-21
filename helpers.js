async function fetchUsers(pool, genderChoice, typeChoice) {
    let genderValues;
    if (genderChoice === 'any') {
        genderValues = ['female', 'male'];
    } else {
        genderValues = [genderChoice];
    }

    // Initialize an array to hold parameters for the SQL query
    const params = [genderValues];
    // Start building the WHERE clause
    let whereClauses = "u.sex = ANY($1::text[])";

    // Modify the WHERE clause based on typeChoice, if it's not "both"
    if (typeChoice !== 'both') {
        // Add throw_type condition to the WHERE clause
        whereClauses += ` AND t.throw_type = $2`;
        params.push(typeChoice); // Add typeChoice as the second parameter
    }

    // Update the SQL query to include the dynamic WHERE clause
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