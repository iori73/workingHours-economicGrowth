import { useState, useEffect, useCallback } from 'react';
import { useApi } from './hooks/useApi';
import { downloadChart } from './utils/chartDownloader';
import TimeSeriesChart from './components/charts/TimeSeriesChart';
import CorrelationChart from './components/charts/CorrelationChart';
import ComparisonChart from './components/charts/ComparisonChart';
import ReadingChart from './components/charts/ReadingChart';

const INDICATORS = [
  { key: 'gdp_growth_rate', label: 'GDP成長率' },
  { key: 'gdp_per_capita_usd', label: '一人当たりGDP' },
];

const EXPLANATIONS = {
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

const TAB_ITEMS = [
  { key: 'timeseries', label: '時系列グラフ' },
  { key: 'correlation', label: '相関分析' },
  { key: 'comparison', label: '国際比較' },
  { key: 'reading', label: '読書時間との関係' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('timeseries');
  const [indicator, setIndicator] = useState('gdp_growth_rate');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [data, setData] = useState([]);
  const [correlationData, setCorrelationData] = useState(null);
  const [metadata, setMetadata] = useState({});
  const [error, setError] = useState(null);

  const { loading, fetchData, fetchYearRange, fetchCorrelation, fetchMetadata } = useApi();

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const yearRange = await fetchYearRange();
        if (yearRange) {
          setStartYear(yearRange.min.toString());
          setEndYear(yearRange.max.toString());
        }

        const initialData = await fetchData();
        if (initialData) {
          setData(initialData);
        }

        const meta = await fetchMetadata();
        if (meta) {
          setMetadata(meta);
        }
      } catch (err) {
        setError('データの読み込みに失敗しました。バックエンドサーバーが起動しているか確認してください。');
      }
    };

    loadInitialData();
  }, [fetchData, fetchYearRange, fetchMetadata]);

  // Load correlation data when tab changes
  useEffect(() => {
    if (activeTab === 'correlation') {
      fetchCorrelation(indicator)
        .then(setCorrelationData)
        .catch(() => setCorrelationData(null));
    }
  }, [activeTab, indicator, fetchCorrelation]);

  const handleApplyFilters = useCallback(async () => {
    try {
      const filteredData = await fetchData({
        startYear: parseInt(startYear),
        endYear: parseInt(endYear),
        indicators: [indicator]
      });
      setData(filteredData);
      setError(null);
    } catch (err) {
      setError('フィルターの適用に失敗しました');
    }
  }, [fetchData, startYear, endYear, indicator]);

  const handleDownload = () => {
    const chartIds = {
      timeseries: 'timeseries-chart',
      correlation: 'correlation-chart',
      comparison: 'comparison-chart',
      reading: 'reading-chart'
    };
    downloadChart(chartIds[activeTab], 'png');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 tracking-tight mb-4">
            日本の労働時間と経済成長の可視化
          </h1>
          <p className="text-slate-600 text-base md:text-lg max-w-3xl mx-auto leading-relaxed mb-6">
            「なぜ働いていると本が読めなくなるのか」から考える労働時間と経済成長の関係
          </p>
          
          {/* Data source badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
            <span className="text-emerald-700 font-medium text-sm">✓ 実データ使用</span>
            <span className="text-slate-600 text-sm">
              厚生労働省・内閣府・総務省の公式統計
            </span>
          </div>
        </header>

        {/* Error message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Filter Controls */}
        <div className="mb-8 p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {/* Indicator Select */}
            <div>
              <label htmlFor="indicator" className="block text-sm font-medium text-slate-700 mb-2">
                経済指標
              </label>
              <select
                id="indicator"
                value={indicator}
                onChange={(e) => setIndicator(e.target.value)}
                className="w-full h-10 pl-3 pr-10 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 appearance-none bg-no-repeat bg-[length:16px_16px] bg-[position:right_12px_center] cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
              >
                {INDICATORS.map((ind) => (
                  <option key={ind.key} value={ind.key}>
                    {ind.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Year */}
            <div>
              <label htmlFor="startYear" className="block text-sm font-medium text-slate-700 mb-2">
                開始年
              </label>
              <input
                id="startYear"
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                min={1945}
                max={2024}
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
              />
            </div>

            {/* End Year */}
            <div>
              <label htmlFor="endYear" className="block text-sm font-medium text-slate-700 mb-2">
                終了年
              </label>
              <input
                id="endYear"
                type="number"
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
                min={1945}
                max={2024}
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="sm:col-span-2 flex gap-3">
              <button
                onClick={handleApplyFilters}
                disabled={loading}
                className="flex-1 h-10 px-4 font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '読込中...' : '適用'}
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 h-10 px-4 font-medium bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                ダウンロード
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">
            {TAB_ITEMS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <main className="mb-16">
          {loading && !data.length ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-slate-600 rounded-full"></div>
                <span className="ml-4 text-slate-600">データを読み込み中...</span>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="px-6 md:px-8 pt-6 md:pt-8 pb-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                  {activeTab === 'timeseries' && '労働時間と経済指標の推移'}
                  {activeTab === 'correlation' && '相関分析'}
                  {activeTab === 'comparison' && '国際比較'}
                  {activeTab === 'reading' && '読書時間との関係'}
                </h2>
              </div>
              <hr className="border-slate-200" />
              <div className="px-6 md:px-8 py-6">
                {activeTab === 'timeseries' && <TimeSeriesChart data={data} indicator={indicator} />}
                {activeTab === 'correlation' && (
                  <CorrelationChart 
                    data={data} 
                    indicator={indicator} 
                    correlationData={correlationData}
                  />
                )}
                {activeTab === 'comparison' && <ComparisonChart data={data} />}
                {activeTab === 'reading' && <ReadingChart data={data} />}
              </div>
            </div>
          )}
        </main>

        {/* Explanations Section */}
        <section className="mb-16">
          <div className="bg-slate-100 border border-slate-200 rounded-xl">
            <div className="px-6 md:px-8 pt-6 md:pt-8 pb-4">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">経済指標の解説</h2>
            </div>
            <hr className="border-slate-200" />
            <div className="px-6 md:px-8 py-6">
              <div className="grid gap-6 md:grid-cols-2">
                {Object.entries(EXPLANATIONS).map(([key, exp]) => (
                  <div 
                    key={key} 
                    className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm"
                  >
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">{exp.title}</h3>
                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">{exp.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                        <h4 className="text-sm font-semibold text-emerald-800 mb-2">メリット</h4>
                        <ul className="space-y-1.5">
                          {exp.pros.map((p, i) => (
                            <li key={i} className="text-xs text-emerald-700 flex items-start gap-1.5">
                              <span className="text-emerald-500 mt-0.5">•</span>
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-rose-50 rounded-lg p-4 border border-rose-100">
                        <h4 className="text-sm font-semibold text-rose-800 mb-2">注意点</h4>
                        <ul className="space-y-1.5">
                          {exp.cons.map((c, i) => (
                            <li key={i} className="text-xs text-rose-700 flex items-start gap-1.5">
                              <span className="text-rose-500 mt-0.5">•</span>
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Data Sources Section */}
        <section className="mb-16">
          <div className="bg-slate-100 border border-slate-200 rounded-xl">
            <div className="px-6 md:px-8 pt-6 md:pt-8 pb-4">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">データソース</h2>
            </div>
            <hr className="border-slate-200" />
            <div className="px-6 md:px-8 py-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(metadata).map(([key, meta]) => (
                  <div 
                    key={key} 
                    className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm"
                  >
                    <h3 className="text-sm font-semibold text-slate-800 mb-2 uppercase tracking-wide">
                      {key.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-slate-600 text-sm mb-3 leading-relaxed">{meta.description || 'N/A'}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                        {meta.year_range || 'N/A'}
                      </span>
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                        {meta.data_points || 0} データ
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-slate-200">
          <p className="text-slate-500 text-sm">
            この可視化は「なぜ働いていると本が読めなくなるのか」という本をきっかけに作成されました。
          </p>
        </footer>
      </div>
    </div>
  );
}
