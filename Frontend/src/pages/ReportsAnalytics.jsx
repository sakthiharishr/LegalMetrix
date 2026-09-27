import React from 'react';
import { getAuthToken } from '../services/api';
import { BarChart3, FileSpreadsheet, FileText, PieChart, ShieldAlert } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';

export const ReportsAnalytics = () => {
  const [exporting, setExporting] = React.useState(false);
  const [digestLoading, setDigestLoading] = React.useState(false);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const token = getAuthToken();
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
      const res = await fetch(`${baseUrl}/reports/export/csv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ range: '30d' })
      });
      if (!res.ok) throw new Error(`CSV export failed (${res.status})`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `legalmetrix_enforcement_dataset_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV dataset:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleGenerateDigest = async () => {
    setDigestLoading(true);
    try {
      const token = getAuthToken();
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
      const res = await fetch(`${baseUrl}/reports/digest?days=30`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error(`Digest generation failed (${res.status})`);
      const htmlText = await res.text();
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(htmlText);
        win.document.close();
      }
    } catch (err) {
      console.error('Failed to generate Ministry Digest:', err);
    } finally {
      setDigestLoading(false);
    }
  };

  const ruleBreakdown = [
    { rule: 'Rule 6(1)(e) - Font size & MRP formatting', count: 42, percentage: '38%' },
    { rule: 'Rule 6(1)(a) - Incomplete manufacturer / packer address', count: 28, percentage: '25%' },
    { rule: 'Rule 18 - Smudged / Dual pricing alterations', count: 21, percentage: '19%' },
    { rule: 'Rule 6(1)(d) - Missing packing month & year', count: 12, percentage: '11%' },
    { rule: 'Rule 6(1)(f) - Consumer care contact absent', count: 8, percentage: '7%' },
  ];

  return (
    <div>
      <PageHeader
        title="Enforcement Reports & Analytics"
        subtitle="Aggregated intelligence on Legal Metrology compliance trends, violation density, and statutory audits"
        actions={
          <>
            <GlassButton
              variant="secondary"
              icon={<FileSpreadsheet size={15} />}
              onClick={handleExportCsv}
              disabled={exporting}
            >
              {exporting ? 'Exporting CSV...' : 'Export CSV Dataset'}
            </GlassButton>
            <GlassButton
              variant="primary"
              icon={<FileText size={15} />}
              onClick={handleGenerateDigest}
              disabled={digestLoading}
            >
              {digestLoading ? 'Compiling Digest...' : 'Generate Ministry Digest'}
            </GlassButton>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Violation Distribution by Rule */}
        <GlassCard
          variant="elevated"
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieChart size={18} color="var(--color-brand-cyan-light)" />
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', margin: 0 }}>
                Top Potential Violations by PCR 2011 Rule
              </h3>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {ruleBreakdown.map((item, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{item.rule}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--color-brand-cyan-light)' }}>{item.count} cases ({item.percentage})</span>
                </div>
                <div
                  style={{
                    height: '6px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(var(--tint-rgb), 0.08)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: item.percentage,
                      background: 'linear-gradient(90deg, var(--color-brand-cyan), var(--color-brand-blue))',
                      borderRadius: 'var(--radius-full)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Enforcement Summary Card */}
        <GlassCard
          variant="elevated"
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={18} color="var(--text-danger-soft)" />
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', margin: 0 }}>
                Statutory Notice Issuance Summary
              </h3>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border-standard)', paddingBottom: '0.75rem' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Total Notices Issued (Section 39)
              </span>
              <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 'bold', color: 'var(--text-heading)' }}>
                48 Notices
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border-standard)', paddingBottom: '0.75rem' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Compounded Cases
              </span>
              <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 'bold', color: 'var(--color-status-compliant)' }}>
                29 Cases
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Average Inspection Processing Time
              </span>
              <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 'bold', color: 'var(--color-brand-cyan-light)' }}>
                1.4 seconds / pack
              </span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
