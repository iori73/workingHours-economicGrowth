/**
 * API通信ユーティリティ
 * 静的JSONファイルからデータを取得
 */

// データのベースURL（静的ファイル）
const DATA_BASE_URL = 'data';

// キャッシュ用変数
let cachedData = null;
let cachedCorrelation = null;
let cachedTimeseries = null;
let cachedMetadata = null;

class API {
    /**
     * データを取得
     */
    static async getData(params = {}) {
        try {
            // キャッシュがあればそれを使用
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
            // データから指標を取得
            if (!cachedData) {
                const response = await fetch(`${DATA_BASE_URL}/combined_dataset.json`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                cachedData = await response.json();
            }
            
            if (cachedData && cachedData.length > 0) {
                return Object.keys(cachedData[0]).filter(key => key !== 'year');
            }
            return [];
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
            // データから年範囲を計算
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
        } catch (error) {
            console.error('Error fetching year range:', error);
            throw error;
        }
    }
    
    /**
     * 相関分析結果を取得
     */
    static async getCorrelation(indicator = null) {
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
            if (!cachedTimeseries) {
                const response = await fetch(`${DATA_BASE_URL}/time_series_analysis.json`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                cachedTimeseries = await response.json();
            }
            return cachedTimeseries;
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
            if (!cachedMetadata) {
                // 複数のメタデータファイルを読み込み
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
        } catch (error) {
            console.error('Error fetching metadata:', error);
            throw error;
        }
    }
}

