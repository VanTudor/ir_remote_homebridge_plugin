import { ECommandTypes } from "./platformAccessory";

export interface IPaginatedResponse<T> {
  rows: T[],
  total: number
}

export interface IDevice {
    "id": string,
    "name": string
    "description": string
    "state": unknown,
    "createdAt": Date,
    "updatedAt": Date
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
