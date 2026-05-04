import React, { useMemo, useState } from 'react';
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../components/Modal';
import { Area, Baja } from '../lib/types';
import { useAreas } from '../hooks/useAreas';
import { useBajas } from '../hooks/useBajas';

export function Bajas() {
  const { areas, loading: areasLoading } = useAreas();
  const { bajas, loading, createBaja, updateBaja, deleteBaja } = useBajas();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingBaja, setEditingBaja] = useState<Baja | null>(null);
  const [bajaToDelete, setBajaToDelete] = useState<Baja | null>(null);
  const [areaFilter, setAreaFilter] = useState('');
  const [formData, setFormData] = useState({
    areaId: '',
    inventoryCode: '',
    description: '',
    officeName: '',
    origin: '',
    reason: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredBajas = useMemo(
    () => bajas.filter((baja) => (areaFilter ? baja.areaId === areaFilter : true)),
    [bajas, areaFilter],
  );

  const resetForm = () => {
    setFormData({ areaId: '', inventoryCode: '', description: '', officeName: '', origin: '', reason: '' });
    setErrors({});
    setEditingBaja(null);
  };

  const openNewBaja = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditBaja = (baja: Baja) => {
    setEditingBaja(baja);
    setFormData({
      areaId: baja.areaId,
      inventoryCode: baja.inventoryCode,
      description: baja.description,
      officeName: baja.officeName,
      origin: baja.origin,
      reason: baja.reason,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.areaId) nextErrors.areaId = 'Área es requerida';
    if (!formData.description.trim()) nextErrors.description = 'Descripción es requerida';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      if (editingBaja) {
        await updateBaja(editingBaja.id, {
          areaId: formData.areaId,
          codigoInventario: formData.inventoryCode || undefined,
          descripcion: formData.description,
          oficinaNombre: formData.officeName || undefined,
          origen: formData.origin || undefined,
          motivo: formData.reason || undefined,
        });
        toast.success('Baja actualizada');
      } else {
        await createBaja({
          areaId: formData.areaId,
          codigoInventario: formData.inventoryCode || undefined,
          descripcion: formData.description,
          oficinaNombre: formData.officeName || undefined,
          origen: formData.origin || undefined,
          motivo: formData.reason || undefined,
        });
        toast.success('Baja creada');
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving baja', error);
      toast.error('No se pudo guardar la baja');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!bajaToDelete) return;
    try {
      await deleteBaja(bajaToDelete.id);
      toast.success('Baja eliminada');
      setIsDeleteConfirmOpen(false);
      setBajaToDelete(null);
    } catch (error) {
      console.error('Error deleting baja', error);
      toast.error('No se pudo eliminar la baja');
    }
  };

  const areaNameById = (areaId: string) => areas.find((area) => area.id === areaId)?.name || '-';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Bajas</h1>
        <button onClick={openNewBaja} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nueva Baja
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <select className="input-field w-64" value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
          <option value="">Todas las áreas</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium">Área</th>
                <th className="px-6 py-3 font-medium">Código</th>
                <th className="px-6 py-3 font-medium">Descripción</th>
                <th className="px-6 py-3 font-medium">Oficina</th>
                <th className="px-6 py-3 font-medium">Origen</th>
                <th className="px-6 py-3 font-medium">Motivo</th>
                <th className="px-6 py-3 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBajas.map((baja) => (
                <tr key={baja.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{areaNameById(baja.areaId)}</td>
                  <td className="px-6 py-4 text-gray-700">{baja.inventoryCode || '-'}</td>
                  <td className="px-6 py-4 text-gray-700">{baja.description}</td>
                  <td className="px-6 py-4 text-gray-500">{baja.officeName || '-'}</td>
                  <td className="px-6 py-4 text-gray-500">{baja.origin || '-'}</td>
                  <td className="px-6 py-4 text-gray-500">{baja.reason || '-'}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openEditBaja(baja)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Editar">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setBajaToDelete(baja); setIsDeleteConfirmOpen(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredBajas.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No hay bajas registradas aún
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }} title={editingBaja ? 'Editar Baja' : 'Nueva Baja'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Área *</label>
            <select value={formData.areaId} onChange={(e) => setFormData({ ...formData, areaId: e.target.value })} className={`input-field ${errors.areaId ? 'border-red-500' : ''}`} disabled={areasLoading}>
              <option value="">Seleccionar área...</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </select>
            {errors.areaId && <p className="text-red-500 text-sm mt-1">{errors.areaId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código de Inventario</label>
            <input type="text" value={formData.inventoryCode} onChange={(e) => setFormData({ ...formData, inventoryCode: e.target.value })} className="input-field" placeholder="Ej: BAJ-001" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`input-field min-h-[96px] ${errors.description ? 'border-red-500' : ''}`} placeholder="Descripción del bien a dar de baja" />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Oficina</label>
            <input type="text" value={formData.officeName} onChange={(e) => setFormData({ ...formData, officeName: e.target.value })} className="input-field" placeholder="Ej: Mesa de partes" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
            <input type="text" value={formData.origin} onChange={(e) => setFormData({ ...formData, origin: e.target.value })} className="input-field" placeholder="Ej: Equipo obsoleto / averiado" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
            <textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="input-field min-h-[80px]" placeholder="Motivo de la baja" />
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={handleSave} className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition">
              {editingBaja ? 'Actualizar' : 'Crear'}
            </button>
            <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-50 transition">
              Cancelar
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirmar Eliminación">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">¿Eliminar baja?</p>
              {bajaToDelete && <p className="text-sm text-red-700 mt-1">{bajaToDelete.description}</p>}
              <p className="text-sm text-red-700 mt-2">Esta acción no se puede deshacer.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleDeleteConfirm} className="flex-1 bg-red-600 text-white font-medium py-2 rounded-lg hover:bg-red-700 transition">Eliminar</button>
            <button onClick={() => setIsDeleteConfirmOpen(false)} className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-50 transition">Cancelar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}