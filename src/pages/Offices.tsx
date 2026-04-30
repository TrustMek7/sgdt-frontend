import React, { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../components/Modal';
import { mockOffices, mockAreas } from '../lib/mockData';
import { Office } from '../lib/types';
export function Offices() {
  const [offices, setOffices] = useState<Office[]>(mockOffices);
  const [areaFilter, setAreaFilter] = useState('');
  const [floorFilter, setFloorFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentOffice, setCurrentOffice] = useState<Office | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    floor: '',
    areaId: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const filteredOffices = useMemo(() => {
    return offices.filter((office) => {
      const matchesArea = areaFilter ? office.areaId === areaFilter : true;
      const matchesFloor = floorFilter ?
      office.floor.toString() === floorFilter :
      true;
      return matchesArea && matchesFloor;
    });
  }, [offices, areaFilter, floorFilter]);
  const allFloors = Array.from(new Set(offices.map((o) => o.floor))).sort();
  const handleOpenModal = (office?: Office) => {
    if (office) {
      setCurrentOffice(office);
      setFormData({
        name: office.name,
        floor: office.floor.toString(),
        areaId: office.areaId
      });
    } else {
      setCurrentOffice(null);
      setFormData({
        name: '',
        floor: '',
        areaId: ''
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };
  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (
    !formData.floor ||
    isNaN(Number(formData.floor)) ||
    Number(formData.floor) < 1 ||
    Number(formData.floor) > 99)
    {
      newErrors.floor = 'Valid floor number (1-99) is required';
    }
    if (!formData.areaId) newErrors.areaId = 'Area is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    if (currentOffice) {
      setOffices(
        offices.map((o) =>
        o.id === currentOffice.id ?
        {
          ...o,
          name: formData.name,
          floor: Number(formData.floor),
          areaId: formData.areaId
        } :
        o
        )
      );
      toast.success('Office updated successfully');
    } else {
      setOffices([
      ...offices,
      {
        id: `o${Date.now()}`,
        name: formData.name,
        floor: Number(formData.floor),
        areaId: formData.areaId,
        deviceCount: 0
      }]
      );
      toast.success('Office created successfully');
    }
    setIsModalOpen(false);
  };
  const handleDeleteClick = (office: Office) => {
    setCurrentOffice(office);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = () => {
    if (currentOffice?.deviceCount && currentOffice.deviceCount > 0) {
      toast.error('Cannot delete office with assigned devices');
      setIsDeleteModalOpen(false);
      return;
    }
    setOffices(offices.filter((o) => o.id !== currentOffice?.id));
    toast.success('Office deleted successfully');
    setIsDeleteModalOpen(false);
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Offices</h1>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2">
          
          <Plus className="w-4 h-4" /> New Office
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex gap-4 items-center">
        <select
          className="input-field w-48"
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value)}>
          
          <option value="">All Areas</option>
          {mockAreas.map((a) =>
          <option key={a.id} value={a.id}>
              {a.name}
            </option>
          )}
        </select>
        <select
          className="input-field w-32"
          value={floorFilter}
          onChange={(e) => setFloorFilter(e.target.value)}>
          
          <option value="">All Floors</option>
          {allFloors.map((f) =>
          <option key={f} value={f}>
              Floor {f}
            </option>
          )}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Floor</th>
              <th className="px-6 py-3 font-medium">Area</th>
              <th className="px-6 py-3 font-medium">Devices</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOffices.map((office) => {
              const area = mockAreas.find((a) => a.id === office.areaId);
              return (
                <tr
                  key={office.id}
                  className="hover:bg-gray-50 transition-colors">
                  
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {office.name}
                  </td>
                  <td className="px-6 py-4">{office.floor}</td>
                  <td className="px-6 py-4">{area?.name}</td>
                  <td className="px-6 py-4">{office.deviceCount}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenModal(office)}
                      className="p-1.5 text-gray-500 hover:text-accent hover:bg-blue-50 rounded-md transition-colors">
                      
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(office)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                      
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>);

            })}
            {filteredOffices.length === 0 &&
            <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No offices found.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentOffice ? 'Edit Office' : 'New Office'}>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              className={`input-field ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
              value={formData.name}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  name: e.target.value
                });
                setErrors({
                  ...errors,
                  name: ''
                });
              }}
              placeholder="e.g. Oficina 101" />
            
            {errors.name &&
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            }
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Floor
            </label>
            <input
              type="number"
              min="1"
              max="99"
              className={`input-field ${errors.floor ? 'border-red-500 focus:ring-red-500' : ''}`}
              value={formData.floor}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  floor: e.target.value
                });
                setErrors({
                  ...errors,
                  floor: ''
                });
              }} />
            
            {errors.floor &&
            <p className="text-red-500 text-xs mt-1">{errors.floor}</p>
            }
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Area
            </label>
            <select
              className={`input-field ${errors.areaId ? 'border-red-500 focus:ring-red-500' : ''}`}
              value={formData.areaId}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  areaId: e.target.value
                });
                setErrors({
                  ...errors,
                  areaId: ''
                });
              }}>
              
              <option value="">Select an area...</option>
              {mockAreas.map((a) =>
              <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              )}
            </select>
            {errors.areaId &&
            <p className="text-red-500 text-xs mt-1">{errors.areaId}</p>
            }
          </div>
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <button
              className="btn-secondary"
              onClick={() => setIsModalOpen(false)}>
              
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSave}>
              Save Office
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion">
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete the office{' '}
            <strong>{currentOffice?.name}</strong>?
          </p>
          {currentOffice?.deviceCount ?
          <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
              Warning: This office has {currentOffice.deviceCount} assigned
              devices. You cannot delete it until all devices are reassigned.
            </div> :
          null}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <button
              className="btn-secondary"
              onClick={() => setIsDeleteModalOpen(false)}>
              
              Cancel
            </button>
            <button
              className="btn-danger"
              onClick={confirmDelete}
              disabled={!!currentOffice?.deviceCount}>
              
              Delete Office
            </button>
          </div>
        </div>
      </Modal>
    </div>);

}