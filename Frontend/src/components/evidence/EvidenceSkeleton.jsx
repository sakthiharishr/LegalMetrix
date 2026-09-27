import React from 'react';
import { GlassCard } from '../ui/GlassCard';

export const EvidenceSkeleton = () => {
  return (
    <div style={{ paddingBottom: '80px', display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
      
      {/* Header Skeleton */}
      <div style={{ height: '100px', background: 'rgba(var(--tint-rgb), 0.02)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(var(--tint-rgb), 0.05)' }}></div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        
        {/* Left Col - Image */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <GlassCard style={{ height: '400px' }}>
            <div style={{ width: '100%', height: '100%', background: 'rgba(var(--tint-rgb), 0.03)', borderRadius: 'var(--radius-md)' }}></div>
          </GlassCard>
        </div>

        {/* Right Col - Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <GlassCard style={{ height: '220px' }}>
            <div style={{ width: '40%', height: '24px', background: 'rgba(var(--tint-rgb), 0.05)', borderRadius: '4px', marginBottom: '1.5rem' }}></div>
            <div style={{ width: '100%', height: '16px', background: 'rgba(var(--tint-rgb), 0.03)', borderRadius: '4px', marginBottom: '0.75rem' }}></div>
            <div style={{ width: '80%', height: '16px', background: 'rgba(var(--tint-rgb), 0.03)', borderRadius: '4px', marginBottom: '0.75rem' }}></div>
            <div style={{ width: '90%', height: '16px', background: 'rgba(var(--tint-rgb), 0.03)', borderRadius: '4px' }}></div>
          </GlassCard>
          
          <GlassCard style={{ height: '180px' }}>
             <div style={{ width: '30%', height: '24px', background: 'rgba(var(--tint-rgb), 0.05)', borderRadius: '4px', marginBottom: '1.5rem' }}></div>
             <div style={{ width: '100%', height: '16px', background: 'rgba(var(--tint-rgb), 0.03)', borderRadius: '4px', marginBottom: '0.75rem' }}></div>
          </GlassCard>
        </div>
      </div>
      
      {/* Traceability Skeleton */}
      <GlassCard style={{ height: '100px' }}>
        <div style={{ width: '20%', height: '20px', background: 'rgba(var(--tint-rgb), 0.05)', borderRadius: '4px' }}></div>
      </GlassCard>
      
    </div>
  );
};

export default EvidenceSkeleton;
