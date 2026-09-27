import React from 'react';
import { GlassCard } from '../ui/GlassCard';

export const ReportsSkeleton = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
      
      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[1,2,3,4].map(i => <div key={i} style={{ width: '80px', height: '36px', background: 'rgba(var(--tint-rgb), 0.05)', borderRadius: 'var(--radius-md)' }} />)}
        </div>
      </div>

      {/* Summaries */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {[1,2,3,4].map(i => (
          <GlassCard key={i} style={{ height: '90px' }}>
            <div style={{ width: '60%', height: '12px', background: 'rgba(var(--tint-rgb), 0.05)', borderRadius: '4px', marginBottom: '1rem' }} />
            <div style={{ width: '40%', height: '24px', background: 'rgba(var(--tint-rgb), 0.05)', borderRadius: '4px' }} />
          </GlassCard>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <GlassCard style={{ height: '250px' }}>
           <div style={{ width: '40%', height: '16px', background: 'rgba(var(--tint-rgb), 0.05)', borderRadius: '4px', marginBottom: '2rem' }}></div>
           <div style={{ width: '100%', height: '150px', background: 'rgba(var(--tint-rgb), 0.02)', borderRadius: '4px' }}></div>
        </GlassCard>
        
        <GlassCard style={{ height: '250px' }}>
           <div style={{ width: '40%', height: '16px', background: 'rgba(var(--tint-rgb), 0.05)', borderRadius: '4px', marginBottom: '2rem' }}></div>
           <div style={{ width: '100%', height: '150px', background: 'rgba(var(--tint-rgb), 0.02)', borderRadius: '4px' }}></div>
        </GlassCard>
      </div>
      
      <GlassCard style={{ height: '500px' }}>
         <div style={{ width: '30%', height: '16px', background: 'rgba(var(--tint-rgb), 0.05)', borderRadius: '4px', marginBottom: '3rem' }}></div>
         {[1,2,3,4,5].map(i => (
           <div key={i} style={{ width: '100%', height: '40px', background: 'rgba(var(--tint-rgb), 0.02)', borderRadius: '4px', marginBottom: '1rem' }}></div>
         ))}
      </GlassCard>

    </div>
  );
};

export default ReportsSkeleton;
