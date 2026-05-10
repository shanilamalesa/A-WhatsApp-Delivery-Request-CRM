const db = require("./index");

function createDelivery(data){
    const result = db.prepare("INSERT INTO deliveries (customer_id, reference, pickup_location, dropoff_location, recipient_name, recipient_phone, package_description, urgency) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(data.customer_id, data.reference, data.pickup_location, data.dropoff_location, data.recipient_name, data.recipient_phone, data.package_description, data.urgency);
    return db.prepare('SELECT * FROM deliveries WHERE id = ?').get(result.lastInsertRowid)
}


function findById ( id ){ 
        return db.prepare( "SELECT * FROM deliveries WHERE id = ?").get(id);
}


//It updates only the allowed fields and always bumps updated_at
function updateDelivery( id, fields){
    const allowed = ["status", "assigned_rider"];
    const keys = Object.keys(fields).filter(k => allowed.includes(k));
    const setClause = keys.map(k => `${k} = ?`).join(",");
    const values = keys.map(k => fields[k]);

    db.prepare(`UPDATE deliveries SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values, id);

    return findById(id);
}


//the function the dashboard calls to get the list of deliveries
function getAllDeliveries ( { page = 1, pageSize = 20, status, search} = {} ){
    let where = [];
    let params = [];

    if (status) {
        where.push("status = ?")
        params.push(status)
    }

    if (search){
        where.push('(pickup_location LIKE ? OR dropoff_location LIKE ? OR recipient_name LIKE ? OR recipient_phone LIKE ?)')
        params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (page - 1) * pageSize;

    const deliveries = db.prepare(`SELECT * FROM deliveries ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, pageSize, offset);

    const { total } = db.prepare(`SELECT COUNT(*) as total FROM deliveries ${whereClause}`).get(...params);

    return { total, page, pageSize, deliveries }
    
}


module.exports = {createDelivery, findById, updateDelivery, getAllDeliveries};