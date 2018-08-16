# Plugin Configuration

## Minimum configuration

```json
{
  "bridge": {
    "name": "Homebridge",
    "username": "CC:22:3D:E3:CE:30",
    "port": 51826,
    "pin": "031-45-154"
  },
  "description": "My homebridge configuration",
  "platforms": [
    {
      "platform": "ZigBeePlatform"
    }
  ]
}
```

## Available options

The following configuration options are available:

| Name              | Default         | Description                                                                                                                    |
|-------------------|---------------------------------------|----------------------------------------------------------------------------------------------------------|
| port              | `undefined`                             | Port for USB stick (_example_: `/dev/tty.usbmodem144`). If not set, it tries to find port automatically. |
| database          | `'<homebridge_storage_path>/zigbee.db'` | Path to zigbee database.                                                                                        |
| permitJoinTimeout | `120`                                   | Timeout of permit join command (seconds).                                                                |
