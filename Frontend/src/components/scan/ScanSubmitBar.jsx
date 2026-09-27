import React from 'react';
import { ANALYSIS_STATUS } from '../../utils/constants';
import GlassButton from '../ui/GlassButton';
import GlassBadge from '../ui/GlassBadge';
import { Sparkles, RotateCcw, CheckCircle2 } from 'lucide-react';

export const ScanSubmitBar = ({ 
  uploadedCount, 
  maxImages, 
  canAnalyze, 
  isAnalyzing, 
  analysisStatus, 
  onAnalyze, 
  onReset 
}) => {
  const containerStyle = {
    position: 'sticky',
    bottom: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'var(--spacing-md) var(--spacing-lg)',
    backgroundColor: 'var(--bg-glass)',
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid var(--color-border)',
    zIndex: 10,
    flexWrap: 'wrap',
    gap: 'var(--spacing-md)'
  };

  const leftSideStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-md)'
  };

  const rightSideStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-md)'
  };

  return (
    <div style={containerStyle}>
      <div style={leftSideStyle}>
        <GlassBadge variant={uploadedCount === maxImages ? 'success' : 'neutral'} size="md">
          {uploadedCount} of {maxImages} images ready
        </GlassBadge>
        {uploadedCount === 0 && (
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-warning)' }}>
            Upload at least one image to begin analysis
          </span>
        )}
      </div>

      <div style={rightSideStyle}>
        <GlassButton 
          variant="ghost" 
          onClick={onReset} 
          disabled={isAnalyzing}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}
        >
          <RotateCcw size={16} />
          Reset
        </GlassButton>

        {analysisStatus === ANALYSIS_STATUS.COMPLETE ? (
          <GlassBadge variant="success" size="lg" style={{ padding: 'var(--spacing-sm) var(--spacing-lg)' }}>
            <CheckCircle2 size={18} style={{ marginRight: '8px' }} />
            Analysis Complete
          </GlassBadge>
        ) : (
          <GlassButton 
            variant="primary" 
            onClick={onAnalyze}
            disabled={!canAnalyze}
            isLoading={isAnalyzing}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}
          >
            <Sparkles size={16} />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Product'}
          </GlassButton>
        )}
      </div>
    </div>
  );
};

export default ScanSubmitBar;
