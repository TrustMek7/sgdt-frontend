import React, { useMemo, useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { mockDeviceTypes, mockOffices } from '../lib/mockData';
import { Device } from '../lib/types';
import { api } from '../lib/api';

export function Devices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 10;

  useEffect(() => {
    fetchDevices(page);
  }, [page]);

  const fetchDevices = async (currentPage: number) => {
    try {
      setLoading(true);
      const res = await api.get(`/devices?page=${currentPage}&limit=${limit}`);
      setDevices(res.data.data);
      setTotalCount(res.data.totalCount);
    } catch (error) {
      console.error('Error loading devices', error);
      toast.error('Error al cargar dispositivos');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [floorFilter, setFloorFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);
  const [formData, setFormData] = useState({
    typeId: '',
    inventoryCode: '',
    destinationOfficeId: '',
    originOfficeId: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      const matchesSearch =
        device.inventoryCode.toLowerCase().includes(search.toLowerCase()) ||
        device.planCode.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter ? device.typeId === typeFilter : true;
      const matchesStatus = statusFilter ? device.status === statusFilter : true;
      const matchesFloor = floorFilter ? device.floor.toString() === floorFilter : true;
      return matchesSearch && matchesType && matchesStatus && matchesFloor;
    });
  }, [devices, search, typeFilter, statusFilter, floorFilter]);

  const selectedType = mockDeviceTypes.find((t) => t.id === formData.typeId);
  const isTransfer = selectedType?.planCode.startsWith('Ex');
  const isNew = selectedType?.planCode.startsWith('E') && !isTransfer;

  const resetForm = () => {
    setFormData({
      typeId: '',
      inventoryCode: '',
      destinationOfficeId: '',
      originOfficeId: ''
    });
    setErrors({});
    setEditingDevice(null);
  };

  const openNewDevice = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditDevice = (device: Device) => {
    setEditingDevice(device);
    setFormData({
      typeId: device.typeId,
      inventoryCode: device.inventoryCode,
      destinationOfficeId: device.destinationOfficeId,
      originOfficeId: device.originOfficeId || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.typeId) newErrors.typeId = 'Tipo es requerido';
    if (!formData.destinationOfficeId)
      newErrors.destinationOfficeId = 'Oficina destino es requerida';
    if (isTransfer && !formData.originOfficeId)
      newErrors.originOfficeId = 'Oficina origen es requerida para traslados';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const destOffice = mockOffices.find((o) => o.id === formData.destinationOfficeId);

    if (editingDevice) {
      // Editar dispositivo existente
      setDevices(
        devices.map((d) =>
          d.id === editingDevice.id
            ? {
                ...d,
                inventoryCode: formData.inventoryCode,
                typeId: formData.typeId,
                planCode: selectedType!.planCode,
                status: isTransfer ? 'Transfer' : 'New',
                floor: destOffice?.floor || 1,
                destinationOfficeId: formData.destinationOfficeId,
                originOfficeId: isTransfer ? formData.originOfficeId : undefined
              }
            : d
        )
      );
      toast.success('Dispositivo actualizado');
    } else {
      // Crear nuevo dispositivo
      const newDevice: Device = {
        id: `d${Date.now()}`,
        inventoryCode: formData.inventoryCode,
        planCode: selectedType!.planCode,
        typeId: formData.typeId,
        status: isTransfer ? 'Transfer' : 'New',
        floor: destOffice?.floor || 1,
        destinationOfficeId: formData.destinationOfficeId,
        originOfficeId: isTransfer ? formData.originOfficeId : undefined
      };
      setDevices([newDevice, ...devices]);
      toast.success('Dispositivo creado');
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDeleteClick = (device: Device) => {
    setDeviceToDelete(device);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deviceToDelete) {
      setDevices(devices.filter((d) => d.id !== deviceToDelete.id));
      toast.success('Dispositivo eliminado');
      setIsDeleteConfirmOpen(false);
      setDeviceToDelete(null);
    }
  };

  const floors = Array.from(new Set(mockOffices.map((o) => o.floor))).sort();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dispositivos</h1>
        <button onClick={openNewDevice} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo Dispositivo
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar código o plan..."
            className="input-field pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field w-48"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          {mockDeviceTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.planCode} - {t.description}
            </option>
          ))}
        </select>
        <select
          className="input-field w-36"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="New">Nuevo</option>
          <option value="Transfer">Traslado</option>
        </select>
        <select
          className="input-field w-32"
          value={floorFilter}
          onChange={(e) => setFloorFilter(e.target.value)}
        >
          <option value="">Todos los pisos</option>
          {floors.map((f) => (
            <option key={f} value={f}>
              Piso {f}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium">Código Inventario</th>
                <th className="px-6 py-3 font-medium">Plan</th>
                <th className="px-6 py-3 font-medium">Tipo</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium">Piso</th>
                <th className="px-6 py-3 font-medium">Destino</th>
                <th className="px-6 py-3 font-medium">Origen</th>
                <th className="px-6 py-3 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDevices.map((device) => {
                const type = mockDeviceTypes.find((t) => t.id === device.typeId);
                const dest = mockOffices.find((o) => o.id === device.destinationOfficeId);
                const orig = mockOffices.find((o) => o.id === device.originOfficeId);
                return (
                  <tr key={device.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {device.inventoryCode || <span className="text-gray-400 italic">S/C</span>}
                    </td>
                    <td className="px-6 py-4 font-semibold text-blue-600">{device.planCode}</td>
                    <td className="px-6 py-4 text-gray-700">{type?.description}</td>
                    <td className="px-6 py-4">
                      <Badge status={device.status} />
                    </td>
                    <td className="px-6 py-4">{device.floor}</td>
                    <td className="px-6 py-4">{dest?.name}</td>
                    <td className="px-6 py-4 text-gray-500">{orig?.name || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditDevice(device)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(device)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredDevices.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron dispositivos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Controles de paginación */}
      <div className="flex justify-between items-center mt-4">
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="text-gray-600">Página {page} de {totalPages || 1}</span>
        <button 
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages || loading}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>

      {/* Modal para crear/editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingDevice ? 'Editar Dispositivo' : 'Nuevo Dispositivo'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Dispositivo *
            </label>
            <select
              value={formData.typeId}
              onChange={(e) => {
                setFormData({ ...formData, typeId: e.target.value });
                setErrors({ ...errors, typeId: '' });
              }}
              className={`input-field ${errors.typeId ? 'border-red-500' : ''}`}
            >
              <option value="">Seleccionar tipo...</option>
              {mockDeviceTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.planCode} - {t.description}
                </option>
              ))}
            </select>
            {errors.typeId && <p className="text-red-500 text-sm mt-1">{errors.typeId}</p>}
          </div>

          {selectedType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado (Auto-asignado)
              </label>
              <div className="py-2">
                <Badge status={isTransfer ? 'Transfer' : 'New'} />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código de Inventario
            </label>
            <input
              type="text"
              value={formData.inventoryCode}
              onChange={(e) => setFormData({ ...formData, inventoryCode: e.target.value })}
              placeholder="Ej: INV-2026-001"
              className="input-field"
            />
          </div>

          {isTransfer && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Oficina Origen *
              </label>
              <select
                value={formData.originOfficeId}
                onChange={(e) => {
                  setFormData({ ...formData, originOfficeId: e.target.value });
                  setErrors({ ...errors, originOfficeId: '' });
                }}
                className={`input-field ${errors.originOfficeId ? 'border-red-500' : ''}`}
              >
                <option value="">Seleccionar oficina...</option>
                {mockOffices.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} - Piso {o.floor}
                  </option>
                ))}
              </select>
              {errors.originOfficeId && (
                <p className="text-red-500 text-sm mt-1">{errors.originOfficeId}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Oficina Destino *
            </label>
            <select
              value={formData.destinationOfficeId}
              onChange={(e) => {
                setFormData({ ...formData, destinationOfficeId: e.target.value });
                setErrors({ ...errors, destinationOfficeId: '' });
              }}
              className={`input-field ${errors.destinationOfficeId ? 'border-red-500' : ''}`}
            >
              <option value="">Seleccionar oficina...</option>
              {mockOffices.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} - Piso {o.floor}
                </option>
              ))}
            </select>
            {errors.destinationOfficeId && (
              <p className="text-red-500 text-sm mt-1">{errors.destinationOfficeId}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {editingDevice ? 'Actualizar' : 'Crear'}
            </button>
            <button
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="Confirmar Eliminación"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">¿Eliminar dispositivo?</p>
              {deviceToDelete && (
                <p className="text-sm text-red-700 mt-1">
                  {deviceToDelete.planCode} -{' '}
                  {mockDeviceTypes.find((t) => t.id === deviceToDelete.typeId)?.description}
                  {deviceToDelete.inventoryCode && ` (${deviceToDelete.inventoryCode})`}
                </p>
              )}
              <p className="text-sm text-red-700 mt-2">Esta acción no se puede deshacer.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDeleteConfirm}
              className="flex-1 bg-red-600 text-white font-medium py-2 rounded-lg hover:bg-red-700 transition"
            >
              Eliminar
            </button>
            <button
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
