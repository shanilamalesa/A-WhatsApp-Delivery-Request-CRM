//this file hundles oparator actions like updating status and assigning riders

const { updateDelivery, findById } = require('../db/deliveries')

//a list of valid status
const VALID_STATUSES = ['pending', 'assigned', 'picked_up', 'delivered', 'cancelled'];



function updateDeliveryStatus (id, fields){
//fields.status->did the operator actually send a status field
//if status exist but is invalid
    if (fields.status && !VALID_STATUSES.includes(fields.status)) {
        throw new Error(`Invalid status. Valid status are: ${VALID_STATUSES.join(',')}`);
    }
    //return updated delivery
    return updateDelivery(id, fields);
}

module.exports = updateDeliveryStatus