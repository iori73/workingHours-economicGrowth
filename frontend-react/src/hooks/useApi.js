import { useState, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:5001/api';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.startYear) queryParams.append('start_year', params.startYear);
    if (params.endYear) queryParams.append('end_year', params.endYear);
    if (params.indicators) {
      if (Array.isArray(params.indicators)) {
        queryParams.append('indicators', params.indicators.join(','));
      } else {
        queryParams.append('indicators', params.indicators);
      }
    }
    
    const url = `${API_BASE_URL}/data${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchYearRange = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/year-range`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Error fetching year range:', err);
      throw err;
    }
  }, []);

  const fetchCorrelation = useCallback(async (indicator = null) => {
    const url = indicator 
      ? `${API_BASE_URL}/correlation?indicator=${indicator}`
      : `${API_BASE_URL}/correlation`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Error fetching correlation:', err);
      throw err;
    }
  }, []);

  const fetchMetadata = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/metadata`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Error fetching metadata:', err);
      throw err;
    }
  }, []);

  return {
    loading,
    error,
    fetchData,
    fetchYearRange,
    fetchCorrelation,
    fetchMetadata,
  };
}

