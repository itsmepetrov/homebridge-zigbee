const CUSTOM_UUID_SUFFIX = '03a1-4971-92bf-af2b7d833922'

module.exports = function addCustomTypes({ Characteristic, Service }) {
  // Characteristics
  Characteristic.CustomSetupUnpairDevice = class CustomSetupUnpairDevice extends Characteristic {
    static get UUID() {
      return `00000009-${CUSTOM_UUID_SUFFIX}`
    }

    constructor() {
      super('Unpair Device', CustomSetupUnpairDevice.UUID)
      this.setProps({
        format: Characteristic.Formats.BOOL,
        perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY],
      })
      this.value = this.getDefaultValue()
    }
  }

  // Services
  Service.CustomSetup = class CustomSetup extends Service {
    static get UUID() {
      return `F00000FF-${CUSTOM_UUID_SUFFIX}`
    }

    constructor(displayName, subtype) {
      super(displayName, CustomSetup.UUID, subtype)
      // Optional Characteristics
      this.addOptionalCharacteristic(Characteristic.CustomSetupUnpairDevice)
      // Optional Characteristics standard
      this.addOptionalCharacteristic(Characteristic.Name)
    }
  }
}
