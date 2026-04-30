import React, { useState } from 'react';
import { Pencil, Image as ImageIcon, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { SidePanel } from '../components/SidePanel';
import { Badge } from '../components/Badge';
import { mockDeviceTypes } from '../lib/mockData';
import { DeviceType } from '../lib/types';
export function DeviceTypes() {
  const [types, setTypes] = useState<DeviceType[]>(mockDeviceTypes);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentType, setCurrentType] = useState<DeviceType | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    characteristics: '',
    brandModel: ''
  });
  const handleEdit = (type: DeviceType) => {
    setCurrentType(type);
    setFormData({
      description: type.description,
      characteristics: type.characteristics,
      brandModel: type.brandModel
    });
    setIsPanelOpen(true);
  };
  const handleSave = () => {
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    setTypes(
      types.map((t) =>
      t.id === currentType?.id ?
      {
        ...t,
        ...formData
      } :
      t
      )
    );
    toast.success('Device type updated successfully');
    setIsPanelOpen(false);
  };
  const getBadgeStatus = (planCode: string) => {
    if (planCode.startsWith('Ex')) return 'Transfer';
    if (planCode.startsWith('E')) return 'New';
    return null;
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Device Types (Leyenda)
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium">Image</th>
              <th className="px-6 py-3 font-medium">Plan Code</th>
              <th className="px-6 py-3 font-medium">Description</th>
              <th className="px-6 py-3 font-medium">Characteristics</th>
              <th className="px-6 py-3 font-medium">Brand-Model</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {types.map((type) => {
              const status = getBadgeStatus(type.planCode);
              return (
                <tr
                  key={type.id}
                  className="hover:bg-gray-50 transition-colors">
                  
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {type.planCode}
                      {status &&
                      <Badge status={status as 'New' | 'Transfer'} />
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4">{type.description}</td>
                  <td className="px-6 py-4">
                    <div
                      className="max-w-[200px] truncate"
                      title={type.characteristics}>
                      
                      {type.characteristics}
                    </div>
                  </td>
                  <td className="px-6 py-4">{type.brandModel}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEdit(type)}
                      className="p-1.5 text-gray-500 hover:text-accent hover:bg-blue-50 rounded-md transition-colors">
                      
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>);

            })}
          </tbody>
        </table>
      </div>

      <SidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        title="Edit Device Type">
        
        <div className="space-y-6 flex flex-col h-full">
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan Code
              </label>
              <input
                type="text"
                className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
                value={currentType?.planCode || ''}
                readOnly />
              
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                className="input-field"
                value={formData.description}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value
                })
                } />
              
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Characteristics
              </label>
              <textarea
                className="input-field min-h-[100px] resize-y"
                value={formData.characteristics}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  characteristics: e.target.value
                })
                } />
              
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand-Model
              </label>
              <input
                type="text"
                className="input-field"
                value={formData.brandModel}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  brandModel: e.target.value
                })
                } />
              
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-accent transition-colors cursor-pointer bg-gray-50">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <span className="relative cursor-pointer bg-transparent rounded-md font-medium text-accent hover:text-accent-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-accent">
                      Upload a file
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-auto">
            <button
              className="btn-secondary"
              onClick={() => setIsPanelOpen(false)}>
              
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </SidePanel>
    </div>);

}