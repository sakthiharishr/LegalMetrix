import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GlassInput from '../ui/GlassInput';

export const ProductMetadataForm = ({
  metadata,
  onUpdateMetadata,
  disabled = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleChange = (fieldName, value) => {
    if (onUpdateMetadata) {
      onUpdateMetadata(fieldName, value);
    }
  };

  const {
    productName = '',
    brand = '',
    category = '',
    skuId = '',
    manufacturer = '',
    batchNumber = ''
  } = metadata || {};

  return (
    <GlassCard variant="default" style={{ padding: '0', overflow: 'hidden' }}>
      <div
        onClick={toggleExpand}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpand();
          }
        }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--spacing-md) var(--spacing-lg)',
          cursor: 'pointer',
          background: 'var(--glass-bg-subtle)'
        }}
      >
        <h3 style={{ margin: 0, fontSize: 'var(--font-size-md)', color: 'var(--color-text-primary)' }}>
          Product Information (Optional)
        </h3>
        {isExpanded ? (
          <ChevronUp size={20} color="var(--color-text-secondary)" />
        ) : (
          <ChevronDown size={20} color="var(--color-text-secondary)" />
        )}
      </div>

      {isExpanded && (
        <div style={{ padding: 'var(--spacing-lg)' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--spacing-lg)',
            marginBottom: 'var(--spacing-lg)'
          }}>
            <GlassInput
              label="Product Name"
              placeholder="e.g. NutriCrunch Wheat Biscuits"
              value={productName}
              onChange={(e) => handleChange('productName', e.target.value)}
              disabled={disabled}
            />
            <GlassInput
              label="Brand"
              placeholder="e.g. GoldenHarvest Foods"
              value={brand}
              onChange={(e) => handleChange('brand', e.target.value)}
              disabled={disabled}
            />
            <GlassInput
              label="Category"
              placeholder="e.g. Packaged Food"
              value={category}
              onChange={(e) => handleChange('category', e.target.value)}
              disabled={disabled}
            />
            <GlassInput
              label="Product / SKU ID"
              placeholder="e.g. CMD-2026-001"
              value={skuId}
              onChange={(e) => handleChange('skuId', e.target.value)}
              disabled={disabled}
            />
            <GlassInput
              label="Manufacturer / Packer"
              placeholder="e.g. ABC Industries Ltd."
              value={manufacturer}
              onChange={(e) => handleChange('manufacturer', e.target.value)}
              disabled={disabled}
            />
            <GlassInput
              label="Batch / Lot Number"
              placeholder="e.g. LOT-2026-09-A"
              value={batchNumber}
              onChange={(e) => handleChange('batchNumber', e.target.value)}
              disabled={disabled}
            />
          </div>
          <p style={{
            margin: 0,
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
            textAlign: 'center'
          }}>
            Providing product details helps with record-keeping. These fields do not affect compliance analysis.
          </p>
        </div>
      )}
    </GlassCard>
  );
};

export default ProductMetadataForm;
