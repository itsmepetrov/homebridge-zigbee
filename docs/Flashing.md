# Flashing

## Hardware requirements

In order to flash the ZigBee stick we need the following hardware:

| Name | Price | Picture |
| ------------- | ------------- | ------------- |
| CC debugger | +-10$ on AliExpress | ![CC debugger](assets/cc_debugger.jpg) |
| Downloader cable CC2531 | +-3.50$ on AliExpress | ![Downloader cable CC2531](assets/downloader_cable.png) |

## Flashing the CC2531 USB stick

The CC2531 USB stick needs to be flashed with a custom firmware. The following instructions assume you have a CC Debugger. In case you don't, see [Alternative firmware flashing methods](#alternative-firmware-flashing-methods).

### For Windows

1. Install [SmartRF Flash programmer](http://www.ti.com/tool/FLASH-PROGRAMMER) (**NOT V2**). This software is free but requires a Texas Instruments account in order to download.

2. Install the [CC debugger driver](http://www.ti.com/general/docs/lit/getliterature.tsp?baseLiteratureNumber=swrc212&fileType=zip) on your PC (Windows only). Before continuing, verify that the CC Debugger driver has been installed correctly. See [Figure 1. Verify Correct Driver Installation @ Chapter 5.1](http://www.ti.com/lit/ug/swru197h/swru197h.pdf). In case the CC Debugger is not recognized correctly [install the driver manually](https://www.youtube.com/watch?v=jyKrxxXOvQY).

2. Connect `CC debugger --> Downloader cable CC2531 --> CC2531 USB stick`.

3. Connect **BOTH** the `CC2531 USB stick` and the `CC debugger` to your PC using USB.

3. If the light on the CC debugger is RED press set reset button on the CC debugger. The light on the CC debugger should now turn GREEN. If not use [CC debugger user guide](http://www.ti.com/lit/ug/swru197h/swru197h.pdf) to troubleshoot your problem.
![How to connect](assets/connected.jpg)

4. Download the firmware [CC2531ZNP-2018090201.hex](../firmware/CC2531ZNP-2018090201.hex)

5. Start SmartRF Flash Programmer, setup as shown below and press `Perform actions`.
![SmartRF Flash Programmer](assets/smartrf.png)

### For Linux/MacOS

1. Install prerequisites for [CC-Tool](https://github.com/dashesy/cc-tool) using a package manager (ex. brew for MacOS)
   > Ubuntu: libusb-1.0, libboost-all-dev  
   > Fedora: boost-devel, libusb1-devel  
   > Mac OS: libusb boost pkgconfig  

2. Build your cc-tool
   ```bash
   git clone https://github.com/dashesy/cc-tool.git
   cd cc-tool
   ./configure
   make
   ```
3. Download the firmware [CC2531ZNP-Pro-Secure_LinkKeyJoin.hex](../firmware/CC2531ZNP-Pro-Secure_LinkKeyJoin.hex)

4. Flash your firmware
   ```bash
   sudo ./cc-tool -e -w CC2531ZNP-Prod.hex
   ```

## Alternative firmware flashing methods

TBD

_This page is based on [wiki](https://github.com/Koenkk/zigbee2mqtt/wiki) from [zigbee2mqtt](https://github.com/Koenkk/zigbee2mqtt) project._