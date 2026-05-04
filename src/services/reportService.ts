import { getReportSummary } from '../lib/api';

export const reportService = {
  summary: () => getReportSummary(),
};
