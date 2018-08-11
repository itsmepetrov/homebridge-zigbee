const serialport = require('serialport')

module.exports = function findSerialPort() {
  return new Promise((resolve, reject) => {
    serialport.list((err, list) => {
      if (err) {
        return reject(new Error('Unable to get serial port list'))
      }
      const port = list.find(item => item.manufacturer === 'Texas Instruments')
      if (!port) {
        return reject(new Error('Unable to find zigbee port'))
      }
      return resolve(port.comName)
    })
  })
}
