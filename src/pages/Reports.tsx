import React, { useMemo, useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image as PDFImage } from '@react-pdf/renderer';
import { Badge } from '../components/Badge';
import { useReports } from '../hooks/useReports';
import { reportService } from '../services/reportService';
import { ReportBatchFilter, ReportBatchItem } from '../lib/types';

export function Reports() {
  const [floorFilter, setFloorFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'New' | 'Transfer'>('Todos');
  const [reportConfigs, setReportConfigs] = useState<ReportBatchFilter[]>([]);
  const [batchReports, setBatchReports] = useState<ReportBatchItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { areas, offices, devices, deviceTypes, loading } = useReports();

  const allFloors = Array.from(new Set(offices.map((office) => office.floor))).sort((a, b) => a - b);

  const availableAreaIds = floorFilter
    ? new Set(offices.filter((office) => office.floor.toString() === floorFilter).map((office) => office.areaId))
    : new Set(areas.map((area) => area.id));

  const filteredAreasForSelect = areas.filter((area) => availableAreaIds.has(area.id));
  const filteredOffices = offices.filter((office) =>
    (floorFilter ? office.floor.toString() === floorFilter : true) &&
    (areaFilter ? office.areaId === areaFilter : true)
  );

  const currentFilter: ReportBatchFilter = {
    floor: floorFilter ? Number(floorFilter) : undefined,
    areaId: areaFilter || undefined,
    status: statusFilter,
  };

  const reportConfigsPreview = reportConfigs.length > 0 ? reportConfigs : [currentFilter];

  const selectedAreaName = areas.find((area) => area.id === areaFilter)?.name;

  const describeFilter = (filter: ReportBatchFilter) => {
    const parts: string[] = [];
    if (filter.floor) parts.push(`Piso ${filter.floor}`);
    if (filter.areaId) parts.push(areas.find((area) => area.id === filter.areaId)?.name || `Área ${filter.areaId}`);
    if (filter.status && filter.status !== 'Todos') parts.push(filter.status === 'New' ? 'Nuevos' : 'Traslados');
    return parts.length > 0 ? parts.join(' / ') : 'Reporte general';
  };

  const addReportConfig = () => {
    if (!floorFilter && !areaFilter && statusFilter === 'Todos') {
      return;
    }

    setReportConfigs((current) => [
      ...current,
      {
        floor: floorFilter ? Number(floorFilter) : undefined,
        areaId: areaFilter || undefined,
        status: statusFilter,
        title: describeFilter(currentFilter),
      },
    ]);
    setShowPreview(false);
  };

  const removeReportConfig = (index: number) => {
    setReportConfigs((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const generatePreview = async () => {
    try {
      setIsGenerating(true);
      const filters = reportConfigs.length > 0 ? reportConfigs : [{ ...currentFilter, title: describeFilter(currentFilter) }];
      const response = await reportService.batch(filters);
      setBatchReports(response.reports || []);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating batch reports', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const buildReportData = (report: ReportBatchItem) => {
    const filteredAreasForSelectLocal = report.areas;
    const filteredOfficesLocal = report.offices;

    const reportData = filteredAreasForSelectLocal
      .filter((area) => true)
      .map((area) => {
        const areaOfficeIds = filteredOfficesLocal.filter((office) => office.areaId === area.id).map((office) => office.id);
        const areaDevices = report.devices.filter((device) =>
          areaOfficeIds.includes(device.destinationOfficeId) &&
          true,
        );

        const groupedByType = areaDevices.reduce((acc, device) => {
          if (!acc[device.typeId]) acc[device.typeId] = [];
          acc[device.typeId].push(device);
          return acc;
        }, {} as Record<string, typeof report.devices>);

        return {
          area,
          groups: Object.entries(groupedByType).map(([typeId, groupDevices]) => ({
            type: report.deviceTypes.find((type) => type.id === typeId)!,
            devices: groupDevices,
          })),
        };
      })
      .filter((entry) => entry.groups.length > 0);

    const summaryData = {
      newTotal: report.totals.newDevices,
      transferTotal: report.totals.transferDevices,
      newItems: report.deviceTypes
        .map((type) => ({
          planCode: type.planCode,
          description: type.description,
          count: report.devices.filter((device) => device.typeId === type.id && device.status === 'New').length,
        }))
        .filter((item) => item.count > 0)
        .sort((a, b) => a.planCode.localeCompare(b.planCode)),
      transferItems: report.deviceTypes
        .map((type) => ({
          planCode: type.planCode,
          description: type.description,
          count: report.devices.filter((device) => device.typeId === type.id && device.status === 'Transfer').length,
        }))
        .filter((item) => item.count > 0)
        .sort((a, b) => a.planCode.localeCompare(b.planCode)),
    };

    return { reportData, summaryData };
  };

  const reportData = filteredAreasForSelect
    .filter((area) => (areaFilter ? area.id === areaFilter : true))
    .map((area) => {
      const areaOfficeIds = filteredOffices.filter((office) => office.areaId === area.id).map((office) => office.id);
      const areaDevices = devices.filter((device) =>
        areaOfficeIds.includes(device.destinationOfficeId) &&
        (statusFilter === 'Todos' ? true : device.status === statusFilter)
      );

      const groupedByType = areaDevices.reduce((acc, device) => {
        if (!acc[device.typeId]) acc[device.typeId] = [];
        acc[device.typeId].push(device);
        return acc;
      }, {} as Record<string, typeof devices>);

      return {
        area,
        groups: Object.entries(groupedByType).map(([typeId, groupDevices]) => ({
          type: deviceTypes.find((type) => type.id === typeId)!,
          devices: groupDevices,
        })),
      };
    })
    .filter((entry) => entry.groups.length > 0);

  const summaryData = useMemo(() => {
    let newTotal = 0;
    let transferTotal = 0;
    const newCounts: Record<string, { planCode: string; description: string; count: number }> = {};
    const transferCounts: Record<string, { planCode: string; description: string; count: number }> = {};

    reportData.forEach(({ groups }) => {
      groups.forEach(({ type, devices }) => {
        devices.forEach((device) => {
          if (device.status === 'New') {
            newTotal += 1;
            if (!newCounts[type.id]) {
              newCounts[type.id] = { planCode: type.planCode, description: type.description, count: 0 };
            }
            newCounts[type.id].count += 1;
          }

          if (device.status === 'Transfer') {
            transferTotal += 1;
            if (!transferCounts[type.id]) {
              transferCounts[type.id] = { planCode: type.planCode, description: type.description, count: 0 };
            }
            transferCounts[type.id].count += 1;
          }
        });
      });
    });

    return {
      newTotal,
      transferTotal,
      newItems: Object.values(newCounts).sort((a, b) => a.planCode.localeCompare(b.planCode)),
      transferItems: Object.values(transferCounts).sort((a, b) => a.planCode.localeCompare(b.planCode)),
    };
  }, [reportData]);

  const pdfStyles = StyleSheet.create({
    page: { padding: 30, fontSize: 10, fontFamily: 'Helvetica' },
    header: { borderBottom: '1pt solid #000', paddingBottom: 10, marginBottom: 20, textAlign: 'center' },
    title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    subtitle: { fontSize: 11, marginBottom: 4 },
    date: { color: '#666' },
    summaryBox: { border: '1pt solid #ddd', padding: 10, marginBottom: 20 },
    summaryTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
    officeName: { fontSize: 13, fontWeight: 'bold', backgroundColor: '#eee', padding: 5, marginTop: 10, marginBottom: 10 },
    table: { width: '100%', border: '1pt solid #ccc', marginBottom: 15 },
    tableRow: { flexDirection: 'row', alignItems: 'stretch', borderBottom: '1pt solid #eee' },
    tableHeaderRow: { backgroundColor: '#f0f0f0' },
    cell: {
      flexShrink: 1,
      flexGrow: 0,
      minWidth: 0,
      paddingHorizontal: 5,
      paddingVertical: 4,
      borderRight: '1pt solid #eee',
      justifyContent: 'flex-start',
    },
    cellText: {
      fontSize: 9,
      lineHeight: 1.25,
      flexShrink: 1,
      flexGrow: 1,
      minWidth: 0,
    },
    headerText: {
      fontWeight: 'bold',
      fontSize: 9,
      flexShrink: 1,
      flexGrow: 1,
      minWidth: 0,
    },
    centerCell: { justifyContent: 'center', alignItems: 'center' },
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
    signText: { textAlign: 'center' },
  });

  const ReportPDF = () => (
    <Document>
      {batchReports.map((report, reportIndex) => {
        const { reportData, summaryData } = buildReportData(report);

        return (
          <Page key={`${report.title}-${reportIndex}`} size="A4" style={pdfStyles.page} orientation="landscape">
            <View style={pdfStyles.header}>
              <Text style={pdfStyles.title}>Reporte de Traslado de Dispositivos</Text>
              <Text style={pdfStyles.subtitle}>{report.title}</Text>
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
                    {summaryData.newItems.map((item, index) => (
                      <Text key={index} style={{ marginLeft: 10, marginBottom: 2 }}>
                        {item.count} {item.planCode} - {item.description}
                      </Text>
                    ))}
                  </View>
                )}

                {summaryData.transferTotal > 0 && (
                  <View>
                    <Text style={{ fontWeight: 'bold', marginBottom: 3 }}>
                      {String(summaryData.transferTotal).padStart(2, '0')} TRASLADOS
                    </Text>
                    {summaryData.transferItems.map((item, index) => (
                      <Text key={index} style={{ marginLeft: 10, marginBottom: 2 }}>
                        {item.count} {item.planCode} - {item.description}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            )}

            {reportData.map(({ area, groups }) => (
              <View key={area.id}>
                <Text style={pdfStyles.officeName}>{area.name}</Text>
                <View style={pdfStyles.table}>
                  <View style={[pdfStyles.tableRow, pdfStyles.tableHeaderRow]}>
                    <View style={[pdfStyles.cell, pdfStyles.colInv]}>
                      <Text style={pdfStyles.headerText}>INVENTARIO</Text>
                    </View>
                    <View style={[pdfStyles.cell, pdfStyles.colPlan]}>
                      <Text style={pdfStyles.headerText}>PLAN</Text>
                    </View>
                    <View style={[pdfStyles.cell, pdfStyles.colDesc]}>
                      <Text style={pdfStyles.headerText}>DESCRIPCIÓN</Text>
                    </View>
                    <View style={[pdfStyles.cell, pdfStyles.colChar]}>
                      <Text style={pdfStyles.headerText}>CARACTERÍSTICAS</Text>
                    </View>
                    <View style={[pdfStyles.cell, pdfStyles.colBrand]}>
                      <Text style={pdfStyles.headerText}>MARCA / MODELO</Text>
                    </View>
                    <View style={[pdfStyles.cell, pdfStyles.colImg, pdfStyles.centerCell]}>
                      <Text style={pdfStyles.headerText}>IMAGEN</Text>
                    </View>
                  </View>

                  {groups.map(({ type, devices: groupDevices }) =>
                    groupDevices.map((device) => (
                      <View key={device.id} style={pdfStyles.tableRow}>
                        <View style={[pdfStyles.cell, pdfStyles.colInv]}>
                          <Text style={pdfStyles.cellText}>{device.inventoryCode || 'S/C'}</Text>
                        </View>
                        <View style={[pdfStyles.cell, pdfStyles.colPlan]}>
                          <Text style={pdfStyles.cellText}>{type.planCode}</Text>
                        </View>
                        <View style={[pdfStyles.cell, pdfStyles.colDesc]}>
                          <Text style={pdfStyles.cellText}>{type.description}</Text>
                        </View>
                        <View style={[pdfStyles.cell, pdfStyles.colChar]}>
                          <Text style={pdfStyles.cellText}>{type.characteristics}</Text>
                        </View>
                        <View style={[pdfStyles.cell, pdfStyles.colBrand]}>
                          <Text style={[pdfStyles.cellText, { textAlign: 'center' }]}>{type.brandModel}</Text>
                        </View>
                        <View style={[pdfStyles.cell, pdfStyles.colImg, pdfStyles.centerCell]}>
                          {type.imageUrl ? (
                            <PDFImage src={type.imageUrl} style={{ width: 35, height: 35 }} />
                          ) : (
                            <Text style={pdfStyles.cellText}>-</Text>
                          )}
                        </View>
                      </View>
                    )),
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
        );
      })}
    </Document>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Configuración del Reporte</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">Piso</label>
            <select
              className="input-field"
              value={floorFilter}
              onChange={(e) => {
                setFloorFilter(e.target.value);
                setAreaFilter('');
              }}
            >
              <option value="">Todos</option>
              {allFloors.map((floor) => (
                <option key={floor} value={floor}>
                  Piso {floor}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
            <select
              className="input-field"
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              disabled={!floorFilter && filteredAreasForSelect.length > 20}
            >
              <option value="">Todas las áreas {floorFilter ? `del Piso ${floorFilter}` : ''}</option>
              {filteredAreasForSelect.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <div className="flex bg-gray-100 p-1 rounded-md">
              {(['Todos', 'New', 'Transfer'] as const).map((status) => (
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
          <button onClick={addReportConfig} className="btn-secondary flex items-center gap-2 h-[38px]">
            <FileText className="w-4 h-4" /> Agregar reporte
          </button>
          <button onClick={generatePreview} disabled={isGenerating} className="btn-primary flex items-center gap-2 h-[38px]">
            <Download className="w-4 h-4" /> {isGenerating ? 'Generando...' : 'Generar PDF'}
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="text-sm font-medium text-gray-700">Reportes en cola</div>
          <div className="flex flex-wrap gap-2">
            {reportConfigs.length === 0 ? (
              <span className="text-sm text-gray-500">Todavía no agregas reportes. Se usará la configuración actual si generas el PDF ahora.</span>
            ) : (
              reportConfigs.map((config, index) => (
                <div key={`${config.title || 'report'}-${index}`} className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 text-sm text-gray-700">
                  <span>{describeFilter(config)}</span>
                  <button type="button" onClick={() => removeReportConfig(index)} className="text-red-600 font-semibold">
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
          <p className="text-xs text-gray-500">
            Si agregas varios reportes, el PDF saldrá en páginas separadas, cada una con sus propias observaciones.
          </p>
        </div>
      </div>

      {showPreview && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Vista previa del PDF</h2>
              <p className="text-sm text-gray-500">{reportConfigsPreview.length} reporte(s) listos para exportar</p>
            </div>
            {batchReports.length > 0 && (
              <PDFDownloadLink
                document={<ReportPDF />}
                fileName={`Reporte_Traslado_${reportConfigsPreview.length > 1 ? 'Multiples' : selectedAreaName?.replace(/\s+/g, '_') || 'General'}.pdf`}
              >
                {({ loading: pdfLoading }) => (
                  <button
                    disabled={pdfLoading}
                    className={`btn-secondary flex items-center gap-2 ${pdfLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Download className="w-4 h-4" /> {pdfLoading ? 'Preparando...' : 'Exportar PDF'}
                  </button>
                )}
              </PDFDownloadLink>
            )}
          </div>

          <div className="p-8 bg-gray-50">
            {isGenerating ? (
              <div className="text-center text-gray-500 py-12">Generando reportes...</div>
            ) : batchReports.length === 0 ? (
              <div className="bg-white p-8 shadow-sm border border-gray-200 min-h-[180px] max-w-4xl mx-auto text-center text-gray-500">
                Todavía no se cargaron reportes en el lote. Agrega filtros y genera el PDF.
              </div>
            ) : (
              <div className="space-y-4 max-w-4xl mx-auto">
                {batchReports.map((report, index) => (
                  <div key={`${report.title}-${index}`} className="bg-white p-6 shadow-sm border border-gray-200 rounded-sm">
                    <h3 className="text-lg font-bold text-gray-800">{report.title}</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {report.totals.devices} dispositivo(s) | {report.totals.newDevices} nuevos | {report.totals.transferDevices} traslados
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {report.areas.map((area) => (
                        <span key={area.id} className="px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700">
                          {area.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!showPreview && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center text-gray-500">
          Selecciona filtros, agrégalos al lote y genera un PDF con reportes separados por página.
        </div>
      )}
    </div>
  );
}
