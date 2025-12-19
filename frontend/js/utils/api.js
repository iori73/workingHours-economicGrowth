/**
 * API通信ユーティリティ
 */

const API_BASE_URL = 'http://localhost:5001/api';

class API {
    /**
     * データを取得
     */
    static async getData(params = {}) {
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
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }
    
    /**
     * 利用可能な指標を取得
     */
    static async getIndicators() {
        try {
            const response = await fetch(`${API_BASE_URL}/indicators`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.indicators;
        } catch (error) {
            console.error('Error fetching indicators:', error);
            throw error;
        }
    }
    
    /**
     * 年範囲を取得
     */
    static async getYearRange() {
        try {
            const response = await fetch(`${API_BASE_URL}/year-range`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching year range:', error);
            throw error;
        }
    }
    
    /**
     * 相関分析結果を取得
     */
    static async getCorrelation(indicator = null) {
        const url = indicator 
            ? `${API_BASE_URL}/correlation?indicator=${indicator}`
            : `${API_BASE_URL}/correlation`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching correlation:', error);
            throw error;
        }
    }
    
    /**
     * 時系列分析結果を取得
     */
    static async getTimeSeriesAnalysis() {
        try {
            const response = await fetch(`${API_BASE_URL}/timeseries`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching time series analysis:', error);
            throw error;
        }
    }
    
    /**
     * メタデータを取得
     */
    static async getMetadata() {
        try {
            const response = await fetch(`${API_BASE_URL}/metadata`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching metadata:', error);
            throw error;
        }
    }
}

