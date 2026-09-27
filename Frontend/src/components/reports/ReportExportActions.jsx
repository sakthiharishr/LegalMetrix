import React from 'react';
import { GlassButton } from '../ui/GlassButton';
import { Download, FileText, Printer, Loader } from 'lucide-react';

export const ReportExportActions = ({ exportState, exportMessage, handleExportPdf, handleExportCsv }) => {
  return (
    <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end' }}>
      
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <GlassButton 
          variant="secondary" 
          icon={<Printer size={16} />}
          onClick={() => window.print()}
          disabled={exportState !== 'IDLE'}
        >
          Print Report
        </GlassButton>
        <GlassButton 
          variant="secondary" 
          icon={exportState === 'PREPARING_CSV' ? <Loader size={16} className="spin" /> : <FileText size={16} />}
          onClick={handleExportCsv}
          disabled={exportState !== 'IDLE'}
        >
          {exportState === 'PREPARING_CSV' ? 'Preparing CSV...' : 'Export CSV'}
        </GlassButton>
        <GlassButton 
          variant="primary" 
          icon={exportState === 'PREPARING_PDF' ? <Loader size={16} className="spin" /> : <Download size={16} />}
          onClick={handleExportPdf}
          disabled={exportState !== 'IDLE'}
        >
          {exportState === 'PREPARING_PDF' ? 'Preparing PDF...' : 'Export PDF'}
        </GlassButton>
      </div>

      {exportMessage && (
        <div style={{ fontSize: '0.8rem', color: 'var(--color-brand-cyan-light)', padding: '0.5rem 1rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: 'var(--radius-md)' }}>
          {exportMessage}
        </div>
      )}

    </div>
  );
};

export default ReportExportActions;
