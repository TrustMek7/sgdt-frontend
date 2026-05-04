import { createDeviceType, deleteDeviceType, getDeviceTypes, updateDeviceType } from '../lib/api';
import { DeviceType } from '../lib/types';

export const deviceTypeService = {
  list: () => getDeviceTypes(),
  create: (data: Partial<DeviceType>) => createDeviceType(data),
  update: (id: string, data: Partial<DeviceType>) => updateDeviceType(id, data),
  remove: (id: string) => deleteDeviceType(id),
};
