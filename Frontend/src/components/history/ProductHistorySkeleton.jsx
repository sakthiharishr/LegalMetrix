import React from 'react';
import { GlassCard } from '../ui/GlassCard';

export const ProductHistorySkeleton = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
      
      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ height: '42px', width: '300px', background: 'rgba(var(--tint-rgb), 0.05)', borderRadius: 'var(--radius-full)' }}></div>
        <div style={{ height: '42px', width: '150px', background: 'rgba(var(--tint-rgb), 0.05)', borderRadius: 'var(--radius-md)' }}></div>
        <div style={{ height: '42px', width: '150px', background: 'rgba(var(--tint-rgb), 0.05)', borderRadius: 'var(--radius-md)' }}></div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {[1, 2, 3, 4].map(i => (
          <GlassCard key={i} style={{ height: '100px' }}>
             <div style={{ width: '40%', height: '14px', background: 'rgba(var(--tint-rgb), 0.05)', borderRadius: '4px', marginBottom: '1rem' }}></div>
             <div style={{ width: '60%', height: '32px', background: 'rgba(var(--tint-rgb), 0.08)', borderRadius: '4px' }}></div>
          </GlassCard>
        ))}
      </div>

      {/* Table */}
      <GlassCard style={{ height: '400px', padding: 0 }}>
        <div style={{ width: '100%', height: '50px', background: 'rgba(var(--tint-rgb), 0.02)', borderBottom: '1px solid rgba(var(--tint-rgb), 0.05)' }}></div>
        {[1, 2, 3, 4, 5].map(i => (
           <div key={i} style={{ width: '100%', height: '65px', borderBottom: '1px solid rgba(var(--tint-rgb), 0.05)', padding: '1rem', display: 'flex', gap: '2rem' }}>
             <div style={{ width: '20%', height: '20px', background: 'rgba(var(--tint-rgb), 0.05)', borderRadius: '4px' }}></div>
             <div style={{ width: '15%', height: '24px', background: 'rgba(var(--tint-rgb), 0.05)', borderRadius: '12px' }}></div>
             <div style={{ width: '15%', height: '24px', background: 'rgba(var(--tint-rgb), 0.05)', borderRadius: '12px' }}></div>
           </div>
        ))}
      </GlassCard>

    </div>
  );
};

export default ProductHistorySkeleton;
