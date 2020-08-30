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