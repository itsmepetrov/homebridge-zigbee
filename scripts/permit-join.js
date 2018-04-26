const zigbee = require('../lib/zigbee')

const PORT = process.argv[2]

if (!PORT) {
  throw new Error('Serial port is not specified')
}

zigbee.init({
  port: PORT,
  db: './shepherd.db',
})

zigbee.on('error', (error) => {
  console.error('Error:', error)
})

zigbee.on('ready', () => {
  console.log('Ready')
  setTimeout(() => {
    zigbee.permitJoin(120, (error) => {
      if (error) {
        console.error('Error:', error)
      }
    })
  }, 3000)
  // zigbee.permitJoin(120, (error) => {
  //   if (error) {
  //     console.error('Error:', error)
  //   }
  // })
})

zigbee.on('permitJoining', (joinTimeLeft) => {
  console.log('Permit joining:', joinTimeLeft)
})

zigbee.on('ind', (msg) => {
  switch (msg.type) {
    case 'devInterview':
      console.log(`Interview endpoint: ${msg.status.endpoint.current} of ${msg.status.endpoint.total} cluster ${msg.status.endpoint.cluster.current} of ${msg.status.endpoint.cluster.total}`)
      break
    case 'devIncoming':
      console.log(`Device joined, id: ${msg.data}`)
      break
    case 'devLeaving':
      console.log(`Device announced leaving and is removed, id: ${msg.data}`)
      break
    case 'attReport':
      console.log('Report:', msg)
      break
    case 'statusChange':
      console.log('Status:', msg)
      break
  }
})

zigbee.start((error) => {
  if (error) {
    console.error('Error:', error)
  }
})
