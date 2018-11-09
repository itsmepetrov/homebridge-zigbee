const castArray = require('../utils/castArray')
const timestamp = require('../utils/timestamp')

function parseHistoryServiceName(name) {
  return `${name} History`
}

function getHistoryServices(items) {
  const bySubtype = {}
  for (const item of items) {
    if (item.history) {
      const service = bySubtype[item.history.name] || {
        type: item.history.type,
        name: item.history.name || 'Default',
        config: {},
      }
      for (const use of castArray(item.history.use)) {
        service.config[use] = {
          name: item.name,
          type: item.type,
          subtype: item.subtype,
        }
      }
      bySubtype[item.history.name] = service
    }
  }
  return Object.values(bySubtype)
}

function copyCharacteristicValueIfExist(device, oldService, newService, characteristic) {
  device.addCharacteristicIfDoesNotExist(newService, characteristic)
  if (oldService && oldService.testCharacteristic(characteristic)) {
    newService.getCharacteristic(characteristic).setValue(
      oldService.getCharacteristic(characteristic).value
    )
  }
}

function createService(device, name, type) {
  const oldService = device.getService(parseHistoryServiceName(name))
  const newService = new device.Service.EveHistory(type, {
    displayName: device.parseServiceName(name),
  }, {
    disableTimer: true,
    storage: 'fs',
    path: `${device.platform.api.user.storagePath()}/accessories`,
    filename: `history_${device.ieeeAddr}_${name.toLowerCase()}.json`,
  })
  // Addition characteristics
  switch (type) {
    case 'door':
    case 'energy':
      copyCharacteristicValueIfExist(
        device, oldService, newService,
        device.Characteristic.EveResetTotal
      )
      break
    default:
      // Do nothing
  }
  return newService
}

function mount(device) {
  for (const item of getHistoryServices(device.getAvailbleServices())) {
    // Get target and history services
    // const targetService = device.getService(item.name, item.subtype)
    const historyService = device.getService(parseHistoryServiceName(item.name))
    // Mount history handlers by types
    switch (item.type) {
      case 'motion':
        mountHistoryForMotion(device, historyService, item.config)
        break
      case 'door':
        mountHistoryForDoor(device, historyService, item.config)
        break
      case 'weather':
        mountHistoryForWeather(device, historyService, item.config)
        break
      case 'energy':
        mountHistoryForEnergy(device, historyService, item.config)
        break
      default:
        // Do nothing
    }
  }
}

function mountHistoryForMotion(device, historyService, config) {
  const statusService = device.getService(config.status.name, config.status.subtype)
  device.addCharacteristicIfDoesNotExist(statusService, device.Characteristic.EveLastActivation)
  const lastActivation = statusService.getCharacteristic(device.Characteristic.EveLastActivation)
  const motionDetected = statusService.getCharacteristic(device.Characteristic.MotionDetected)

  const entry = { status: motionDetected.value }
  const firstStartTimeout = 1000 * 60 * 3
  const minimumGapTimeout = 1000 * 60 * 10
  let updateTimeout = null

  function updateEntry(timeout = 0) {
    device.clearTimeout(updateTimeout)
    updateTimeout = device.setTimeout(() => {
      historyService.addEntry({ time: timestamp(), ...entry })
      // Set new timeout to avoid breaks in charts
      updateEntry(minimumGapTimeout)
    }, timeout)
  }

  motionDetected.on('change', ({ newValue }) => {
    entry.status = newValue
    lastActivation.setValue(timestamp() - historyService.getInitialTime())
    updateEntry()
  })

  updateEntry(firstStartTimeout)
}

function mountHistoryForDoor(device, historyService, config) {
  const statusService = device.getService(config.status.name, config.status.subtype)
  device.addCharacteristicIfDoesNotExist(statusService, device.Characteristic.EveTimesOpened)
  device.addCharacteristicIfDoesNotExist(statusService, device.Characteristic.EveLastActivation)
  device.addCharacteristicIfDoesNotExist(statusService, device.Characteristic.EveOpenDuration)
  device.addCharacteristicIfDoesNotExist(statusService, device.Characteristic.EveClosedDuration)
  const timesOpened = statusService.getCharacteristic(device.Characteristic.EveTimesOpened)
  const lastActivation = statusService.getCharacteristic(device.Characteristic.EveLastActivation)
  const contactSensor = statusService.getCharacteristic(device.Characteristic.ContactSensorState)
  const resetTotal = historyService.getCharacteristic(device.Characteristic.EveResetTotal)

  const entry = { status: contactSensor.value }
  const firstStartTimeout = 1000 * 60 * 3
  const minimumGapTimeout = 1000 * 60 * 10
  let updateTimeout = null

  function updateEntry(timeout = 0) {
    device.clearTimeout(updateTimeout)
    updateTimeout = device.setTimeout(() => {
      historyService.addEntry({ time: timestamp(), ...entry })
      // Set new timeout to avoid breaks in charts
      updateEntry(minimumGapTimeout)
    }, timeout)
  }

  resetTotal.on('set', (value, callback) => {
    timesOpened.setValue(0)
    callback(null)
  })

  contactSensor.on('change', ({ newValue }) => {
    entry.status = newValue
    timesOpened.setValue(timesOpened.value + newValue)
    lastActivation.setValue(timestamp() - historyService.getInitialTime())
    updateEntry()
  })

  updateEntry(firstStartTimeout)
}

function mountHistoryForWeather(device, historyService, config) {
  const entry = { temp: 0, humidity: 0, pressure: 0 }
  const waitForValuesTimeout = 1000 * 3
  const firstStartTimeout = 1000 * 60 * 3
  const minimumGapTimeout = 1000 * 60 * 10
  let updateTimeout = null

  function updateEntry(timeout = 0) {
    device.clearTimeout(updateTimeout)
    updateTimeout = device.setTimeout(() => {
      // Make sure all weather entry attributes have been updated
      historyService.addEntry({ time: timestamp(), ...entry })
      // Set new timeout to avoid breaks in charts
      updateEntry(minimumGapTimeout)
    }, timeout)
  }

  if (config.temp) {
    const tempService = device.getService(config.temp.name, config.temp.subtype)
    const temperature = tempService.getCharacteristic(
      device.Characteristic.CurrentTemperature
    )
    entry.temp = temperature.value
    temperature.on('change', ({ newValue }) => {
      entry.temp = newValue
      updateEntry(waitForValuesTimeout)
    })
  }

  if (config.humidity) {
    const humidityService = device.getService(config.humidity.name, config.humidity.subtype)
    const humidity = humidityService.getCharacteristic(
      device.Characteristic.CurrentRelativeHumidity
    )
    entry.humidity = humidity.value
    humidity.on('change', ({ newValue }) => {
      entry.humidity = newValue
      updateEntry(waitForValuesTimeout)
    })
  }

  if (config.pressure) {
    const pressureService = device.getService(config.pressure.name, config.pressure.subtype)
    device.addCharacteristicIfDoesNotExist(pressureService, device.Characteristic.EveAirPressure)
    device.addCharacteristicIfDoesNotExist(pressureService, device.Characteristic.EveElevation)
    pressureService.updateCharacteristic(device.Characteristic.EveElevation, 0)
    const pressure = pressureService.getCharacteristic(
      device.Characteristic.EveAirPressure
    )
    entry.pressure = pressure.value
    pressure.on('change', ({ newValue }) => {
      entry.pressure = newValue
      updateEntry(waitForValuesTimeout)
    })
  }

  updateEntry(firstStartTimeout)
}

function mountHistoryForEnergy(device, historyService, config) {
  const powerService = device.getService(config.power.name, config.power.subtype)
  device.addCharacteristicIfDoesNotExist(powerService, device.Characteristic.EveCurrentConsumption)
  device.addCharacteristicIfDoesNotExist(powerService, device.Characteristic.EveTotalConsumption)
  const consumption = powerService.getCharacteristic(device.Characteristic.EveCurrentConsumption)
  const totalConsumption = powerService.getCharacteristic(device.Characteristic.EveTotalConsumption)
  const resetTotal = historyService.getCharacteristic(device.Characteristic.EveResetTotal)

  const entry = { power: consumption.value }
  const firstStartTimeout = 1000 * 60 * 3
  const minimumGapTimeout = 1000 * 60 * 10
  let updateTimeout = null

  function updateEntry(timeout = 0) {
    device.clearTimeout(updateTimeout)
    updateTimeout = device.setTimeout(() => {
      historyService.addEntry({ time: timestamp(), ...entry })
      // Set new timeout to avoid breaks in charts
      updateEntry(minimumGapTimeout)
    }, timeout)
  }

  resetTotal.on('set', (value, callback) => {
    totalConsumption.setValue(0)
    callback(null)
  })

  consumption.on('change', ({ newValue }) => {
    entry.power = newValue
    updateEntry()
  })

  updateEntry(firstStartTimeout)
}

module.exports = {
  getHistoryServices,
  createService,
  mount,
}
