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
  const [areaFilter, setAreaFilter] = useState('');
  const [floorFilter, setFloorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showPreview, setShowPreview] = useState(false);
  const allFloors = Array.from(new Set(mockOffices.map((o) => o.floor))).sort();
  // Generate report data grouped by office then device type
  const reportData = mockOffices.
  filter((o) => areaFilter ? o.areaId === areaFilter : true).
  filter((o) => floorFilter ? o.floor.toString() === floorFilter : true).
  map((office) => {
    const officeDevices = mockDevices.filter(
      (d) =>
      d.destinationOfficeId === office.id && (
      statusFilter === 'All' ? true : d.status === statusFilter)
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
  }).
  filter((data) => data.groups.length > 0);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-medium text-gray-900">
          Report Configuration
        </h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Area
            </label>
            <select
              className="input-field"
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}>
              
              <option value="">All Areas</option>
              {mockAreas.map((a) =>
              <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              )}
            </select>
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Floor
            </label>
            <select
              className="input-field"
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}>
              
              <option value="">All</option>
              {allFloors.map((f) =>
              <option key={f} value={f}>
                  Floor {f}
                </option>
              )}
            </select>
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="flex bg-gray-100 p-1 rounded-md">
              {['All', 'New', 'Transfer'].map((status) =>
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-1 text-sm py-1.5 rounded-sm transition-colors ${statusFilter === status ? 'bg-white shadow-sm text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'}`}>
                
                  {status}
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowPreview(true)}
            className="btn-primary flex items-center gap-2 h-[38px]">
            
            <FileText className="w-4 h-4" /> Generate Preview
          </button>
        </div>
      </div>

      {showPreview &&
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              Report Preview
            </h2>
            <button className="btn-secondary flex items-center gap-2">
              <Download className="w-4 h-4" /> Export PDF
            </button>
          </div>

          <div className="p-8 bg-gray-50">
            <div className="bg-white p-8 shadow-sm border border-gray-200 min-h-[600px] max-w-4xl mx-auto">
              <div className="text-center mb-8 pb-6 border-b-2 border-gray-800">
                <h1 className="text-2xl font-bold uppercase tracking-wide text-gray-900">
                  Device Transfer Report
                </h1>
                <p className="text-gray-500 mt-1">
                  Generated on {new Date().toLocaleDateString()}
                </p>
              </div>

              {reportData.length === 0 ?
            <div className="text-center text-gray-500 py-12">
                  No data available for the selected filters.
                </div> :

            <div className="space-y-8">
                  {reportData.map(({ office, groups }) =>
              <div key={office.id} className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-800 bg-gray-100 px-4 py-2 rounded-sm">
                        {office.name} (Floor {office.floor})
                      </h3>

                      {groups.map(({ type, devices }) =>
                <div key={type.id} className="ml-4 space-y-2">
                          <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                            {type.planCode} - {type.description}
                            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              {devices.length} items
                            </span>
                          </h4>
                          <table className="w-full text-sm text-left border border-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 border-b border-gray-200 w-1/3">
                                  Inventory Code
                                </th>
                                <th className="px-4 py-2 border-b border-gray-200 w-1/3">
                                  Status
                                </th>
                                <th className="px-4 py-2 border-b border-gray-200 w-1/3">
                                  Origin
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {devices.map((device) => {
                        const origin = mockOffices.find(
                          (o) => o.id === device.originOfficeId
                        );
                        return (
                          <tr
                            key={device.id}
                            className="border-b border-gray-100 last:border-0">
                            
                                    <td className="px-4 py-2 font-medium">
                                      {device.inventoryCode || 'N/A'}
                                    </td>
                                    <td className="px-4 py-2">
                                      <Badge status={device.status} />
                                    </td>
                                    <td className="px-4 py-2 text-gray-500">
                                      {origin?.name || '-'}
                                    </td>
                                  </tr>);

                      })}
                            </tbody>
                          </table>
                        </div>
                )}
                    </div>
              )}
                </div>
            }

              <div className="mt-16 pt-8 border-t border-gray-200">
                <h4 className="font-bold text-gray-800 mb-4">Observations:</h4>
                <div className="w-full h-32 border border-gray-300 rounded-sm bg-gray-50/50"></div>
              </div>

              <div className="mt-16 flex justify-between px-12">
                <div className="text-center">
                  <div className="w-48 border-b border-gray-800 mb-2"></div>
                  <p className="text-sm font-medium text-gray-600">
                    Delivered By
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-48 border-b border-gray-800 mb-2"></div>
                  <p className="text-sm font-medium text-gray-600">
                    Received By
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>);

}