import React from 'react';
import { Search, X } from 'lucide-react';

export const ProductHistorySearch = ({ search, setSearch }) => {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
      <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
      <input 
        type="text" 
        placeholder="Search product name, ID, brand..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%',
          padding: '0.75rem 2.5rem 0.75rem 2.5rem',
          background: 'rgba(var(--shade-rgb), calc(0.3 * var(--shade-k)))',
          border: '1px solid var(--glass-border-standard)',
          borderRadius: 'var(--radius-full)',
          color: 'var(--color-text-primary)',
          outline: 'none',
          fontSize: '0.9rem'
        }}
      />
      {search && (
        <button 
          onClick={() => setSearch('')}
          style={{ 
            position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', 
            background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' 
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default ProductHistorySearch;
