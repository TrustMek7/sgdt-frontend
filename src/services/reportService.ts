import { getAreaReports, getReportBatch, getReportSummary } from '../lib/api';
import { ReportBatchFilter } from '../lib/types';

export const reportService = {
  summary: () => getReportSummary(),
  batch: (reports: ReportBatchFilter[]) => getReportBatch(reports),
  byArea: (areaId?: string) => getAreaReports(areaId),
};
