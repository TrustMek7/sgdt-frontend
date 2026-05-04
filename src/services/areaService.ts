import { createArea, deleteArea, getAreas, updateArea } from '../lib/api';
import { Area } from '../lib/types';

export const areaService = {
  list: () => getAreas(),
  create: (data: Partial<Area>) => createArea(data),
  update: (id: string, data: Partial<Area>) => updateArea(id, data),
  remove: (id: string) => deleteArea(id),
};
