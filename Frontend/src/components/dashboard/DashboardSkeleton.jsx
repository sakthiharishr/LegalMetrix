import React from 'react';

const Block = ({ w = '100%', h = '14px', style: extra }) => (
  <div
    style={{
      width: w,
      height: h,
      background: 'linear-gradient(90deg, rgba(var(--tint-rgb), 0.04) 25%, rgba(var(--tint-rgb), 0.10) 50%, rgba(var(--tint-rgb), 0.04) 75%)',
      backgroundSize: '800px 100%',
      animation: 'lm-shimmer 1.5s infinite linear',
      borderRadius: 'var(--radius-sm)',
      ...extra,
    }}
  />
);

const GhostCard = ({ children, style: extra }) => (
  <div
    style={{
      background: 'rgba(var(--tint-rgb), 0.03)',
      border: '1px solid rgba(var(--tint-rgb), 0.08)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem',
      ...extra,
    }}
  >
    {children}
  </div>
);

export const DashboardSkeleton = () => (
  <>
    <style>{`
      @keyframes lm-shimmer {
        0% { background-position: -400px 0; }
        100% { background-position: 400px 0; }
      }
    `}</style>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Alert placeholders */}
      <GhostCard style={{ padding: '0.75rem 1rem' }}><Block h="18px" w="65%" /></GhostCard>
      <GhostCard style={{ padding: '0.75rem 1rem' }}><Block h="18px" w="48%" /></GhostCard>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[...Array(4)].map((_, i) => (
          <GhostCard key={i}>
            <Block w="38px" h="38px" style={{ borderRadius: 'var(--radius-md)', marginBottom: '0.65rem' }} />
            <Block w="70%" h="14px" style={{ marginBottom: '0.4rem' }} />
            <Block w="90%" h="10px" />
          </GhostCard>
        ))}
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        {[...Array(5)].map((_, i) => (
          <GhostCard key={i}>
            <Block w="60%" h="12px" style={{ marginBottom: '0.75rem' }} />
            <Block w="40%" h="30px" style={{ marginBottom: '0.5rem' }} />
            <Block w="80%" h="10px" />
          </GhostCard>
        ))}
      </div>

      {/* Chart + risk side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
        <GhostCard style={{ minHeight: '280px' }}>
          <Block w="45%" h="14px" style={{ marginBottom: '1.5rem' }} />
          <Block w="100%" h="200px" style={{ borderRadius: 'var(--radius-md)' }} />
        </GhostCard>
        <GhostCard>
          <Block w="60%" h="14px" style={{ marginBottom: '1.5rem' }} />
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ marginBottom: '0.75rem' }}>
              <Block w="80%" h="10px" style={{ marginBottom: '0.3rem' }} />
              <Block w="100%" h="8px" />
            </div>
          ))}
        </GhostCard>
      </div>

      {/* Categories + risk score */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <GhostCard>
          <Block w="50%" h="14px" style={{ marginBottom: '1.25rem' }} />
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ marginBottom: '0.75rem' }}>
              <Block w="75%" h="10px" style={{ marginBottom: '0.3rem' }} />
              <Block w="100%" h="6px" />
            </div>
          ))}
        </GhostCard>
        <GhostCard>
          <Block w="50%" h="14px" style={{ marginBottom: '1rem' }} />
          <Block w="100%" h="140px" style={{ borderRadius: 'var(--radius-md)', marginBottom: '1rem' }} />
          {[...Array(3)].map((_, i) => (
            <Block key={i} w="100%" h="8px" style={{ marginBottom: '0.45rem' }} />
          ))}
        </GhostCard>
      </div>

      {/* Recurring patterns */}
      <GhostCard>
        <Block w="40%" h="14px" style={{ marginBottom: '1rem' }} />
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            style={{
              marginBottom: '0.875rem',
              padding: '0.875rem',
              background: 'rgba(var(--tint-rgb), 0.02)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <Block w="65%" h="12px" style={{ marginBottom: '0.4rem' }} />
            <Block w="90%" h="10px" />
          </div>
        ))}
      </GhostCard>

      {/* Tables */}
      {[...Array(2)].map((_, t) => (
        <GhostCard key={t}>
          <Block w="35%" h="14px" style={{ marginBottom: '1rem' }} />
          {[...Array(4)].map((_, r) => (
            <div key={r} style={{ display: 'flex', gap: '1rem', marginBottom: '0.7rem', alignItems: 'center' }}>
              <Block w="25%" h="11px" />
              <Block w="12%" h="11px" />
              <Block w="18%" h="11px" />
              <Block w="10%" h="11px" />
              <Block w="20%" h="11px" />
            </div>
          ))}
        </GhostCard>
      ))}
    </div>
  </>
);

export default DashboardSkeleton;
