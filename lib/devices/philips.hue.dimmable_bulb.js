const HomeKitDevice = require('../HomeKitDevice')

class PhilipsDimmableBulb extends HomeKitDevice {

    static get description() {
        return {
            model: [
                'LWB010',
                'Philips LWB010'
            ],
            manufacturer: 'Philips',
            name: 'Philips HUE',
        }
    }

    getAvailbleServices() {
        return [{
            name: 'Bulb',
            type: 'Lightbulb',
        }]
    }

    onDeviceReady() {
        this.mountServiceCharacteristic({
            endpoint: 11,
            cluster: 'genOnOff',
            service: 'Bulb',
            characteristic: 'On',
            reportMinInt: 1,
            reportMaxInt: 300,
            reportChange: 1,
            parser: 'onOff',
        })

        this.mountServiceCharacteristic({
            endpoint: 11,
            cluster: 'genLevelCtrl',
            service: 'Bulb',
            characteristic: 'Brightness',
            reportMinInt: 1,
            reportMaxInt: 300,
            reportChange: 1,
            parser: 'dim',
        })
    }
}

module.exports = PhilipsDimmableBulb
