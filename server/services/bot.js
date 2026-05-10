//this file reads the current conversation and decides what to replay next

const customers = require("../db/customers");
const deliveries = require("../db/deliveries");
const messages = require("../db/messages");
const sendMessage = require("./whatsapp");
const { getConversation, upsertConversation } = require("../db/conversations");



// STATES object gives us:
//One place to change things
//Protection against typos
const STATES = {
    START: 'start',
    WAITING_FOR_PICKUP: 'waiting_for_pickup',
    WAITING_FOR_DROPOFF: 'waiting_for_dropoff',
    WAITING_FOR_RECIPIENT_NAME: 'waiting_for_recipient_name',
    WAITING_FOR_RECIPIENT_PHONE: 'waiting_for_recipient_phone',
    WAITING_FOR_PACKAGE: 'waiting_for_package',
    WAITING_FOR_URGENCY: 'waiting_for_urgency',
    WAITING_FOR_CONFIRMATION: 'waiting_for_confirmation',
    COMPLETE: 'complete'  
}

async function handleMessage (from, text){
    //find or create customer
    let customer = customers.findByPhone(from);
    if (!customer){
        customer = customers.createCustomer(from, null);
    }

    //log inbound messages
    messages.logMessage(customer.id, 'inbound', text);

    //get conversation state
    const conversation = getConversation(customer.id);
    const state = conversation ? conversation.state : STATES.START;
    const data = conversation ? JSON.parse(conversation.data) : {};

    if (state === STATES.START || state === STATES.COMPLETE) {
        await sendMessage(from, "Hello! Welcome to Boda Dispatch 🛵 Where should we pick up your package from?");
        upsertConversation(customer.id, STATES.WAITING_FOR_PICKUP, JSON.stringify(data));
    }

    else if (state === STATES.WAITING_FOR_PICKUP) {
        data.pickup_location = text  // ← saving what customer said
        await sendMessage(from, "Got it! Where should we deliver to?");
        upsertConversation(customer.id, STATES.WAITING_FOR_DROPOFF, JSON.stringify(data));
    }

    else if (state === STATES.WAITING_FOR_RECIPIENT_NAME){
        data.recipient_name = text
        await sendMessage(from, "What is the recipient's phone number?")
        upsertConversation(customer.id, STATES.WAITING_FOR_RECIPIENT_PHONE, JSON.stringify(data))
    }

    else if (state === STATES.WAITING_FOR_DROPOFF){
        data.dropoff_location = text
        await sendMessage(from, "What is the recipient's name?")
        upsertConversation(customer.id, STATES.WAITING_FOR_RECIPIENT_NAME, JSON.stringify(data))
    }

    else if (state === STATES.WAITING_FOR_RECIPIENT_PHONE){
        data.recipient_phone = text
        await sendMessage(from, "Please describe the package briefly (e.g. Food order, medium bag)")
        upsertConversation(customer.id, STATES.WAITING_FOR_PACKAGE, JSON.stringify(data))
    }

    else if (state === STATES.WAITING_FOR_PACKAGE){
        data.package_description = text  
        await sendMessage(from, "How urgent is this delivery? Reply with:\n1. Standard (under 2 hours)\n2. Express (under 45 minutes)\n3. Scheduled (time agreed later");
        upsertConversation(customer.id, STATES.WAITING_FOR_URGENCY, JSON.stringify(data));
    }

    else if (state === STATES.WAITING_FOR_URGENCY){
        data.urgency = text  
        await sendMessage(from, `Please confirm your delivery:\n
        📍 Pickup: ${data.pickup_location}\n
        📍 Dropoff: ${data.dropoff_location}\n
        👤 Recipient: ${data.recipient_name}\n
        📞 Phone: ${data.recipient_phone}\n
        📦 Package: ${data.package_description}\n
        ⚡ Urgency: ${data.urgency}\n\n
        Reply *yes* to confirm or *restart* to start over`)

        upsertConversation(customer.id, STATES.WAITING_FOR_CONFIRMATION, JSON.stringify(data));

    }

    else if (state === STATES.WAITING_FOR_CONFIRMATION){
    if (text.toLowerCase() === 'yes'){
        console.log('Creating delivery with data:', data)
        try {
            const reference = 'BD-' + Math.random().toString(36).substring(2, 7).toUpperCase()
            deliveries.createDelivery({
                customer_id: customer.id,
                reference,
                pickup_location: data.pickup_location,
                dropoff_location: data.dropoff_location,
                recipient_name: data.recipient_name,
                recipient_phone: data.recipient_phone,
                package_description: data.package_description,
                urgency: data.urgency
            })
            await sendMessage(from, `Request received! Your reference is ${reference}. A rider will be assigned shortly.`)
            upsertConversation(customer.id, STATES.COMPLETE, JSON.stringify({}))
        } catch(err) {
            console.error('Error creating delivery:', err)
        }
    }
    else if (text.toLowerCase() === 'restart') {
        await sendMessage(from, 'Starting over! Where should we pick up your package from?')
        upsertConversation(customer.id, STATES.WAITING_FOR_PICKUP, JSON.stringify({}))
    }
}
}


module.exports = { handleMessage }