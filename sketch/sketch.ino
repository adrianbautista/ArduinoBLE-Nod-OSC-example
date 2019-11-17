#include <Arduino_LSM6DS3.h>
#include <ArduinoBLE.h>

BLEService imuService("828962b9-c23b-4774-af22-0d329d7c758f");

// specify characteristics for reading and notfication, specify 12 byte max size value
BLECharacteristic gyroscopeCharacteristic("37982584-005c-493d-bb9a-b06008f1bdc6", BLERead | BLENotify, 12);
BLECharacteristic accelerationCharacteristic("a61ee3a1-bf0d-4971-9dd2-3b57140aebf5", BLERead | BLENotify, 12);

void setup() {
  Serial.begin(9600);
  pinMode(LED_BUILTIN, OUTPUT);

  if (!IMU.begin()) {
    Serial.println("Failed to initialize IMU!");

    while (1);
  }

  while (!BLE.begin()) {
    Serial.println("Waiting for BLE to start");
    delay(1);
  }

  BLE.setAdvertisedService(imuService);
  imuService.addCharacteristic(gyroscopeCharacteristic);
  imuService.addCharacteristic(accelerationCharacteristic);
  BLE.addService(imuService);
  BLE.advertise();
}

void loop() {
  BLEDevice central = BLE.central();

  if (central) {
    Serial.print("Connected to central: ");
    Serial.println(central.address());
    digitalWrite(LED_BUILTIN, HIGH);

    while (central.connected()) {
      float gyros[3]; // float array to hold {x, y, z}, 4 byte (32-bit) LE floats
      float accels[3]; // float array to hold {x, y, z}, 4 byte (32-bit) LE floats

      if (IMU.gyroscopeAvailable()) {
        IMU.readGyroscope(gyros[0], gyros[1], gyros[2]);

        Serial.print("gyro: ");
        Serial.print(gyros[0]);
        Serial.print(",");
        Serial.print(gyros[1]);
        Serial.print(",");
        Serial.println(gyros[2]);

        // cast float array to byte array so all values can be sent in one 12 byte message
        gyroscopeCharacteristic.writeValue((byte*) &gyros, 12);
      }

      if (IMU.accelerationAvailable()) {
        IMU.readAcceleration(accels[0], accels[1], accels[2]);

        Serial.print("accels: ");
        Serial.print(accels[0]);
        Serial.print(",");
        Serial.print(accels[1]);
        Serial.print(",");
        Serial.println(accels[2]);

        // cast float array to byte array so all values can be sent in one 12 byte message
        accelerationCharacteristic.writeValue((byte*) &accels, 12);
      }

      delay(5);
    }
  } else {
    digitalWrite(LED_BUILTIN, LOW);
  }
}
