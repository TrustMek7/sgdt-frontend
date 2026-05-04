import { createDevice, deleteDevice, getDevicesList, updateDevice } from '../lib/api';
import { Device } from '../lib/types';

export const deviceService = {
  list: (page = 1, limit = 10) => getDevicesList(page, limit),
  create: (data: Partial<Device>) => createDevice(data),
  update: (id: string, data: Partial<Device>) => updateDevice(id, data),
  remove: (id: string) => deleteDevice(id),
};
