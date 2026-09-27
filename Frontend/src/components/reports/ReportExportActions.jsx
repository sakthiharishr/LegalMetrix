import React from 'react';
import { GlassButton } from '../ui/GlassButton';
import { Download, FileSpreadsheet, Printer, Loader } from 'lucide-react';

export const ReportExportActions = ({ exportState, handleExportPdf, handleExportCsv }) => {
  const busy = exportState !== 'IDLE';
  return (
    <div className="no-print" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
      <GlassButton variant="secondary" icon={<Printer size={16} />} onClick={() => window.print()} disabled={busy}>
        Print
      </GlassButton>
      <GlassButton variant="secondary" onClick={handleExportCsv} disabled={busy}
        icon={exportState === 'PREPARING_CSV' ? <Loader size={16} className="spin" /> : <FileSpreadsheet size={16} />}>
        {exportState === 'PREPARING_CSV' ? 'Preparing CSV...' : 'Export CSV'}
      </GlassButton>
      <GlassButton variant="primary" onClick={handleExportPdf} disabled={busy}
        icon={exportState === 'PREPARING_PDF' ? <Loader size={16} className="spin" /> : <Download size={16} />}>
        {exportState === 'PREPARING_PDF' ? 'Preparing PDF...' : 'Export PDF'}
      </GlassButton>
    </div>
  );
};

/** Result of the last export: green on success, red on failure. */
export const ExportMessage = ({ message }) => {
  if (!message) return null;
  const failed = /fail|error|expired/i.test(message);
  const color = failed ? 'var(--color-status-violation)' : 'var(--color-status-compliant)';
  return (
    <div role={failed ? 'alert' : 'status'} className="no-print" style={{
      fontSize: '0.8rem', padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-md)', color,
      border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`, background: `color-mix(in srgb, ${color} 10%, transparent)`,
    }}>
      {message}
    </div>
  );
};

export default ReportExportActions;
