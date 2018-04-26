const zigbee = require('./lib/zigbee')
const manager = require('./lib/manager')

const PORT = process.argv[2]

zigbee.init({
  port: PORT,
  db: './shepherd.db',
})

zigbee.on('error', (error) => {
  console.error('Error:', error)
})

zigbee.on('ready', () => {
  console.log('Ready')

  const list = zigbee.list()

  manager.init(list)
})

zigbee.start((error) => {
  if (error) {
    console.error('Error:', error)
  }
})
