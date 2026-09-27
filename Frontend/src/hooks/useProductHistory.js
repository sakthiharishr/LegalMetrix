import { useState, useEffect, useCallback } from 'react';
import historyService from '../services/historyService';

export const useProductHistory = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on search change
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, riskFilter]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, searchRes] = await Promise.all([
        historyService.getHistorySummary(),
        historyService.searchProducts({ 
          search: debouncedSearch, 
          status: statusFilter, 
          riskLevel: riskFilter, 
          page, 
          pageSize: 10 
        })
      ]);
      setSummary(sumRes);
      setProducts(searchRes.products);
      setTotal(searchRes.total);
    } catch (err) {
      setError(err.message || 'Failed to load product history.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, riskFilter, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    loading,
    error,
    summary,
    products,
    total,
    page,
    setPage,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    riskFilter,
    setRiskFilter,
    retry: fetchData
  };
};

export default useProductHistory;
