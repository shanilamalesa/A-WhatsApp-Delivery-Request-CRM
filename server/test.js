const db = require('./db/index')
db.prepare('DELETE FROM conversations').run()
console.log('Conversations cleared!')