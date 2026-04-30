import React, { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import {
  mockDevices,
  mockAreas,
  mockOffices,
  mockDeviceTypes } from
'../lib/mockData';
import { Badge } from '../components/Badge';

export function Reports() {
  const [floorFilter, setFloorFilter] = useState('');
  const [officeFilter, setOfficeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [showPreview, setShowPreview] = useState(false);

  const allFloors = Array.from(new Set(mockOffices.map((o) => o.floor))).sort();
  const filteredOfficesForSelect = floorFilter 
    ? mockOffices.filter(o => o.floor.toString() === floorFilter)
    : mockOffices;

  // Generate report data grouped by office then device type
  const reportData = mockOffices
    .filter((o) => (floorFilter ? o.floor.toString() === floorFilter : true))
    .filter((o) => (officeFilter ? o.id === officeFilter : true))
    .map((office) => {
      const officeDevices = mockDevices.filter(
        (d) =>
          d.destinationOfficeId === office.id &&
          (statusFilter === 'Todos' ? true : d.status === statusFilter)
      );
      // Group by device type
      const groupedByType = officeDevices.reduce(
        (acc, device) => {
          if (!acc[device.typeId]) acc[device.typeId] = [];
          acc[device.typeId].push(device);
          return acc;
        },
        {} as Record<string, typeof mockDevices>
      );
      return {
        office,
        groups: Object.entries(groupedByType).map(([typeId, devices]) => ({
          type: mockDeviceTypes.find((t) => t.id === typeId)!,
          devices
        }))
      };
    })
    .filter((data) => data.groups.length > 0);

  const handleExportPDF = () => {
    // Placeholder for PDF export functionality
    // Will integrate @react-pdf/renderer here when ready
    alert('Exportar a PDF - Funcionalidad en desarrollo');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-medium text-gray-900">
          Configuración del Reporte
        </h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Piso
            </label>
            <select
              className="input-field"
              value={floorFilter}
              onChange={(e) => {
                setFloorFilter(e.target.value);
                setOfficeFilter(''); // Reset office filter when floor changes
              }}
            >
              <option value="">Todos</option>
              {allFloors.map((f) => (
                <option key={f} value={f}>
                  Piso {f}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Oficina
            </label>
            <select
              className="input-field"
              value={officeFilter}
              onChange={(e) => setOfficeFilter(e.target.value)}
              disabled={!floorFilter && filteredOfficesForSelect.length > 20} // Optionally disabled if too many, but fine to leave enabled
            >
              <option value="">Todas las oficinas {floorFilter ? `del Piso ${floorFilter}` : ''}</option>
              {filteredOfficesForSelect.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <div className="flex bg-gray-100 p-1 rounded-md">
              {['Todos', 'New', 'Transfer'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`flex-1 text-sm py-1.5 rounded-sm transition-colors ${
                    statusFilter === status
                      ? 'bg-white shadow-sm text-gray-900 font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {status === 'Todos' ? 'Todos' : status === 'New' ? 'Nuevo' : 'Traslado'}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowPreview(true)}
            className="btn-primary flex items-center gap-2 h-[38px]"
          >
            <FileText className="w-4 h-4" /> Generar Vista Previa
          </button>
        </div>
      </div>

      {showPreview && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              Vista Previa del Reporte
            </h2>
            <button
              onClick={handleExportPDF}
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Exportar PDF
            </button>
          </div>

          <div className="p-8 bg-gray-50">
            <div className="bg-white p-8 shadow-sm border border-gray-200 min-h-[600px] max-w-4xl mx-auto">
              <div className="text-center mb-8 pb-6 border-b-2 border-gray-800">
                <h1 className="text-2xl font-bold uppercase tracking-wide text-gray-900">
                  Reporte de Traslado de Dispositivos
                </h1>
                <p className="text-gray-500 mt-1">
                  Generado el {new Date().toLocaleDateString('es-ES')}
                </p>
              </div>

              {reportData.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  No hay datos disponibles para los filtros seleccionados.
                </div>
              ) : (
                <div className="space-y-8">
                  {reportData.map(({ office, groups }) => (
                    <div key={office.id} className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-800 bg-gray-100 px-4 py-2 rounded-sm">
                        {office.name} (Piso {office.floor})
                      </h3>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse border border-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 border border-gray-200 font-semibold w-20 text-center">CANTIDAD</th>
                              <th className="px-4 py-3 border border-gray-200 font-semibold w-32 text-center">CÓDIGO PLANO</th>
                              <th className="px-4 py-3 border border-gray-200 font-semibold w-1/4">DESCRIPCIÓN</th>
                              <th className="px-4 py-3 border border-gray-200 font-semibold">CARACTERÍSTICAS</th>
                              <th className="px-4 py-3 border border-gray-200 font-semibold w-1/5">MARCA / MODELO</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groups.map(({ type, devices }) => (
                              <tr key={type.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50/50">
                                <td className="px-4 py-3 border border-gray-200 text-center font-bold text-gray-700">
                                  {devices.length}
                                </td>
                                <td className="px-4 py-3 border border-gray-200 text-center font-medium text-blue-600">
                                  {type.planCode}
                                </td>
                                <td className="px-4 py-3 border border-gray-200 font-medium">
                                  {type.description}
                                </td>
                                <td className="px-4 py-3 border border-gray-200">
                                  <div className="whitespace-pre-wrap text-xs text-gray-600 leading-relaxed">
                                    {type.characteristics}
                                  </div>
                                </td>
                                <td className="px-4 py-3 border border-gray-200">
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    {type.imageUrl && (
                                      <img 
                                        src={type.imageUrl} 
                                        alt={type.brandModel} 
                                        className="w-16 h-16 object-contain rounded-md border border-gray-100 bg-white p-1"
                                      />
                                    )}
                                    <span className="text-center font-medium text-sm">
                                      {type.brandModel}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-16 pt-8 border-t border-gray-200">
                <h4 className="font-bold text-gray-800 mb-4">Observaciones:</h4>
                <div className="w-full h-32 border border-gray-300 rounded-sm bg-gray-50/50"></div>
              </div>

              <div className="mt-16 flex justify-between px-12">
                <div className="text-center">
                  <div className="w-48 border-b border-gray-800 mb-2"></div>
                  <p className="text-sm font-medium text-gray-600">
                    Entregado Por
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-48 border-b border-gray-800 mb-2"></div>
                  <p className="text-sm font-medium text-gray-600">
                    Recibido Por
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}