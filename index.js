const zigbee = require('./lib/zigbee')
const manager = require('./lib/manager')

const PORT = '/dev/tty.usbmodem14621'

zigbee.init({
  port: PORT,
  db: './shepherd.db',
})

zigbee.on('error', (error) => {
  console.error('Error:', error)
})

zigbee.on('ready', () => {
  console.log('Ready')

  // setTimeout(() => {
  //   zigbee.permitJoin(60, (error) => {
  //     if (error) {
  //       console.error('Error:', error);
  //     }
  //   });
  // }, 1000)

  const list = zigbee.list()

  manager.init(list)
})

zigbee.on('permitJoining', (joinTimeLeft) => {
  console.log('Permit joining:', joinTimeLeft)
})

// zigbee.on('ind', (msg) => {
//   // console.log('Ind:', msg);
//   console.dir(msg)
// });

zigbee.start((error) => {
  if (error) {
    console.error('Error:', error)
  }
})
