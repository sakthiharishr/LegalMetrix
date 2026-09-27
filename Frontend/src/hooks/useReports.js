import { useState, useEffect, useCallback } from 'react';
import reportService from '../services/reportService';
import { useSearchParams } from 'react-router-dom';

export const useReports = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRange = searchParams.get('range') || '30d';

  const [dateRange, setDateRange] = useState(initialRange);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  // Export states
  const [exportState, setExportState] = useState('IDLE'); // IDLE, PREPARING_PDF, PREPARING_CSV
  const [exportMessage, setExportMessage] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportService.getReportAnalytics({ range: dateRange });
      setAnalytics(data);
    } catch (err) {
      setError(err.message || 'Unable to load report analytics.');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const updateDateRange = (range) => {
    setDateRange(range);
    setSearchParams({ range });
  };

  const handleExportPdf = async () => {
    if (exportState !== 'IDLE') return;
    setExportState('PREPARING_PDF');
    setExportMessage(null);
    try {
      const blob = await reportService.requestPdfExport({ range: dateRange });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `legalmetrix_compliance_report_${dateRange}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setExportMessage('PDF report downloaded successfully.');
    } catch (err) {
      setExportMessage(`PDF export failed: ${err.message || 'Unknown error'}`);
    } finally {
      setExportState('IDLE');
      // Clear success message after 5 seconds
      setTimeout(() => setExportMessage(null), 5000);
    }
  };

  const handleExportCsv = async () => {
    if (exportState !== 'IDLE') return;
    setExportState('PREPARING_CSV');
    setExportMessage(null);
    try {
      const blob = await reportService.requestCsvExport({ range: dateRange });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `legalmetrix_enforcement_dataset_${dateRange}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setExportMessage('CSV dataset downloaded successfully.');
    } catch (err) {
      setExportMessage(`CSV export failed: ${err.message || 'Unknown error'}`);
    } finally {
      setExportState('IDLE');
      setTimeout(() => setExportMessage(null), 5000);
    }
  };

  return {
    dateRange,
    updateDateRange,
    loading,
    error,
    analytics,
    retry: fetchAnalytics,
    exportState,
    exportMessage,
    handleExportPdf,
    handleExportCsv
  };
};

export default useReports;
