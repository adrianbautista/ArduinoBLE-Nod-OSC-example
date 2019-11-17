Example code to read IMU accelerometer and gyroscope data from an Arduino Nano 33 IoT, send that data to a Node.js server, and forward that data as OSC messages (e.g. to Max 8).

## Prereqs

This code is tested with Node.js 9.x and Python 2.7. Had issues installing the Noble library with Node 10.x and Python 3.

Also using the [`abandonware/noble`](https://github.com/abandonware/noble) fork of Noble because had issues running the original Noble library on a High Sierra MacOS.

## Getting Started

- Clone or download this repository
- Install the Arduino sketch on your Arduino Nano 33
- Install Node.js dependencies in this repository (`npm install`)
- Start the server (`node index.js` or `npm start`)

## Resources/Inspiration

- https://www.arduino.cc/en/Reference/ArduinoBLE
- https://github.com/abandonware/noble
- https://github.com/8bitkick/8bitkick.github.io/blob/master/BLE_IMU.ino
- https://github.com/colinbdclark/osc.js-examples/tree/master/udp-browser
- https://github.com/tigoe/BluetoothLE-Examples
