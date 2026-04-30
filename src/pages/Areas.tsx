import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../components/Modal';
import { mockAreas } from '../lib/mockData';
import { Area } from '../lib/types';
export function Areas() {
  const [areas, setAreas] = useState<Area[]>(mockAreas);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentArea, setCurrentArea] = useState<Area | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const handleOpenModal = (area?: Area) => {
    if (area) {
      setCurrentArea(area);
      setName(area.name);
    } else {
      setCurrentArea(null);
      setName('');
    }
    setError('');
    setIsModalOpen(true);
  };
  const handleSave = () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (currentArea) {
      setAreas(
        areas.map((a) =>
        a.id === currentArea.id ?
        {
          ...a,
          name
        } :
        a
        )
      );
      toast.success('Area updated successfully');
    } else {
      setAreas([
      ...areas,
      {
        id: `a${Date.now()}`,
        name,
        officeCount: 0
      }]
      );
      toast.success('Area created successfully');
    }
    setIsModalOpen(false);
  };
  const handleDeleteClick = (area: Area) => {
    setCurrentArea(area);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = () => {
    if (currentArea?.officeCount && currentArea.officeCount > 0) {
      toast.error('Cannot delete area with assigned offices');
      setIsDeleteModalOpen(false);
      return;
    }
    setAreas(areas.filter((a) => a.id !== currentArea?.id));
    toast.success('Area deleted successfully');
    setIsDeleteModalOpen(false);
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Areas</h1>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2">
          
          <Plus className="w-4 h-4" /> New Area
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Number of Offices</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {areas.map((area) =>
            <tr key={area.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {area.name}
                </td>
                <td className="px-6 py-4">{area.officeCount}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                  onClick={() => handleOpenModal(area)}
                  className="p-1.5 text-gray-500 hover:text-accent hover:bg-blue-50 rounded-md transition-colors">
                  
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                  onClick={() => handleDeleteClick(area)}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                  
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            )}
            {areas.length === 0 &&
            <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  No areas found.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentArea ? 'Edit Area' : 'New Area'}>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              className={`input-field ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g. Recursos Humanos" />
            
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <button
              className="btn-secondary"
              onClick={() => setIsModalOpen(false)}>
              
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSave}>
              Save Area
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
            Are you sure you want to delete the area{' '}
            <strong>{currentArea?.name}</strong>?
          </p>
          {currentArea?.officeCount ?
          <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
              Warning: This area has {currentArea.officeCount} assigned offices.
              You cannot delete it until all offices are reassigned or deleted.
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
              disabled={!!currentArea?.officeCount}>
              
              Delete Area
            </button>
          </div>
        </div>
      </Modal>
    </div>);

}