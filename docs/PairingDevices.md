# Pairing Devices

Basic steps to pair a device:
1. Flick a switch "Permit Join" in the Home app or homebridge web ui
1. Hold a pair/setup button on your device until it starts blinking
1. Many devices come to sleep even in the pairing mode, so there is a good idea to press a button every couple of seconds. At this point. Pairing process might take a couple of minutes, so don't stop after first 10 seconds.
1. At this point you should start to see `Received message from unknown device` and `Join progress: interview endpoint 1 of 1 and cluster 1 of 8` messages in the log output of the homebridge – it's a good sign. 
1. Continue until you get `... cluster 8 of 8`. After that you will get `Device announced incoming and is added` and something like `Registered device: 0x00123456787654321 LUMI lumi.sensor_magnet`
1. You're done, device now attached to your network and working 🎉
