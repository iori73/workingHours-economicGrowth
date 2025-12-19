/**
 * メインアプリケーション
 */

// グローバル変数
let timeseriesChart, correlationChart, comparisonChart, readingChart;
let currentData = null;
let currentIndicator = 'gdp_growth_rate';
let yearRange = { min: 1945, max: 2024 };

// 初期化
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing application...');
    
    // チャートを初期化
    timeseriesChart = new TimeSeriesChart('timeseries-chart');
    correlationChart = new CorrelationChart('correlation-chart');
    comparisonChart = new ComparisonChart('comparison-chart');
    readingChart = new ReadingChart('reading-chart');
    
    // イベントリスナーを設定
    setupEventListeners();
    
    // データを読み込み
    await loadInitialData();
    
    // 解説とデータソース情報を読み込み
    await loadExplanations();
    await loadDataSources();
});

/**
 * イベントリスナーを設定
 */
function setupEventListeners() {
    // タブ切り替え
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const tabName = e.target.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // フィルター適用
    document.getElementById('apply-filters').addEventListener('click', async () => {
        await applyFilters();
    });
    
    // 指標変更
    document.getElementById('indicator-select').addEventListener('change', (e) => {
        currentIndicator = e.target.value;
        updateCharts();
    });
    
    // グラフダウンロード
    document.getElementById('download-chart').addEventListener('click', () => {
        downloadCurrentChart();
    });
}

/**
 * 初期データを読み込み
 */
async function loadInitialData() {
    try {
        // 年範囲を取得
        yearRange = await API.getYearRange();
        if (yearRange) {
            document.getElementById('start-year').value = yearRange.min;
            document.getElementById('end-year').value = yearRange.max;
        }
        
        // データを取得
        currentData = await API.getData();
        
        if (currentData && currentData.length > 0) {
            updateCharts();
        } else {
            showError('データの読み込みに失敗しました');
        }
    } catch (error) {
        console.error('Error loading initial data:', error);
        showError('データの読み込みに失敗しました。バックエンドサーバーが起動しているか確認してください。');
    }
}

/**
 * フィルターを適用
 */
async function applyFilters() {
    const startYear = parseInt(document.getElementById('start-year').value);
    const endYear = parseInt(document.getElementById('end-year').value);
    
    try {
        currentData = await API.getData({
            startYear: startYear,
            endYear: endYear,
            indicators: [currentIndicator]
        });
        
        updateCharts();
    } catch (error) {
        console.error('Error applying filters:', error);
        showError('フィルターの適用に失敗しました');
    }
}

/**
 * チャートを更新
 */
async function updateCharts() {
    if (!currentData || currentData.length === 0) {
        return;
    }
    
    const activeTab = document.querySelector('.tab-content.active').id;
    
    // アクティブなタブに応じてチャートを更新
    if (activeTab === 'timeseries-tab') {
        await timeseriesChart.update(currentData, currentIndicator);
    } else if (activeTab === 'correlation-tab') {
        try {
            const correlationData = await API.getCorrelation(currentIndicator);
            await correlationChart.update(currentData, currentIndicator, correlationData);
        } catch (error) {
            console.error('Error loading correlation data:', error);
            await correlationChart.update(currentData, currentIndicator);
        }
    } else if (activeTab === 'comparison-tab') {
        await comparisonChart.update(currentData);
    } else if (activeTab === 'reading-tab') {
        await readingChart.update(currentData);
    }
}

/**
 * タブを切り替え
 */
function switchTab(tabName) {
    // タブボタンの状態を更新
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // タブコンテンツの表示を切り替え
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // チャートを更新
    updateCharts();
}

/**
 * 現在のチャートをダウンロード
 */
function downloadCurrentChart() {
    const activeTab = document.querySelector('.tab-content.active').id;
    let chartId = '';
    
    if (activeTab === 'timeseries-tab') {
        chartId = 'timeseries-chart';
    } else if (activeTab === 'correlation-tab') {
        chartId = 'correlation-chart';
    } else if (activeTab === 'comparison-tab') {
        chartId = 'comparison-chart';
    } else if (activeTab === 'reading-tab') {
        chartId = 'reading-chart';
    }
    
    if (chartId) {
        ChartDownloader.downloadChart(chartId, 'png');
    }
}

/**
 * 解説を読み込み
 */
async function loadExplanations() {
    const container = document.getElementById('indicator-explanations');
    if (!container) return;
    
    const explanations = {
        'gdp_growth_rate': {
            title: 'GDP成長率',
            description: '国内総生産（GDP）の前年比成長率を表します。',
            pros: [
                '経済の健全性を測る主要指標',
                '国際比較が容易',
                '短期的な経済動向を把握できる'
            ],
            cons: [
                '質的な側面（生活の質など）を反映しない',
                '環境への影響を考慮しない',
                '分配の公平性を示さない'
            ]
        },
        'gdp_per_capita_usd': {
            title: '一人当たりGDP',
            description: 'GDPを人口で割った値で、国民一人当たりの経済的豊かさを示します。',
            pros: [
                '生活水準の指標として有用',
                '国際比較が容易',
                '購買力平価で調整可能'
            ],
            cons: [
                '所得格差を反映しない',
                '非市場活動（家事労働など）を含まない',
                '物価水準の違いを完全には反映しない'
            ]
        }
    };
    
    let html = '';
    for (const [key, exp] of Object.entries(explanations)) {
        html += `
            <div class="indicator-explanation" data-indicator="${key}">
                <h3>${exp.title}</h3>
                <p>${exp.description}</p>
                <div class="pros-cons">
                    <div class="pros">
                        <h4>メリット</h4>
                        <ul>
                            ${exp.pros.map(p => `<li>${p}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="cons">
                        <h4>デメリット・注意点</h4>
                        <ul>
                            ${exp.cons.map(c => `<li>${c}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

/**
 * データソース情報を読み込み
 */
async function loadDataSources() {
    const container = document.getElementById('data-sources-list');
    if (!container) return;
    
    try {
        const metadata = await API.getMetadata();
        
        let html = '';
        for (const [key, meta] of Object.entries(metadata)) {
            html += `
                <div class="source-item">
                    <strong>${key.replace('_', ' ').toUpperCase()}</strong>
                    <p>${meta.description || 'N/A'}</p>
                    <p>期間: ${meta.year_range || 'N/A'}</p>
                    <p>データポイント数: ${meta.data_points || 'N/A'}</p>
                </div>
            `;
        }
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading data sources:', error);
        container.innerHTML = '<p>データソース情報の読み込みに失敗しました</p>';
    }
}

/**
 * エラーを表示
 */
function showError(message) {
    const container = document.querySelector('.container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = 'background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 4px; margin: 20px 0;';
    errorDiv.textContent = message;
    container.insertBefore(errorDiv, container.firstChild);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

