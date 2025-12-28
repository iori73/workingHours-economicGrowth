import { useState, useCallback, useRef } from 'react';

// 静的データファイルのベースURL
const DATA_BASE_URL = '/data';

// キャッシュ用（モジュールレベル）
let cachedData = null;
let cachedCorrelation = null;
let cachedMetadata = null;

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      // キャッシュがなければ取得
      if (!cachedData) {
        const response = await fetch(`${DATA_BASE_URL}/combined_dataset.json`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        cachedData = await response.json();
      }

      let data = [...cachedData];

      // 年でフィルタリング
      if (params.startYear) {
        data = data.filter(d => d.year >= params.startYear);
      }
      if (params.endYear) {
        data = data.filter(d => d.year <= params.endYear);
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchYearRange = useCallback(async () => {
    try {
      // キャッシュがなければ取得
      if (!cachedData) {
        const response = await fetch(`${DATA_BASE_URL}/combined_dataset.json`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        cachedData = await response.json();
      }

      if (cachedData && cachedData.length > 0) {
        const years = cachedData.map(d => d.year);
        return {
          min: Math.min(...years),
          max: Math.max(...years)
        };
      }
      return null;
    } catch (err) {
      console.error('Error fetching year range:', err);
      throw err;
    }
  }, []);

  const fetchCorrelation = useCallback(async (indicator = null) => {
    try {
      if (!cachedCorrelation) {
        const response = await fetch(`${DATA_BASE_URL}/correlation_analysis.json`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        cachedCorrelation = await response.json();
      }

      if (indicator && cachedCorrelation) {
        return cachedCorrelation[indicator] || null;
      }
      return cachedCorrelation;
    } catch (err) {
      console.error('Error fetching correlation:', err);
      throw err;
    }
  }, []);

  const fetchMetadata = useCallback(async () => {
    try {
      if (!cachedMetadata) {
        const files = [
          'labor_hours_metadata.json',
          'economic_indicators_metadata.json',
          'reading_time_metadata.json'
        ];

        cachedMetadata = {};

        for (const file of files) {
          try {
            const response = await fetch(`${DATA_BASE_URL}/${file}`);
            if (response.ok) {
              const key = file.replace('_metadata.json', '');
              cachedMetadata[key] = await response.json();
            }
          } catch (e) {
            console.warn(`Could not load ${file}:`, e);
          }
        }
      }
      return cachedMetadata;
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
