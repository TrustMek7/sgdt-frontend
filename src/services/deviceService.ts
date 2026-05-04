import { createDevice, deleteDevice, getDevicesList, updateDevice } from '../lib/api';
import { DeviceCreatePayload, DeviceUpdatePayload } from '../lib/types';

export const deviceService = {
  list: (page = 1, limit = 10) => getDevicesList(page, limit),
  create: (data: DeviceCreatePayload) => createDevice(data),
  update: (id: string, data: DeviceUpdatePayload) => updateDevice(id, data),
  remove: (id: string) => deleteDevice(id),
};
