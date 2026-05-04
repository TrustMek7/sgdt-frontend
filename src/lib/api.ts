import axios from 'axios';
import { Area, Office, DeviceType, Device, DeviceCreatePayload, DeviceCreateResponse, DeviceUpdatePayload, PaginatedDevicesResponse, ReportBatchFilter, ReportBatchResponse, ReportSummary } from './types';

export const apiBaseUrl = 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: apiBaseUrl,
});

// Interceptor for JWT later
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

export interface ProfileResponse {
  user: {
    userId: number;
    email: string;
  };
}

export const login = async (email: string, password: string) => (await api.post<LoginResponse>('/auth/login', { email, password })).data;
export const getProfile = async () => (await api.post<ProfileResponse>('/auth/profile')).data;

// Areas calls
export const getAreas = async () => (await api.get<Area[]>('/areas')).data;
export const createArea = async (data: Partial<Area>) => (await api.post<Area>('/areas', data)).data;
export const updateArea = async (id: string, data: Partial<Area>) => (await api.patch<Area>(`/areas/${id}`, data)).data;
export const deleteArea = async (id: string) => (await api.delete(`/areas/${id}`)).data;

// Offices calls
export const getOffices = async () => (await api.get<Office[]>('/offices')).data;
export const createOffice = async (data: Partial<Office>) => (await api.post<Office>('/offices', data)).data;
export const updateOffice = async (id: string, data: Partial<Office>) => (await api.patch<Office>(`/offices/${id}`, data)).data;
export const deleteOffice = async (id: string) => (await api.delete(`/offices/${id}`)).data;

// Devices calls
export const getDevicesList = async (page = 1, limit = 10) => (await api.get<PaginatedDevicesResponse>(`/devices?page=${page}&limit=${limit}`)).data;
export const createDevice = async (data: DeviceCreatePayload) => (await api.post<DeviceCreateResponse>('/devices', data)).data;
export const updateDevice = async (id: string, data: DeviceUpdatePayload) => (await api.patch<Device>(`/devices/${id}`, data)).data;
export const deleteDevice = async (id: string) => (await api.delete(`/devices/${id}`)).data;

// Device Types calls
export const getDeviceTypes = async () => (await api.get<DeviceType[]>('/device-types')).data;
export const updateDeviceType = async (id: string, data: Partial<DeviceType>) => (await api.patch<DeviceType>(`/device-types/${id}`, data)).data;
export const createDeviceType = async (data: Partial<DeviceType>) => (await api.post<DeviceType>('/device-types', data)).data;
export const deleteDeviceType = async (id: string) => (await api.delete(`/device-types/${id}`)).data;

// Reports
export const getReportSummary = async () => (await api.get<ReportSummary>('/reports/summary')).data;
export const getReportBatch = async (reports: ReportBatchFilter[]) => (await api.post<ReportBatchResponse>('/reports/batch', { reports })).data;
