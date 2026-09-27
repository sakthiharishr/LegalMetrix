import React from 'react';
import { ANALYSIS_STATUS } from '../../utils/constants';
import GlassCard from '../ui/GlassCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import { CheckCircle2, XCircle, Clock, Info } from 'lucide-react';

export const ScanProgressTracker = ({ stages, analysisStatus }) => {
  const containerStyle = {
    padding: 'var(--spacing-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--spacing-sm)',
    borderBottom: '1px solid var(--color-border)',
    paddingBottom: 'var(--spacing-md)'
  };

  const titleStyle = {
    fontSize: 'var(--font-size-lg)',
    fontWeight: '600',
    color: 'var(--color-text)'
  };

  const stageListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0'
  };

  const infoBoxStyle = {
    display: 'flex',
    gap: 'var(--spacing-sm)',
    padding: 'var(--spacing-md)',
    border: '1px solid var(--color-primary)',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
    color: 'var(--color-text)',
    fontSize: 'var(--font-size-sm)',
    marginTop: 'var(--spacing-md)',
    alignItems: 'flex-start'
  };

  const successMessageStyle = {
    color: 'var(--color-success)',
    fontWeight: '500',
    marginTop: 'var(--spacing-sm)'
  };

  const errorMessageStyle = {
    color: 'var(--color-danger)',
    fontWeight: '500',
    marginTop: 'var(--spacing-sm)'
  };

  const renderIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock size={20} color="var(--color-text-muted)" />;
      case 'PROCESSING':
        return <div style={{ filter: 'drop-shadow(0 0 4px var(--color-primary))' }}><LoadingSpinner size="sm" /></div>;
      case 'COMPLETE':
        return <CheckCircle2 size={20} color="var(--color-success)" />;
      case 'FAILED':
        return <XCircle size={20} color="var(--color-danger)" />;
      default:
        return <Clock size={20} color="var(--color-text-muted)" />;
    }
  };

  const renderStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>Pending</span>;
      case 'PROCESSING':
        return <span style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)', fontWeight: '500' }}>Processing...</span>;
      case 'COMPLETE':
        return <span style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-sm)', fontWeight: '500' }}>Complete</span>;
      case 'FAILED':
        return <span style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', fontWeight: '500' }}>Failed</span>;
      default:
        return <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>Unknown</span>;
    }
  };

  return (
    <GlassCard variant="elevated" style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>Processing Pipeline</h2>
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Status: {analysisStatus || 'Idle'}</span>
      </div>

      <div style={stageListStyle}>
        {stages && stages.map((stage, index) => {
          const isLast = index === stages.length - 1;
          const lineCompleted = stage.status === 'COMPLETE';
          
          return (
            <div key={stage.key} style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '24px' }}>
                <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {renderIcon(stage.status)}
                </div>
                {!isLast && (
                  <div style={{
                    width: '2px',
                    height: '100%',
                    minHeight: '30px',
                    backgroundColor: lineCompleted ? 'var(--color-success)' : 'var(--color-border)',
                    margin: '4px 0'
                  }} />
                )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: isLast ? 0 : 'var(--spacing-lg)' }}>
                <div style={{ fontWeight: '500', color: 'var(--color-text)', marginBottom: '2px' }}>
                  {stage.label}
                </div>
                {renderStatusText(stage.status)}
              </div>
            </div>
          );
        })}
      </div>

      <div style={infoBoxStyle}>
        <Info size={20} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          Processing stages reflect pipeline status. Backend OCR and analysis results are not available until the FastAPI service confirms completion.
        </div>
      </div>

      {analysisStatus === ANALYSIS_STATUS.COMPLETE && (
        <div style={successMessageStyle}>Analysis complete. Ready for compliance review.</div>
      )}
      
      {analysisStatus === ANALYSIS_STATUS.FAILED && (
        <div style={errorMessageStyle}>Analysis encountered an error. Please retry or contact support.</div>
      )}
    </GlassCard>
  );
};

export default ScanProgressTracker;
