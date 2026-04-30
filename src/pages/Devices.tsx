import React, { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { mockDevices, mockDeviceTypes, mockOffices } from '../lib/mockData';
import { Device } from '../lib/types';
export function Devices() {
  const [devices, setDevices] = useState<Device[]>(mockDevices);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [floorFilter, setFloorFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    typeId: '',
    inventoryCode: '',
    destinationOfficeId: '',
    originOfficeId: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      const type = mockDeviceTypes.find((t) => t.id === device.typeId);
      const matchesSearch =
      device.inventoryCode.toLowerCase().includes(search.toLowerCase()) ||
      device.planCode.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter ? device.typeId === typeFilter : true;
      const matchesStatus = statusFilter ? device.status === statusFilter : true;
      const matchesFloor = floorFilter ?
      device.floor.toString() === floorFilter :
      true;
      return matchesSearch && matchesType && matchesStatus && matchesFloor;
    });
  }, [devices, search, typeFilter, statusFilter, floorFilter]);
  const selectedType = mockDeviceTypes.find((t) => t.id === formData.typeId);
  const isTransfer = selectedType?.planCode.startsWith('Ex');
  const isNew = selectedType?.planCode.startsWith('E') && !isTransfer;
  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.typeId) newErrors.typeId = 'Type is required';
    if (!formData.destinationOfficeId)
    newErrors.destinationOfficeId = 'Destination office is required';
    if (isTransfer && !formData.originOfficeId)
    newErrors.originOfficeId = 'Origin office is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    const destOffice = mockOffices.find(
      (o) => o.id === formData.destinationOfficeId
    );
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
    toast.success('Device added successfully');
    setIsModalOpen(false);
    setFormData({
      typeId: '',
      inventoryCode: '',
      destinationOfficeId: '',
      originOfficeId: ''
    });
    setErrors({});
  };
  const floors = Array.from(new Set(mockOffices.map((o) => o.floor))).sort();
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Devices</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2">
          
          <Plus className="w-4 h-4" /> New Device
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search inventory or plan code..."
            className="input-field pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)} />
          
        </div>
        <select
          className="input-field w-48"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}>
          
          <option value="">All Types</option>
          {mockDeviceTypes.map((t) =>
          <option key={t.id} value={t.id}>
              {t.description}
            </option>
          )}
        </select>
        <select
          className="input-field w-36"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}>
          
          <option value="">All Status</option>
          <option value="New">New</option>
          <option value="Transfer">Transfer</option>
        </select>
        <select
          className="input-field w-32"
          value={floorFilter}
          onChange={(e) => setFloorFilter(e.target.value)}>
          
          <option value="">All Floors</option>
          {floors.map((f) =>
          <option key={f} value={f}>
              Floor {f}
            </option>
          )}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium">Inventory Code</th>
                <th className="px-6 py-3 font-medium">Plan Code</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Floor</th>
                <th className="px-6 py-3 font-medium">Destination</th>
                <th className="px-6 py-3 font-medium">Origin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDevices.map((device) => {
                const type = mockDeviceTypes.find((t) => t.id === device.typeId);
                const dest = mockOffices.find(
                  (o) => o.id === device.destinationOfficeId
                );
                const orig = mockOffices.find(
                  (o) => o.id === device.originOfficeId
                );
                return (
                  <tr
                    key={device.id}
                    className="hover:bg-gray-50 transition-colors">
                    
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {device.inventoryCode ||
                      <span className="text-gray-400 italic">N/A</span>
                      }
                    </td>
                    <td className="px-6 py-4">{device.planCode}</td>
                    <td className="px-6 py-4">{type?.description}</td>
                    <td className="px-6 py-4">
                      <Badge status={device.status} />
                    </td>
                    <td className="px-6 py-4">{device.floor}</td>
                    <td className="px-6 py-4">{dest?.name}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {orig?.name || '-'}
                    </td>
                  </tr>);

              })}
              {filteredDevices.length === 0 &&
              <tr>
                  <td
                  colSpan={7}
                  className="px-6 py-8 text-center text-gray-500">
                  
                    No devices found matching your filters.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Device">
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Device Type
            </label>
            <select
              className={`input-field ${errors.typeId ? 'border-red-500 focus:ring-red-500' : ''}`}
              value={formData.typeId}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  typeId: e.target.value,
                  originOfficeId: ''
                });
                setErrors({
                  ...errors,
                  typeId: ''
                });
              }}>
              
              <option value="">Select a type...</option>
              {mockDeviceTypes.map((t) =>
              <option key={t.id} value={t.id}>
                  {t.planCode} - {t.description}
                </option>
              )}
            </select>
            {errors.typeId &&
            <p className="text-red-500 text-xs mt-1">{errors.typeId}</p>
            }
          </div>

          {selectedType &&
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status (Auto-assigned)
              </label>
              <div className="py-2">
                <Badge status={isTransfer ? 'Transfer' : 'New'} />
              </div>
            </div>
          }

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inventory Code (Optional)
            </label>
            <input
              type="text"
              className="input-field"
              value={formData.inventoryCode}
              onChange={(e) =>
              setFormData({
                ...formData,
                inventoryCode: e.target.value
              })
              }
              placeholder="e.g. INV-2024-001" />
            
          </div>

          {isTransfer &&
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Origin Office
              </label>
              <select
              className={`input-field ${errors.originOfficeId ? 'border-red-500 focus:ring-red-500' : ''}`}
              value={formData.originOfficeId}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  originOfficeId: e.target.value
                });
                setErrors({
                  ...errors,
                  originOfficeId: ''
                });
              }}>
              
                <option value="">Select origin office...</option>
                {mockOffices.map((o) =>
              <option key={o.id} value={o.id}>
                    {o.name} (Floor {o.floor})
                  </option>
              )}
              </select>
              {errors.originOfficeId &&
            <p className="text-red-500 text-xs mt-1">
                  {errors.originOfficeId}
                </p>
            }
            </div>
          }

          {(isNew || isTransfer) &&
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination Office
              </label>
              <select
              className={`input-field ${errors.destinationOfficeId ? 'border-red-500 focus:ring-red-500' : ''}`}
              value={formData.destinationOfficeId}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  destinationOfficeId: e.target.value
                });
                setErrors({
                  ...errors,
                  destinationOfficeId: ''
                });
              }}>
              
                <option value="">Select destination office...</option>
                {mockOffices.map((o) =>
              <option key={o.id} value={o.id}>
                    {o.name} (Floor {o.floor})
                  </option>
              )}
              </select>
              {errors.destinationOfficeId &&
            <p className="text-red-500 text-xs mt-1">
                  {errors.destinationOfficeId}
                </p>
            }
            </div>
          }

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <button
              className="btn-secondary"
              onClick={() => setIsModalOpen(false)}>
              
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSave}>
              Save Device
            </button>
          </div>
        </div>
      </Modal>
    </div>);

}