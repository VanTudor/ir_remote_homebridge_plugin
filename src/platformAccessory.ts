import got from "got";
import { Service, PlatformAccessory, CharacteristicValue, CharacteristicSetCallback, CharacteristicGetCallback } from 'homebridge';

import { IRRemoteEmulatorPlatform } from './platform';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class ExamplePlatformAccessory {
  private service: Service;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private exampleStates = {
    On: false,
    Brightness: 100,
    Hue: 0,
    Saturation: 50,
    ColorTemperature: 10,
    DeviceColor: 'WHITE'
  }

  constructor(
    private readonly platform: IRRemoteEmulatorPlatform,
    private readonly accessory: PlatformAccessory
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Default-Manufacturer')
      .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.exampleDisplayName);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.On)
        .on('set', this.setOn.bind(this))                // SET - bind to the `setOn` method below
        .on('get', this.getOn.bind(this))                // GET - bind to the `getOn` method below

    // register handlers for the Brightness Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.Brightness)
        .on('set', this.setBrightness.bind(this));       // SET - bind to the 'setBrightness` method below

    this.service.getCharacteristic(this.platform.Characteristic.Hue)
        .on('set', this.setHue.bind(this))
        .on('get', this.getHue.bind(this));
    // this.service.getCharacteristic(this.platform.Characteristic.Saturation)
    //     .on('set', this.setSaturation.bind(this))
    //     .on('get', this.getSaturation.bind(this));
    // this.service.getCharacteristic(this.platform.Characteristic.ColorTemperature)
    //     .on('set', this.setColorTemperature.bind(this))
    //     .on('get', this.getColorTemperature.bind(this));
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  async setOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {

    // implement your own code to turn your device on/off
    await got.post('http://192.168.100.11:3001/remoteControlEmulator/emitIrCodeByCommandAndRemoteControl', {
      json: {
        deviceId: this.accessory.UUID,
        commandName: !!value ? 'On' : 'Off'
      }
    });
    this.exampleStates.On = value as boolean;

    this.platform.log.debug('Set Characteristic On ->', value, !!value);

    // you must call the callback function
    callback(null);
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   *
   * GET requests should return as fast as possbile. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   *
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.
   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
  getOn(callback: CharacteristicGetCallback) {

    // implement your own code to check if the device is on
    const isOn = this.exampleStates.On;

    this.platform.log.debug('Get Characteristic On ->', isOn);

    // you must call the callback function
    // the first argument should be null if there were no errors
    // the second argument should be the value to return
    callback(null, isOn);
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, changing the Brightness
   */
  setBrightness(value: CharacteristicValue, callback: CharacteristicSetCallback) {

    // implement your own code to set the brightness
    this.exampleStates.Brightness = value as number;

    this.platform.log.debug('Set Characteristic Brightness -> ', value);

    // you must call the callback function
    callback(null);
  }

  async setHue(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.platform.log.debug('HUE VALUE:', value);

    // implement your own code to set the brightness
    this.exampleStates.Hue = value as number;

    let deviceColor: string = '';
    switch (true) {
      case (this.exampleStates.Hue < 4):
        deviceColor = 'RED';
        break;
      case (this.exampleStates.Hue < 8):
        deviceColor = 'DARK_ORANGE';
        break;
      case (this.exampleStates.Hue < 14):
        deviceColor = 'ORANGE';
        break;
      case (this.exampleStates.Hue < 38):
        deviceColor = 'LIGHT_ORANGE';
        break;
      case (this.exampleStates.Hue < 50):
        deviceColor = 'YELLOW';
        break;
      case (this.exampleStates.Hue < 100):
        deviceColor = 'LIGHT_GREEN';
        break;
      case (this.exampleStates.Hue < 150):
        deviceColor = 'GREEN';
        break;
      case (this.exampleStates.Hue < 180):
        deviceColor = 'TEAL';
        break;
      case (this.exampleStates.Hue < 200):
        deviceColor = 'LIGHT_BLUE';
        break;
      case (this.exampleStates.Hue < 210):
        deviceColor = 'BLUE';
        break;
      case (this.exampleStates.Hue < 250):
        deviceColor = 'DARK_BLUE';
        break;
      case (this.exampleStates.Hue < 270):
        deviceColor = 'PURPLE';
        break;
      case (this.exampleStates.Hue < 290):
        deviceColor = 'DARK_PINK';
        break;
      case (this.exampleStates.Hue < 325):
        deviceColor = 'PINK';
        break;
      case (this.exampleStates.Hue < 345):
        deviceColor = 'DARK_PINK';
        break;
      case (this.exampleStates.Hue < 360):
        deviceColor = 'RED';
        break;
      default: 'WHITE';
    }
    // override color if saturation low
    if (this.exampleStates.Saturation < 90) {
      deviceColor = 'WHITE';
    }
    if (this.exampleStates.DeviceColor !== deviceColor) {
      this.exampleStates.DeviceColor = deviceColor;
      await got.post('http://192.168.100.11:3001/remoteControlEmulator/emitIrCodeByCommandAndRemoteControl', {
        json: {
          deviceId: this.accessory.UUID,
          commandName: deviceColor
        }
      });
    }
    this.platform.log.debug('Set Characteristic HUE -> ', value);
    this.platform.log.debug('Set Characteristic HUE. Selected DB color -> ', deviceColor);

    // you must call the callback function
    callback(null);
  }

  getHue(callback: CharacteristicSetCallback) {
    const hue = this.exampleStates.Hue;
    this.platform.log.debug('Get Characteristic Hue ->', hue);
    callback(null, hue);
  }

  async setSaturation(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.platform.log.debug('SATURATION VALUE:', value);

    // implement your own code to set the brightness
    this.exampleStates.Saturation = value as number;
    let deviceColor: string = '';

    if (this.exampleStates.Saturation < 90) {
      deviceColor = 'WHITE';
    }
    if (this.exampleStates.DeviceColor !== deviceColor) {
      this.exampleStates.DeviceColor = deviceColor;
      await got.post('http://192.168.100.11:3001/remoteControlEmulator/emitIrCodeByCommandAndRemoteControl', {
        json: {
          deviceId: this.accessory.UUID,
          commandName: deviceColor
        }
      });
    }
    this.platform.log.debug('Set Characteristic Saturation. Selected DB color -> ', deviceColor);

    this.platform.log.debug('Set Characteristic Saturation -> ', value);

    // you must call the callback function
    callback(null);
  }

  getSaturation(callback: CharacteristicGetCallback) {

    // implement your own code to check if the device is on
    const saturation = this.exampleStates.Saturation;

    this.platform.log.debug('Get Characteristic Saturation ->', saturation);

    // you must call the callback function
    // the first argument should be null if there were no errors
    // the second argument should be the value to return
    callback(null, saturation);
  }


  // async setColorTemperature(value: CharacteristicValue, callback: CharacteristicSetCallback) {
  //   this.platform.log.debug('ColorTemperature VALUE:', value);
  //
  //   // implement your own code to set the brightness
  //   this.exampleStates.ColorTemperature = value as number;
  //
  //   this.platform.log.debug('Set Characteristic ColorTemperature -> ', value);
  //
  //   // you must call the callback function
  //   callback(null);
  // }
  //
  // getColorTemperature(callback: CharacteristicGetCallback) {
  //
  //   // implement your own code to check if the device is on
  //   const colorTemperature = this.exampleStates.ColorTemperature;
  //
  //   this.platform.log.debug('Get Characteristic ColorTemperature ->', colorTemperature);
  //
  //   // you must call the callback function
  //   // the first argument should be null if there were no errors
  //   // the second argument should be the value to return
  //   callback(null, colorTemperature);
  // }
}