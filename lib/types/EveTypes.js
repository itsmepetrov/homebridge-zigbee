const fakegatoHistory = require('fakegato-history')
const { EveHomeKitTypes } = require('homebridge-lib')

module.exports = function addEveTypes(homebridge) {
  const { Characteristic, Service } = homebridge.hap
  const eve = new EveHomeKitTypes(homebridge)
  // Characteristics
  Characteristic.EveVoltage = eve.Characteristic.Voltage
  Characteristic.EveTotalConsumption = eve.Characteristic.TotalConsumption
  Characteristic.EveCurrentConsumption = eve.Characteristic.CurrentConsumption
  Characteristic.EveAirPressure = eve.Characteristic.AirPressure
  Characteristic.EveResetTotal = eve.Characteristic.ResetTotal
  Characteristic.EveHistoryStatus = eve.Characteristic.HistoryStatus
  Characteristic.EveHistoryEntries = eve.Characteristic.HistoryEntries
  Characteristic.EveOpenDuration = eve.Characteristic.OpenDuration
  Characteristic.EveClosedDuration = eve.Characteristic.ClosedDuration
  Characteristic.EveLastActivation = eve.Characteristic.LastActivation
  Characteristic.EveHistoryRequest = eve.Characteristic.HistoryRequest
  Characteristic.EveSensitivity = eve.Characteristic.Sensitivity
  Characteristic.EveSetTime = eve.Characteristic.SetTime
  Characteristic.EveElectricCurrent = eve.Characteristic.ElectricCurrent
  Characteristic.EveTimesOpened = eve.Characteristic.TimesOpened
  Characteristic.EveDuration = eve.Characteristic.Duration
  Characteristic.EveElevation = eve.Characteristic.Elevation
  Characteristic.EveCurrentTemperature = eve.Characteristic.CurrentTemperature
  Characteristic.EveWeatherCondition = eve.Characteristic.WeatherCondition
  Characteristic.EveRain1h = eve.Characteristic.Rain1h
  Characteristic.EveRain24h = eve.Characteristic.Rain24h
  Characteristic.EveUVIndex = eve.Characteristic.UVIndex
  Characteristic.EveVisibility = eve.Characteristic.Visibility
  Characteristic.EveWindDirection = eve.Characteristic.WindDirection
  Characteristic.EveWindSpeed = eve.Characteristic.WindSpeed
  // Services
  Service.EveHistory = fakegatoHistory(homebridge)
  Service.EveOutlet = eve.Service.Outlet
  Service.EveWeather = eve.Service.Weather
  Service.EveMotionSensor = eve.Service.MotionSensor
  Service.EveContactSensor = eve.Service.ContactSensor
  Service.EveTemperatureSensor = eve.Service.TemperatureSensor
  Service.EveAirPressureSensor = eve.Service.AirPressureSensor
}
