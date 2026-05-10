const express = require("express");
const deliveries = require("../db/deliveries");
const messages = require("../db/messages");
const { updateDeliveryStatus } = require("../services/delivery");
const router = express.Router();

router.get('/deliveries', (req, res) => {
    const page = Number(req.query.page) || 1
    const pageSize = Number(req.query.pageSize) || 20
    const status = req.query.status
    const search = req.query.search

    const result = deliveries.getAllDeliveries({ page, pageSize, status, search })

    res.json(result)
})


router.get('/deliveries/:id', (req, res) => {
    const id = Number(req.params.id);
    const delivery = deliveries.findById(id);

    if (!delivery) {
        return res.status(404).json({ error: 'Delivery not found' })
    }

    const conversation = messages.getMessagesByCustomer(delivery.customer_id)
    res.json({ ...delivery, conversation })
})

router.patch('/deliveries/:id', (req, res) => {
  const id = Number(req.params.id)
  const fields = req.body
  
  const delivery = deliveries.findById(id)
  if (!delivery) {
    return res.status(404).json({ error: 'Delivery not found' })
  }

  try {
    const updated = updateDeliveryStatus(id, fields)
    res.json(updated)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
})


router.get('/stats', (req, res) => {
  const db = require('../db/index')
  
  const total = db.prepare('SELECT COUNT(*) as count FROM deliveries').get().count
  
  const today = db.prepare(`
    SELECT COUNT(*) as count FROM deliveries 
    WHERE date(created_at) = date('now')
  `).get().count

  const byStatus = db.prepare(`
    SELECT status, COUNT(*) as count FROM deliveries GROUP BY status
  `).all()

  const statusMap = {
    pending: 0, assigned: 0, picked_up: 0, delivered: 0, cancelled: 0
  }
  byStatus.forEach(row => { statusMap[row.status] = row.count })

  res.json({
    total,
    today,
    byStatus: statusMap,
    pending: statusMap.pending
  })
})

module.exports = router