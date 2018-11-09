const { CustomHomeKitTypes } = require('homebridge-lib')

function uuid(id) {
  if (typeof id !== 'string' || id.length !== 3) {
    throw new TypeError(`${id}: illegal id`)
  }
  return `F0000${id}-03a1-4971-92bf-af2b7d833922`
}

class SetupHomeKitTypes extends CustomHomeKitTypes {
  constructor(homebridge) {
    super(homebridge)

    this.createCharacteristic('SetupUnpairDevice', uuid('009'), {
      format: this.formats.BOOL,
      perms: [this.perms.READ, this.perms.NOTIFY, this.perms.WRITE],
    }, 'Unpair Device')

    this.createService('Setup', uuid('0FF'), [
      this.Characteristic.SetupUnpairDevice,
    ])
  }
}

module.exports = function addSetupTypes(homebridge) {
  const { Characteristic, Service } = homebridge.hap
  const setup = new SetupHomeKitTypes(homebridge)
  // Characteristics
  Characteristic.SetupUnpairDevice = setup.Characteristic.SetupUnpairDevice
  // Services
  Service.Setup = setup.Service.Setup
}
