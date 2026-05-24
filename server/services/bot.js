const customerRepo = require('../repositories/customer.repo');
const messageRepo = require('../repositories/message.repo');
const conversationRepo = require('../repositories/conversation.repo');
const riderRepo = require('../repositories/rider.repo');
const rideRepo = require('../repositories/ride.repo');
const sendMessage = require('./whatsapp');

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

async function handleMessage(from, text) {
  const command = text.trim().toLowerCase();

  // Check if sender is a registered rider first
  const rider = await riderRepo.getRiderByPhone(from);

  if (rider) {
    // Handle rider commands
    if (command === 'online' || command === 'offline') {
      await riderRepo.updateRiderStatus(rider.id, command);
      await sendMessage(from, `You are now ${command}.`);
      return;
    }

    if (command === 'done' || command === 'delivered') {
      // Find their active in_progress ride
      const result = await rideRepo.getRiderActiveRide(rider.id);
      if (!result) {
        await sendMessage(from, 'You have no active ride to complete.');
        return;
      }
      await rideRepo.updateRideStatus(result.id, 'completed');
      await sendMessage(from, 'Ride marked as completed. Thank you!');
      // Notify customer
      if (result.customer_phone) {
        await sendMessage(result.customer_phone, 'Your ride is complete. Thank you for using Boda Dispatch!');
      }
      return;
    }
  }

  // Normal customer flow below
  let customer = await customerRepo.findByPhone(from);
  if (!customer) {
    customer = await customerRepo.createCustomer(from, null);
  }

  await messageRepo.logMessage(customer.id, 'inbound', text);

  const conversation = await conversationRepo.getConversation(customer.id);
  const state = conversation ? conversation.state : STATES.START;
  const data = conversation ? JSON.parse(conversation.data) : {};

  if (state === STATES.START || state === STATES.COMPLETE) {
    await sendMessage(from, "Hello! Welcome to Boda Dispatch 🛵 Where should we pick up your package from?");
    await conversationRepo.upsertConversation(customer.id, STATES.WAITING_FOR_PICKUP, JSON.stringify(data));
  }

  else if (state === STATES.WAITING_FOR_PICKUP) {
    data.pickup_location = text;
    await sendMessage(from, "Got it! Where should we deliver to?");
    await conversationRepo.upsertConversation(customer.id, STATES.WAITING_FOR_DROPOFF, JSON.stringify(data));
  }

  else if (state === STATES.WAITING_FOR_DROPOFF) {
    data.dropoff_location = text;
    await sendMessage(from, "What is the recipient's name?");
    await conversationRepo.upsertConversation(customer.id, STATES.WAITING_FOR_RECIPIENT_NAME, JSON.stringify(data));
  }

  else if (state === STATES.WAITING_FOR_RECIPIENT_NAME) {
    data.recipient_name = text;
    await sendMessage(from, "What is the recipient's phone number?");
    await conversationRepo.upsertConversation(customer.id, STATES.WAITING_FOR_RECIPIENT_PHONE, JSON.stringify(data));
  }

  else if (state === STATES.WAITING_FOR_RECIPIENT_PHONE) {
    data.recipient_phone = text;
    await sendMessage(from, "Please describe the package briefly (e.g. Food order, medium bag)");
    await conversationRepo.upsertConversation(customer.id, STATES.WAITING_FOR_PACKAGE, JSON.stringify(data));
  }

  else if (state === STATES.WAITING_FOR_PACKAGE) {
    data.package_description = text;
    await sendMessage(from, "How urgent is this delivery? Reply with:\n1. Standard (under 2 hours)\n2. Express (under 45 minutes)\n3. Scheduled (time agreed later)");
    await conversationRepo.upsertConversation(customer.id, STATES.WAITING_FOR_URGENCY, JSON.stringify(data));
  }

  else if (state === STATES.WAITING_FOR_URGENCY) {
    data.urgency = text;
    await sendMessage(from, `Please confirm your delivery:\n\n📍 Pickup: ${data.pickup_location}\n📍 Dropoff: ${data.dropoff_location}\n👤 Recipient: ${data.recipient_name}\n📞 Phone: ${data.recipient_phone}\n📦 Package: ${data.package_description}\n⚡ Urgency: ${data.urgency}\n\nReply *yes* to confirm or *restart* to start over`);
    await conversationRepo.upsertConversation(customer.id, STATES.WAITING_FOR_CONFIRMATION, JSON.stringify(data));
  }

  else if (state === STATES.WAITING_FOR_CONFIRMATION) {
    if (text.toLowerCase() === 'yes') {
      try {
        const ride = await rideRepo.createRide({
          customer_id: customer.id,
          pickup_location: data.pickup_location,
          dropoff_location: data.dropoff_location
        });
        await sendMessage(from, `Request received! Your ride #${ride.id} has been created. A dispatcher will assign a rider shortly.`);
        await conversationRepo.upsertConversation(customer.id, STATES.COMPLETE, JSON.stringify({}));
      } catch (err) {
        console.error('Error creating ride:', err);
      }
    } else if (text.toLowerCase() === 'restart') {
      await sendMessage(from, 'Starting over! Where should we pick up your package from?');
      await conversationRepo.upsertConversation(customer.id, STATES.WAITING_FOR_PICKUP, JSON.stringify({}));
    }
  }
}

module.exports = { handleMessage };