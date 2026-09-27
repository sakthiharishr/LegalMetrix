import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HistoricalEvidenceGallery = ({ evidence }) => {
  const navigate = useNavigate();

  if (!evidence || evidence.length === 0) {
    return (
      <GlassCard variant="default" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        No historical evidence is available.
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="default">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <ImageIcon size={16} color="var(--color-text-secondary)" />
        <h3 style={{ fontSize: '0.85rem', fontWeight: 'var(--font-weight-semibold)', margin: 0, color: 'var(--color-text-primary)' }}>
          Historical Evidence
        </h3>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
        {evidence.map(item => (
          <div 
            key={item.id} 
            onClick={() => navigate(`/evidence?scanId=${item.scanId}&findingId=${item.findingId}`)}
            style={{ 
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              transition: 'transform 0.2s',
              ':hover': { transform: 'scale(1.02)' }
            }}
          >
            <div style={{ 
              width: '100%', 
              aspectRatio: '1', 
              borderRadius: 'var(--radius-md)', 
              overflow: 'hidden',
              border: '1px solid var(--glass-border-standard)',
              background: 'rgba(var(--shade-rgb), calc(0.3 * var(--shade-k)))'
            }}>
              <img src={item.thumbnailUrl} alt={item.category} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-primary)', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.category}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>
                {new Date(item.date).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default HistoricalEvidenceGallery;
