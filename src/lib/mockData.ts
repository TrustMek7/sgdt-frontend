import { Area, Office, DeviceType, Device } from './types';

export const mockAreas: Area[] = [
{ id: 'a1', name: 'Dirección General', officeCount: 2 },
{ id: 'a2', name: 'Recursos Humanos', officeCount: 3 },
{ id: 'a3', name: 'Finanzas', officeCount: 2 },
{ id: 'a4', name: 'Tecnología', officeCount: 4 }];


export const mockOffices: Office[] = [
{
  id: 'o1',
  name: 'Oficina 101 - Director',
  floor: 1,
  areaId: 'a1',
  deviceCount: 5
},
{
  id: 'o2',
  name: 'Sala de Juntas A',
  floor: 1,
  areaId: 'a1',
  deviceCount: 2
},
{
  id: 'o3',
  name: 'Oficina 201 - RRHH',
  floor: 2,
  areaId: 'a2',
  deviceCount: 8
},
{
  id: 'o4',
  name: 'Oficina 202 - Reclutamiento',
  floor: 2,
  areaId: 'a2',
  deviceCount: 4
},
{
  id: 'o5',
  name: 'Oficina 301 - Contabilidad',
  floor: 3,
  areaId: 'a3',
  deviceCount: 6
},
{
  id: 'o6',
  name: 'Oficina 401 - Sistemas',
  floor: 4,
  areaId: 'a4',
  deviceCount: 12
}];


export const mockDeviceTypes: DeviceType[] = [
{
  id: 't1',
  planCode: 'EC01',
  description: 'Computadora de Escritorio',
  characteristics: 'Intel i7, 16GB RAM, 512GB SSD',
  brandModel: 'Dell OptiPlex 7090'
},
{
  id: 't2',
  planCode: 'ExC01',
  description: 'Computadora de Escritorio (Transferencia)',
  characteristics: 'Intel i5, 8GB RAM, 256GB SSD',
  brandModel: 'HP ProDesk 400'
},
{
  id: 't3',
  planCode: 'EI01',
  description: 'Impresora Multifuncional',
  characteristics: 'Láser B/N, 40ppm, Duplex',
  brandModel: 'HP LaserJet Pro'
},
{
  id: 't4',
  planCode: 'ExI01',
  description: 'Impresora Multifuncional (Transferencia)',
  characteristics: 'Láser B/N, 30ppm',
  brandModel: 'Brother HL-L2350DW'
},
{
  id: 't5',
  planCode: 'EM01',
  description: 'Monitor 24"',
  characteristics: 'FHD 1080p, IPS, HDMI/DP',
  brandModel: 'Dell P2419H'
},
{
  id: 't6',
  planCode: 'ExM01',
  description: 'Monitor 22" (Transferencia)',
  characteristics: 'FHD 1080p, TN, VGA/HDMI',
  brandModel: 'HP V22v'
}];


export const mockDevices: Device[] = [
{
  id: 'd1',
  inventoryCode: 'INV-2023-001',
  planCode: 'EC01',
  typeId: 't1',
  status: 'New',
  floor: 1,
  destinationOfficeId: 'o1'
},
{
  id: 'd2',
  inventoryCode: 'INV-2023-002',
  planCode: 'EM01',
  typeId: 't5',
  status: 'New',
  floor: 1,
  destinationOfficeId: 'o1'
},
{
  id: 'd3',
  inventoryCode: 'INV-2021-045',
  planCode: 'ExC01',
  typeId: 't2',
  status: 'Transfer',
  floor: 2,
  destinationOfficeId: 'o3',
  originOfficeId: 'o6'
},
{
  id: 'd4',
  inventoryCode: 'INV-2023-003',
  planCode: 'EI01',
  typeId: 't3',
  status: 'New',
  floor: 3,
  destinationOfficeId: 'o5'
},
{
  id: 'd5',
  inventoryCode: '',
  planCode: 'EC01',
  typeId: 't1',
  status: 'New',
  floor: 4,
  destinationOfficeId: 'o6'
},
{
  id: 'd6',
  inventoryCode: 'INV-2020-112',
  planCode: 'ExI01',
  typeId: 't4',
  status: 'Transfer',
  floor: 2,
  destinationOfficeId: 'o4',
  originOfficeId: 'o1'
},
{
  id: 'd7',
  inventoryCode: 'INV-2023-004',
  planCode: 'EM01',
  typeId: 't5',
  status: 'New',
  floor: 4,
  destinationOfficeId: 'o6'
},
{
  id: 'd8',
  inventoryCode: 'INV-2022-088',
  planCode: 'ExM01',
  typeId: 't6',
  status: 'Transfer',
  floor: 3,
  destinationOfficeId: 'o5',
  originOfficeId: 'o4'
}];