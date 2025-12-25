import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const INDICATOR_LABELS = {
  'gdp_growth_rate': 'GDP成長率（%）',
  'gdp_per_capita_usd': '一人当たりGDP（USD）',
  'labor_productivity': '労働生産性'
};

export default function CorrelationChart({ data, indicator = 'gdp_growth_rate', correlationData }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0 || !containerRef.current) return;

    d3.select(containerRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 80, bottom: 60, left: 80 };
    const containerWidth = containerRef.current.clientWidth || 800;
    const width = containerWidth - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    const filteredData = data.filter(d => 
      d.hours_per_year !== null && 
      d[indicator] !== null
    );

    if (filteredData.length === 0) return;

    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(filteredData, d => d.hours_per_year))
      .nice()
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(filteredData, d => d[indicator]))
      .nice()
      .range([height, 0]);

    // Grid
    const xTicks = xScale.ticks(5);
    const yTicks = yScale.ticks(5);

    g.selectAll('.grid-line-x')
      .data(xTicks)
      .enter()
      .append('line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '3,3');

    g.selectAll('.grid-line-y')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '3,3');

    // Axes
    g.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .append('text')
      .attr('x', width / 2)
      .attr('y', 45)
      .attr('fill', '#333')
      .style('text-anchor', 'middle')
      .text('労働時間（時間/年）');

    g.append('g')
      .attr('class', 'axis y-axis')
      .call(d3.axisLeft(yScale))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -55)
      .attr('x', -height / 2)
      .attr('fill', '#333')
      .style('text-anchor', 'middle')
      .text(INDICATOR_LABELS[indicator] || indicator);

    // Scatter points
    g.selectAll('.dot')
      .data(filteredData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.hours_per_year))
      .attr('cy', d => yScale(d[indicator]))
      .attr('r', 5)
      .attr('fill', '#3b82f6')
      .attr('opacity', 0.6)
      .on('mouseover', function() {
        d3.select(this).attr('r', 7).attr('opacity', 1);
      })
      .on('mouseout', function() {
        d3.select(this).attr('r', 5).attr('opacity', 0.6);
      });

    // Regression line
    if (correlationData) {
      const n = filteredData.length;
      const sumX = filteredData.reduce((sum, d) => sum + d.hours_per_year, 0);
      const sumY = filteredData.reduce((sum, d) => sum + d[indicator], 0);
      const sumXY = filteredData.reduce((sum, d) => sum + d.hours_per_year * d[indicator], 0);
      const sumX2 = filteredData.reduce((sum, d) => sum + d.hours_per_year * d.hours_per_year, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      const xMin = d3.min(filteredData, d => d.hours_per_year);
      const xMax = d3.max(filteredData, d => d.hours_per_year);

      g.append('line')
        .attr('x1', xScale(xMin))
        .attr('y1', yScale(slope * xMin + intercept))
        .attr('x2', xScale(xMax))
        .attr('y2', yScale(slope * xMax + intercept))
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');
    }

  }, [data, indicator, correlationData]);

  const interpretCorrelation = (corr) => {
    const absCorr = Math.abs(corr);
    if (absCorr < 0.1) return '無視できる';
    if (absCorr < 0.3) return '弱い';
    if (absCorr < 0.5) return '中程度';
    if (absCorr < 0.7) return '強い';
    return '非常に強い';
  };

  return (
    <div className="space-y-8">
      <div 
        id="correlation-chart"
        ref={containerRef} 
        className="w-full min-h-[450px] mb-6"
      />
      {correlationData && (
        <div className="bg-default-100 rounded-xl p-8 space-y-4">
          <h3 className="text-xl font-semibold mb-6">
            相関分析結果: {INDICATOR_LABELS[indicator]?.split('（')[0] || indicator}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <span className="text-default-500 text-sm block">ピアソン相関係数</span>
              <p className="text-2xl font-bold text-primary">
                {correlationData.pearson_correlation?.toFixed(4)}
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-default-500 text-sm block">P値</span>
              <p className="text-2xl font-bold">
                {correlationData.pearson_p_value?.toFixed(4)}
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-default-500 text-sm block">サンプル数</span>
              <p className="text-2xl font-bold">
                {correlationData.n_samples}
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-default-500 text-sm block">解釈</span>
              <p className="text-2xl font-bold text-secondary">
                {interpretCorrelation(correlationData.pearson_correlation)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

