async function fetchUsers(pool) {
    const users = await pool.query("SELECT u.first_name, u.last_name, MAX(t.throw_speed_kmh) AS max_throw_speed_kmh FROM users u, throws t WHERE t.id = u.id GROUP BY u.id ORDER BY max_throw_speed_kmh DESC")
    return users.rows
}

export { fetchUsers };