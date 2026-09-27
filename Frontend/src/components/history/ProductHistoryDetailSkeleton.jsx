import React from 'react';
import { GlassCard } from '../ui/GlassCard';

export const ProductHistoryDetailSkeleton = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
      
      {/* Top Banner / Identity */}
      <GlassCard style={{ height: '140px' }}>
        <div style={{ width: '30%', height: '24px', background: 'rgba(var(--tint-rgb), 0.08)', borderRadius: '4px', marginBottom: '1rem' }}></div>
        <div style={{ width: '20%', height: '16px', background: 'rgba(var(--tint-rgb), 0.05)', borderRadius: '4px', marginBottom: '1.5rem' }}></div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div style={{ width: '100px', height: '12px', background: 'rgba(var(--tint-rgb), 0.03)', borderRadius: '4px' }}></div>
          <div style={{ width: '100px', height: '12px', background: 'rgba(var(--tint-rgb), 0.03)', borderRadius: '4px' }}></div>
        </div>
      </GlassCard>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        
        {/* Left Col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <GlassCard style={{ height: '250px' }}>
            <div style={{ width: '40%', height: '16px', background: 'rgba(var(--tint-rgb), 0.05)', borderRadius: '4px', marginBottom: '2rem' }}></div>
            <div style={{ width: '100%', height: '80px', background: 'rgba(var(--tint-rgb), 0.03)', borderRadius: '4px', marginBottom: '1rem' }}></div>
          </GlassCard>

          <GlassCard style={{ height: '300px' }}>
            <div style={{ width: '30%', height: '16px', background: 'rgba(var(--tint-rgb), 0.05)', borderRadius: '4px', marginBottom: '2rem' }}></div>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ width: '100%', height: '40px', background: 'rgba(var(--tint-rgb), 0.02)', borderRadius: '4px', marginBottom: '1rem' }}></div>
            ))}
          </GlassCard>
        </div>

        {/* Right Col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <GlassCard style={{ height: '400px' }}>
             <div style={{ width: '40%', height: '16px', background: 'rgba(var(--tint-rgb), 0.05)', borderRadius: '4px', marginBottom: '2rem' }}></div>
             {[1, 2, 3, 4].map(i => (
               <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                 <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(var(--tint-rgb), 0.05)' }}></div>
                 <div style={{ flex: 1, height: '40px', background: 'rgba(var(--tint-rgb), 0.02)', borderRadius: '4px' }}></div>
               </div>
             ))}
          </GlassCard>
        </div>

      </div>

    </div>
  );
};

export default ProductHistoryDetailSkeleton;
