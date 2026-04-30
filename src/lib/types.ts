export type Status = 'New' | 'Transfer';

export interface Area {
  id: string;
  name: string;
  officeCount: number;
}

export interface Office {
  id: string;
  name: string;
  floor: number;
  areaId: string;
  deviceCount: number;
}

export interface DeviceType {
  id: string;
  planCode: string;
  description: string;
  characteristics: string;
  brandModel: string;
  imageUrl?: string;
}

export interface Device {
  id: string;
  inventoryCode: string;
  planCode: string;
  typeId: string;
  status: Status;
  floor: number;
  destinationOfficeId: string;
  originOfficeId?: string;
}