import React, { useState, useMemo } from 'react';
import { FileText, Download } from 'lucide-react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image as PDFImage } from '@react-pdf/renderer';
import {
  mockDevices,
  mockAreas,
  mockOffices,
  mockDeviceTypes } from
'../lib/mockData';
import { Badge } from '../components/Badge';

export function Reports() {
  const [floorFilter, setFloorFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [showPreview, setShowPreview] = useState(false);

  const allFloors = Array.from(new Set(mockOffices.map((o) => o.floor))).sort();
  
  const availableAreaIds = floorFilter 
    ? new Set(mockOffices.filter(o => o.floor.toString() === floorFilter).map(o => o.areaId))
    : new Set(mockAreas.map(a => a.id));

  const filteredAreasForSelect = mockAreas.filter(a => availableAreaIds.has(a.id));

  // Find offices based on floor/area
  const filteredOffices = mockOffices.filter(o => 
    (floorFilter ? o.floor.toString() === floorFilter : true) &&
    (areaFilter ? o.areaId === areaFilter : true)
  );

  // Generate report data grouped by area then device type
  const reportData = mockAreas
    .filter((a) => (areaFilter ? a.id === areaFilter : true))
    .filter((a) => availableAreaIds.has(a.id)) // Only show areas present in the selected floor
    .map((area) => {
      const areaOffices = filteredOffices.filter(o => o.areaId === area.id);
      const officeIds = areaOffices.map(o => o.id);
      
      const areaDevices = mockDevices.filter(
        (d) =>
          officeIds.includes(d.destinationOfficeId) &&
          (statusFilter === 'Todos' ? true : d.status === statusFilter)
      );
      // Group by device type
      const groupedByType = areaDevices.reduce(
        (acc, device) => {
          if (!acc[device.typeId]) acc[device.typeId] = [];
          acc[device.typeId].push(device);
          return acc;
        },
        {} as Record<string, typeof mockDevices>
      );
      return {
        area,
        groups: Object.entries(groupedByType).map(([typeId, devices]) => ({
          type: mockDeviceTypes.find((t) => t.id === typeId)!,
          devices
        }))
      };
    })
    .filter((data) => data.groups.length > 0);

  const summaryData = useMemo(() => {
    let newTotal = 0;
    let transferTotal = 0;
    const newCounts: Record<string, { planCode: string; description: string; count: number }> = {};
    const transferCounts: Record<string, { planCode: string; description: string; count: number }> = {};
    
    reportData.forEach(({ groups }) => {
      groups.forEach(({ type, devices }) => {
        devices.forEach((d: any) => {
          if (d.status === 'New') {
            newTotal++;
            if (!newCounts[type.id]) {
              newCounts[type.id] = { planCode: type.planCode, description: type.description, count: 0 };
            }
            newCounts[type.id].count++;
          }
          if (d.status === 'Transfer') {
            transferTotal++;
            if (!transferCounts[type.id]) {
              transferCounts[type.id] = { planCode: type.planCode, description: type.description, count: 0 };
            }
            transferCounts[type.id].count++;
          }
        });
      });
    });

    return {
      newTotal,
      transferTotal,
      newItems: Object.values(newCounts).sort((a,b) => a.planCode.localeCompare(b.planCode)),
      transferItems: Object.values(transferCounts).sort((a,b) => a.planCode.localeCompare(b.planCode))
    };
  }, [reportData]);

  const pdfStyles = StyleSheet.create({
    page: { padding: 30, fontSize: 10, fontFamily: 'Helvetica' },
    header: { borderBottom: '1pt solid #000', paddingBottom: 10, marginBottom: 20, textAlign: 'center' },
    title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    date: { color: '#666' },
    summaryBox: { border: '1pt solid #ddd', padding: 10, marginBottom: 20 },
    summaryTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
    officeName: { fontSize: 13, fontWeight: 'bold', backgroundColor: '#eee', padding: 5, marginTop: 10, marginBottom: 10 },
    table: { width: '100%', border: '1pt solid #ccc', marginBottom: 15 },
    tableRow: { flexDirection: 'row', borderBottom: '1pt solid #eee', minHeight: 30 },
    th: { backgroundColor: '#fafafa', padding: 5, fontWeight: 'bold', borderRight: '1pt solid #eee' },
    td: { padding: 5, borderRight: '1pt solid #eee' },
    colInv: { width: '15%' },
    colPlan: { width: '15%' },
    colDesc: { width: '20%' },
    colChar: { width: '20%' },
    colBrand: { width: '15%' },
    colImg: { width: '15%', borderRight: 0 },
    observation: { marginTop: 30, borderTop: '1pt solid #ccc', paddingTop: 10 },
    obsBox: { height: 60, border: '1pt solid #ccc', marginTop: 10 },
    signatures: { marginTop: 50, flexDirection: 'row', justifyContent: 'space-around' },
    signLine: { borderBottom: '1pt solid #000', width: 150, marginBottom: 5 },
    signText: { textAlign: 'center' }
  });

  const ReportPDF = () => (
    <Document>
      <Page size="A4" style={pdfStyles.page} orientation="landscape">
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>Reporte de Traslado de Dispositivos</Text>
          <Text style={pdfStyles.date}>Generado el {new Date().toLocaleDateString('es-ES')}</Text>
        </View>

        {(summaryData.newTotal > 0 || summaryData.transferTotal > 0) && (
          <View style={pdfStyles.summaryBox}>
            <Text style={pdfStyles.summaryTitle}>Resumen General de Dispositivos</Text>
            
            {summaryData.newTotal > 0 && (
              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 3 }}>
                  {String(summaryData.newTotal).padStart(2, '0')} NUEVOS
                </Text>
                {summaryData.newItems.map((item: any, idx: number) => (
                  <Text key={idx} style={{ marginLeft: 10, marginBottom: 2 }}>{item.count} {item.planCode} - {item.description}</Text>
                ))}
              </View>
            )}

            {summaryData.transferTotal > 0 && (
              <View>
                <Text style={{ fontWeight: 'bold', marginBottom: 3 }}>
                  {String(summaryData.transferTotal).padStart(2, '0')} TRASLADOS
                </Text>
                {summaryData.transferItems.map((item: any, idx: number) => (
                  <Text key={idx} style={{ marginLeft: 10, marginBottom: 2 }}>{item.count} {item.planCode} - {item.description}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {reportData.map(({ area, groups }) => (
          <View key={area.id} wrap={false}>
            <Text style={pdfStyles.officeName}>{area.name}</Text>
            <View style={pdfStyles.table}>
              <View style={[pdfStyles.tableRow, { backgroundColor: '#f0f0f0' }]}>
                <Text style={[pdfStyles.th, pdfStyles.colInv]}>INVENTARIO</Text>
                <Text style={[pdfStyles.th, pdfStyles.colPlan]}>PLAN</Text>
                <Text style={[pdfStyles.th, pdfStyles.colDesc]}>DESCRIPCIÓN</Text>
                <Text style={[pdfStyles.th, pdfStyles.colChar]}>CARACTERÍSTICAS</Text>
                <Text style={[pdfStyles.th, pdfStyles.colBrand]}>MARCA / MODELO</Text>
                <Text style={[pdfStyles.th, pdfStyles.colImg]}>IMAGEN</Text>
              </View>

              {groups.map(({ type, devices }) => 
                devices.map((device: any) => (
                  <View key={device.id} style={pdfStyles.tableRow}>
                    <Text style={[pdfStyles.td, pdfStyles.colInv]}>{device.inventoryCode || 'S/C'}</Text>
                    <Text style={[pdfStyles.td, pdfStyles.colPlan]}>{type.planCode}</Text>
                    <Text style={[pdfStyles.td, pdfStyles.colDesc]}>{type.description}</Text>
                    <Text style={[pdfStyles.td, pdfStyles.colChar]}>{type.characteristics}</Text>
                    <Text style={[pdfStyles.td, pdfStyles.colBrand, { textAlign: 'center' }]}>{type.brandModel}</Text>
                    <View style={[pdfStyles.td, pdfStyles.colImg, { justifyContent: 'center', alignItems: 'center' }]}>
                      {type.imageUrl && <PDFImage src={type.imageUrl} style={{ width: 35, height: 35, alignSelf: 'center', marginBottom: 2 }} />}
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        ))}

        <View style={pdfStyles.observation} wrap={false}>
          <Text>Observaciones:</Text>
          <View style={pdfStyles.obsBox} />
        </View>

        <View style={pdfStyles.signatures} wrap={false}>
          <View>
            <View style={pdfStyles.signLine} />
            <Text style={pdfStyles.signText}>Entregado Por</Text>
          </View>
          <View>
            <View style={pdfStyles.signLine} />
            <Text style={pdfStyles.signText}>Recibido Por</Text>
          </View>
        </View>
      </Page>
    </Document>
  );

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
                setAreaFilter(''); // Reset area filter when floor changes
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
              Área
            </label>
            <select
              className="input-field"
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              disabled={!floorFilter && filteredAreasForSelect.length > 20}
            >
              <option value="">Todas las áreas {floorFilter ? `del Piso ${floorFilter}` : ''}</option>
              {filteredAreasForSelect.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
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
            <PDFDownloadLink 
              document={<ReportPDF />} 
              fileName={
                areaFilter 
                  ? `Reporte_Traslado_${mockAreas.find(a => a.id === areaFilter)?.name.replace(/\s+/g, '_') || 'Area'}.pdf` 
                  : 'Reporte_Traslado_General.pdf'
              }
            >
              {({ loading }) => (
                <button
                  disabled={loading}
                  className={`btn-secondary flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Download className="w-4 h-4" /> {loading ? 'Preparando...' : 'Exportar PDF'}
                </button>
              )}
            </PDFDownloadLink>
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

              {(summaryData.newTotal > 0 || summaryData.transferTotal > 0) && (
                <div className="mb-8 border border-gray-200 rounded-sm p-6 bg-gray-50/50">
                  <h4 className="font-bold text-base text-gray-800 mb-4 border-b border-gray-200 pb-2">
                    Resumen General de Dispositivos
                  </h4>
                  <div className="flex flex-col md:flex-row gap-12">
                    {summaryData.newTotal > 0 && (
                      <div className="flex-1">
                        <h5 className="font-bold text-blue-700 text-sm mb-3">
                          {String(summaryData.newTotal).padStart(2, '0')} NUEVO{summaryData.newTotal !== 1 ? 'S' : ''}
                        </h5>
                        <ul className="space-y-2 text-sm text-gray-700">
                          {summaryData.newItems.map((item: any, idx: number) => (
                            <li key={idx} className="flex gap-3 items-start">
                              <span className="font-semibold px-2 py-0.5 bg-white border border-gray-200 rounded-sm min-w-[2rem] text-center">
                                {item.count}
                              </span>
                              <span className="pt-0.5">{item.planCode} - {item.description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {summaryData.transferTotal > 0 && (
                      <div className="flex-1">
                        <h5 className="font-bold text-orange-600 text-sm mb-3">
                          {String(summaryData.transferTotal).padStart(2, '0')} TRASLADO{summaryData.transferTotal !== 1 ? 'S' : ''}
                        </h5>
                        <ul className="space-y-2 text-sm text-gray-700">
                          {summaryData.transferItems.map((item: any, idx: number) => (
                            <li key={idx} className="flex gap-3 items-start">
                              <span className="font-semibold px-2 py-0.5 bg-white border border-gray-200 rounded-sm min-w-[2rem] text-center">
                                {item.count}
                              </span>
                              <span className="pt-0.5">{item.planCode} - {item.description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {reportData.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  No hay datos disponibles para los filtros seleccionados.
                </div>
              ) : (
                <div className="space-y-8">
                  {reportData.map(({ area, groups }) => (
                    <div key={area.id} className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-800 bg-gray-100 px-4 py-2 rounded-sm">
                        {area.name}
                      </h3>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse border border-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 border border-gray-200 font-semibold w-24 text-center">INVENTARIO</th>
                              <th className="px-4 py-3 border border-gray-200 font-semibold w-28 text-center">CÓDIGO PLANO</th>
                              <th className="px-4 py-3 border border-gray-200 font-semibold w-1/4">DESCRIPCIÓN</th>
                              <th className="px-4 py-3 border border-gray-200 font-semibold">CARACTERÍSTICAS</th>
                              <th className="px-4 py-3 border border-gray-200 font-semibold text-center">MARCA / MODELO</th>
                              <th className="px-4 py-3 border border-gray-200 font-semibold w-24 text-center">IMAGEN</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groups.map(({ type, devices }) =>
                              devices.map((device: any) => (
                                <tr key={device.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50/50">
                                  <td className="px-4 py-3 border border-gray-200 text-center font-medium text-gray-700">
                                    {device.inventoryCode || <span className="text-gray-400 italic">S/C</span>}
                                  </td>
                                  <td className="px-4 py-3 border border-gray-200 text-center font-bold text-blue-600">
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
                                  <td className="px-4 py-3 border border-gray-200 text-center font-medium text-sm">
                                    {type.brandModel}
                                  </td>
                                  <td className="px-4 py-3 border border-gray-200">
                                    <div className="flex justify-center">
                                      {type.imageUrl ? (
                                        <img 
                                          src={type.imageUrl} 
                                          alt={type.brandModel} 
                                          className="w-12 h-12 object-contain rounded-md border border-gray-100 bg-white p-1"
                                        />
                                      ) : (
                                        <span className="text-gray-300">-</span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
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