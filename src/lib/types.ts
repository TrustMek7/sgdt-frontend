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
  isTransfer?: boolean;
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
  originOfficeDescription?: string;
}

export interface DeviceCreatePayload {
  inventoryCode?: string;
  inventoryCodes?: string[];
  typeId: string;
  destinationOfficeId: string;
  originOfficeId?: string;
  originOfficeDescription?: string;
  quantity?: number;
}

export interface DeviceCreateResponse {
  message: string;
  created: number;
  devices: Device[];
}

export interface DeviceUpdatePayload {
  inventoryCode?: string;
  typeId?: string;
  destinationOfficeId?: string;
  originOfficeId?: string;
  originOfficeDescription?: string;
}

export interface PaginatedDevicesResponse {
  data: Device[];
  totalCount: number;
  page: number;
  totalPages: number;
}

export interface ReportSummary {
  areas: Area[];
  offices: Office[];
  deviceTypes: DeviceType[];
  devices: Device[];
  totals: {
    areas: number;
    offices: number;
    deviceTypes: number;
    devices: number;
    newDevices: number;
    transferDevices: number;
  };
}

export interface ReportBatchFilter {
  floor?: number;
  areaId?: string;
  status?: 'Todos' | 'New' | 'Transfer';
  title?: string;
}

export interface ReportBatchItem extends ReportSummary {
  filter?: ReportBatchFilter;
  title: string;
}

export interface ReportBatchResponse {
  reports: ReportBatchItem[];
}