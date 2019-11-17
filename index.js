var noble = require('@abandonware/noble');
var osc = require("osc");

// Had issues matching when UUIDs had "-" in them, so removed here
var imuService = "828962b9c23b4774af220d329d7c758f";
var gyroscopeCharacteristicUUID = "37982584005c493dbb9ab06008f1bdc6";
var accelerationCharacteristicUUID = "a61ee3a1bf0d49719dd23b57140aebf5";

var gyroscopeCharacteristic, accelerationChar;

// port of UDP server you want to send to, e.g. "udpreceive 7500" in Max 8
var udpPort = new osc.UDPPort({
    remoteAddress: "127.0.0.1",
    remotePort: 7500,
    metadata: true
});

udpPort.open();

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    console.log('scanning...');
    noble.startScanning([imuService], false);
  }
  else {
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
  noble.stopScanning();
  console.log('found peripheral:', JSON.stringify(peripheral.advertisement));

  peripheral.connect(function(err) {
    console.log('connected');

    peripheral.discoverServices([imuService], function(err, services) {
      services.forEach(function(service) {
        console.log('found service:', service.uuid);

        service.discoverCharacteristics([gyroscopeCharacteristicUUID, accelerationCharacteristicUUID], function(err, characteristics) {
          characteristics.forEach(function(characteristic) {
            if (gyroscopeCharacteristicUUID == characteristic.uuid) {
              console.log('gyroscopescope characteristic found');
              gyroscopeCharacteristic = characteristic;
            }

            if (accelerationCharacteristicUUID == characteristic.uuid) {
              console.log('acceleration characteristic found');
              accelerationCharacteristic = characteristic;
            }
          });

          if (gyroscopeCharacteristic && accelerationCharacteristic) {
            gyroscopeCharacteristic.subscribe(function(err) {
              if (err) {
                console.log("gyroscopescope sub error");
              }
            });

            accelerationCharacteristic.subscribe(function(err) {
              if (err) {
                console.log("accelerationeration sub error");
              }
            });

            gyroscopeCharacteristic.on('data', function(data, isNotification) {
              // read 12 byte array characteristic messages, slice every 4 bytes to get {x, y, z} values
              var gyroscopeX = data.readFloatLE(0);
              var gyroscopeY = data.readFloatLE(4);
              var gyroscopeZ = data.readFloatLE(8);

              console.log(gyroscopeX, gyroscopeY, gyroscopeZ);

              var msg = {
                address: "/gyroscope",
                args: [
                  {
                    type: "f",
                    value: gyroscopeX
                  },
                  {
                    type: "f",
                    value: gyroscopeY
                  },
                  {
                    type: "f",
                    value: gyroscopeZ
                  }
                ]
              };

              // forward formatted OSC message to udp server
              udpPort.send(msg);
            });

            accelerationCharacteristic.on('data', function(data, isNotification) {
              // read 12 byte array characteristic messages, slice every 4 bytes to get {x, y, z} values
              var gyroscopeX = data.readFloatLE(0);
              var accelerationX = data.readFloatLE(0);
              var accelerationY = data.readFloatLE(4);
              var accelerationZ = data.readFloatLE(8);

              console.log(accelerationX, accelerationY, accelerationZ);

              var msg = {
                address: "/acceleration",
                args: [
                  {
                    type: "f",
                    value: accelerationX
                  },
                  {
                    type: "f",
                    value: accelerationY
                  },
                  {
                    type: "f",
                    value: accelerationZ
                  }
                ]
              };

              // forward formatted OSC message to udp server
              udpPort.send(msg);
            });
          }
        });
      });
    });
  });
});
