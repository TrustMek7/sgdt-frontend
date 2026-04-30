import React, { useState } from 'react';
import { Edit, Trash2, Image as ImageIcon, Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { SidePanel } from '../components/SidePanel';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { mockDeviceTypes } from '../lib/mockData';
import { DeviceType } from '../lib/types';

export function DeviceTypes() {
  const [types, setTypes] = useState<DeviceType[]>(mockDeviceTypes);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentType, setCurrentType] = useState<DeviceType | null>(null);
  const [typeToDelete, setTypeToDelete] = useState<DeviceType | null>(null);
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
      toast.error('La descripción es requerida');
      return;
    }
    setTypes(
      types.map((t) =>
        t.id === currentType?.id
          ? {
              ...t,
              ...formData
            }
          : t
      )
    );
    toast.success('Tipo de dispositivo actualizado');
    setIsPanelOpen(false);
  };

  const handleDeleteClick = (type: DeviceType) => {
    setTypeToDelete(type);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (typeToDelete) {
      setTypes(types.filter((t) => t.id !== typeToDelete.id));
      toast.success('Tipo de dispositivo eliminado');
      setIsDeleteConfirmOpen(false);
      setTypeToDelete(null);
    }
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
          Tipos de Dispositivos (Leyenda)
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium">Imagen</th>
                <th className="px-6 py-3 font-medium">Código Plan</th>
                <th className="px-6 py-3 font-medium">Descripción</th>
                <th className="px-6 py-3 font-medium">Características</th>
                <th className="px-6 py-3 font-medium">Marca-Modelo</th>
                <th className="px-6 py-3 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {types.map((type) => {
                const status = getBadgeStatus(type.planCode);
                return (
                  <tr key={type.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-600">{type.planCode}</span>
                        {status && <Badge status={status as 'New' | 'Transfer'} />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{type.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="max-w-[200px] truncate" title={type.characteristics}>
                        {type.characteristics}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{type.brandModel}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(type)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(type)}
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
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Panel para editar */}
      <SidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title="Editar Tipo de Dispositivo">
        <div className="space-y-6 flex flex-col h-full">
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código Plan
              </label>
              <input
                type="text"
                className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
                value={currentType?.planCode || ''}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
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
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Características
              </label>
              <textarea
                className="input-field min-h-[100px] resize-y"
                value={formData.characteristics}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    characteristics: e.target.value
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca-Modelo
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
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagen de Referencia
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-500 transition-colors cursor-pointer bg-gray-50">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <span className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 hover:text-blue-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      Cargar archivo
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG hasta 2MB</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-auto">
            <button
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              onClick={() => setIsPanelOpen(false)}
            >
              Cancelar
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition" onClick={handleSave}>
              Guardar Cambios
            </button>
          </div>
        </div>
      </SidePanel>

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
              <p className="font-semibold text-red-900">¿Eliminar tipo de dispositivo?</p>
              {typeToDelete && (
                <p className="text-sm text-red-700 mt-1">
                  {typeToDelete.planCode} - {typeToDelete.description}
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