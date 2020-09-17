import got from "got";
import { Service, PlatformAccessory, CharacteristicValue, CharacteristicSetCallback, CharacteristicGetCallback } from 'homebridge';

import { IRRemoteEmulatorPlatform } from './platform';

export enum ECommandTypes {
  BRIGHTNESS_UP = 'BRIGHTNESS_UP',
  BRIGHTNESS_DOWN = 'BRIGHTNESS_DOWN',
  ON = 'ON',
  OFF = 'OFF',
  DARK_ORANGE = 'DARK_ORANGE',
  ORANGE = 'ORANGE',
  LIGHT_ORANGE = 'LIGHT_ORANGE',
  YELLOW = 'YELLOW',
  LIGHT_GREEN = 'LIGHT_GREEN',
  GREEN = 'GREEN',
  TEAL = 'TEAL',
  LIGHT_BLUE = 'LIGHT_BLUE',
  BLUE = 'BLUE',
  DARK_BLUE = 'DARK_BLUE',
  PURPLE = 'PURPLE',
  PINK = 'PINK',
  DARK_PINK = 'DARK_PINK',
  RED = 'RED',
  WHITE = 'WHITE'
}

export type TBrightnessCommands = ECommandTypes.BRIGHTNESS_UP | ECommandTypes.BRIGHTNESS_DOWN;
export type TColorCommands = ECommandTypes.DARK_ORANGE |
  ECommandTypes.ORANGE |
  ECommandTypes.LIGHT_ORANGE |
  ECommandTypes.YELLOW |
  ECommandTypes.LIGHT_GREEN |
  ECommandTypes.GREEN |
  ECommandTypes.TEAL |
  ECommandTypes.LIGHT_BLUE |
  ECommandTypes.BLUE |
  ECommandTypes.DARK_BLUE |
  ECommandTypes.PURPLE |
  ECommandTypes.PINK |
  ECommandTypes.DARK_PINK |
  ECommandTypes.RED |
  ECommandTypes.WHITE;
export type TOnOffCommands = ECommandTypes.ON | ECommandTypes.OFF;

function getBrightnessInstructions(prevValue: number, currentValue: number): { steps: number, command: TBrightnessCommands } {
  const diff = Math.floor(prevValue / 25) - Math.floor(currentValue / 25);

  return {
    steps: Math.abs(diff),
    command: diff < 0 ? ECommandTypes.BRIGHTNESS_UP : ECommandTypes.BRIGHTNESS_DOWN
  }
}
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
  private state = {
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
    this.service.getCharacteristic(this.platform.Characteristic.Saturation)
        .on('set', this.setSaturation.bind(this))
        .on('get', this.getSaturation.bind(this));
    // this.service.getCharacteristic(this.platform.Characteristic.ColorTemperature)
    //     .on('set', this.setColorTemperature.bind(this))
    //     .on('get', this.getColorTemperature.bind(this));
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  async setOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {

    const commandName: TOnOffCommands = !!value ? ECommandTypes.ON : ECommandTypes.OFF
    // implement your own code to turn your device on/off
    await got.post('http://192.168.100.11:3001/remoteControlEmulator/emitIrCodeByCommandAndRemoteControl', {
      json: {
        deviceId: this.accessory.UUID,
        commandName,
      }
    });
    this.state.On = value as boolean;

    this.platform.log.debug('Set Characteristic On ->', value, !!value);

    // you must call the callback function
    callback(null);
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   *
   * GET requests should return as fast as possible. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   *
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.
   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
  getOn(callback: CharacteristicGetCallback) {

    // implement your own code to check if the device is on
    const isOn = this.state.On;

    this.platform.log.debug('Get Characteristic On ->', isOn);

    // you must call the callback function
    // the first argument should be null if there were no errors
    // the second argument should be the value to return
    callback(null, isOn);
  }

  /**
   * This are sent when the user changes the state of an accessory from the HomeKit app.
   * The OSRAM light bulb has only 4 levels of brightness, so this method will fit any value received
   * accordingly (0-25% to step 1, 26-50% to step 2, 51-75% to step 3 and 76-100% to step 4).
   *
   * Since the light bulb's state is flaky, we need a way to reset it. The highest and lowest sections
   * of the interval do this, i.e. setting the brightness value to 0-25% will cause 4 BRIGHTNESS_DOWN
   * commands to be issued. Similarly, setting it to 76-100% will cause 4 BRIGHTNESS_UP commands to be
   * issued.
   */
  async setBrightness(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    const brightness = value as number;
    let steps: number;
    let command: TBrightnessCommands;
    switch (true) {
      case brightness <= 25:
        steps = 4;
        command = ECommandTypes.BRIGHTNESS_DOWN;
        break;
      case brightness <= 75:
        ({ steps, command} = getBrightnessInstructions(this.state.Brightness, brightness));
        break;
      default:
        steps = 4;
        command = ECommandTypes.BRIGHTNESS_UP;
    }
    this.platform.log.debug(`Set Characteristic Brightness preValue: ${this.state.Brightness}, newValue: ${brightness}, steps: ${steps}, command: ${command}`);
    this.state.Brightness = brightness;
    for (let i = 0; i < steps; i++) {
      await got.post('http://192.168.100.11:3001/remoteControlEmulator/emitIrCodeByCommandAndRemoteControl', {
        json: {
          deviceId: this.accessory.UUID,
          commandName: command
        }
      });
    }
    callback(null);
  }

  async setHue(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.platform.log.debug('HUE VALUE:', value);

    this.state.Hue = value as number;

    let deviceColor: TColorCommands;
    switch (true) {
      case (this.state.Hue < 4):
        deviceColor = ECommandTypes.RED;
        break;
      case (this.state.Hue < 8):
        deviceColor = ECommandTypes.DARK_ORANGE;
        break;
      case (this.state.Hue < 14):
        deviceColor = ECommandTypes.ORANGE;
        break;
      case (this.state.Hue < 38):
        deviceColor = ECommandTypes.LIGHT_ORANGE;
        break;
      case (this.state.Hue < 50):
        deviceColor = ECommandTypes.YELLOW;
        break;
      case (this.state.Hue < 100):
        deviceColor = ECommandTypes.LIGHT_GREEN;
        break;
      case (this.state.Hue < 150):
        deviceColor = ECommandTypes.GREEN;
        break;
      case (this.state.Hue < 180):
        deviceColor = ECommandTypes.TEAL;
        break;
      case (this.state.Hue < 200):
        deviceColor = ECommandTypes.LIGHT_BLUE;
        break;
      case (this.state.Hue < 210):
        deviceColor = ECommandTypes.BLUE;
        break;
      case (this.state.Hue < 250):
        deviceColor = ECommandTypes.DARK_BLUE;
        break;
      case (this.state.Hue < 270):
        deviceColor = ECommandTypes.PURPLE;
        break;
      case (this.state.Hue < 290):
        deviceColor = ECommandTypes.DARK_PINK;
        break;
      case (this.state.Hue < 325):
        deviceColor = ECommandTypes.PINK;
        break;
      case (this.state.Hue < 345):
        deviceColor = ECommandTypes.DARK_PINK;
        break;
      case (this.state.Hue < 360):
        deviceColor = ECommandTypes.RED;
        break;
      default:
        deviceColor = ECommandTypes.WHITE;
    }
    // override color if saturation low
    if (this.state.Saturation < 90) {
      deviceColor = ECommandTypes.WHITE;
    }
    if (this.state.DeviceColor !== deviceColor) {
      this.state.DeviceColor = deviceColor;
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
    const hue = this.state.Hue;
    this.platform.log.debug('Get Characteristic Hue ->', hue);
    callback(null, hue);
  }

  async setSaturation(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.platform.log.debug('SATURATION VALUE:', value);

    this.state.Saturation = value as number;
    let deviceColor: string = '';

    if (this.state.Saturation < 90) {
      deviceColor = 'WHITE';
    }
    if (this.state.DeviceColor !== deviceColor) {
      this.state.DeviceColor = deviceColor;
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
    const saturation = this.state.Saturation;

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
  //   this.state.ColorTemperature = value as number;
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
  //   const colorTemperature = this.state.ColorTemperature;
  //
  //   this.platform.log.debug('Get Characteristic ColorTemperature ->', colorTemperature);
  //
  //   // you must call the callback function
  //   // the first argument should be null if there were no errors
  //   // the second argument should be the value to return
  //   callback(null, colorTemperature);
  // }
}