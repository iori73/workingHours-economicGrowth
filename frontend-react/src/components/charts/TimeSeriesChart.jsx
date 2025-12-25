import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const INDICATOR_LABELS = {
  'gdp_growth_rate': 'GDP成長率（%）',
  'gdp_per_capita_usd': '一人当たりGDP（USD）'
};

export default function TimeSeriesChart({ data, indicator = 'gdp_growth_rate' }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0 || !containerRef.current) return;

    // Clear previous chart
    d3.select(containerRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 80, bottom: 60, left: 80 };
    const containerWidth = containerRef.current.clientWidth || 800;
    const width = containerWidth - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    // Filter data
    const filteredData = data.filter(d => 
      d.year && 
      d.hours_per_year !== null && 
      d[indicator] !== null
    );

    if (filteredData.length === 0) return;

    // Create SVG
    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    svgRef.current = svg.node();

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(filteredData, d => d.year))
      .range([0, width]);

    const yScale1 = d3.scaleLinear()
      .domain(d3.extent(filteredData, d => d.hours_per_year))
      .nice()
      .range([height, 0]);

    const yScale2 = d3.scaleLinear()
      .domain(d3.extent(filteredData, d => d[indicator]))
      .nice()
      .range([height, 0]);

    // Grid lines
    const yTicks = yScale1.ticks(5);
    g.selectAll('.grid-line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => yScale1(d))
      .attr('y2', d => yScale1(d))
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '3,3');

    // X axis
    g.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('d')))
      .append('text')
      .attr('x', width / 2)
      .attr('y', 45)
      .attr('fill', '#333')
      .style('text-anchor', 'middle')
      .text('年');

    // Y axis left (Labor hours)
    g.append('g')
      .attr('class', 'axis y-axis')
      .call(d3.axisLeft(yScale1))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -55)
      .attr('x', -height / 2)
      .attr('fill', '#ef4444')
      .style('text-anchor', 'middle')
      .text('労働時間（時間/年）');

    // Y axis right (Indicator)
    g.append('g')
      .attr('class', 'axis y-axis')
      .attr('transform', `translate(${width},0)`)
      .call(d3.axisRight(yScale2))
      .append('text')
      .attr('transform', 'rotate(90)')
      .attr('y', 55)
      .attr('x', height / 2)
      .attr('fill', '#3b82f6')
      .style('text-anchor', 'middle')
      .text(INDICATOR_LABELS[indicator] || indicator);

    // Labor hours line
    const line1 = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale1(d.hours_per_year))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(filteredData)
      .attr('fill', 'none')
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 2)
      .attr('d', line1);

    // Indicator line
    const line2 = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale2(d[indicator]))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(filteredData)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('d', line2);

    // Data points
    g.selectAll('.dot-labor')
      .data(filteredData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.year))
      .attr('cy', d => yScale1(d.hours_per_year))
      .attr('r', 3)
      .attr('fill', '#ef4444');

    g.selectAll('.dot-indicator')
      .data(filteredData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.year))
      .attr('cy', d => yScale2(d[indicator]))
      .attr('r', 3)
      .attr('fill', '#3b82f6');

    // Legend
    const legend = g.append('g')
      .attr('transform', `translate(${width - 150}, 10)`);

    const items = [
      { label: '労働時間', color: '#ef4444' },
      { label: INDICATOR_LABELS[indicator]?.split('（')[0] || indicator, color: '#3b82f6' }
    ];

    items.forEach((item, i) => {
      const itemGroup = legend.append('g')
        .attr('transform', `translate(0, ${i * 25})`);

      itemGroup.append('line')
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', item.color)
        .attr('stroke-width', 2);

      itemGroup.append('text')
        .attr('x', 25)
        .attr('y', 4)
        .attr('fill', '#333')
        .style('font-size', '14px')
        .text(item.label);
    });

    // Tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'rgba(0,0,0,0.85)')
      .style('color', 'white')
      .style('padding', '10px')
      .style('border-radius', '6px')
      .style('pointer-events', 'none')
      .style('font-size', '12px');

    g.selectAll('.dot')
      .on('mouseover', function(event, d) {
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip.html(`
          <strong>${d.year}年</strong><br/>
          労働時間: ${d.hours_per_year?.toFixed(0) || 'N/A'}時間<br/>
          ${INDICATOR_LABELS[indicator]?.split('（')[0] || indicator}: ${d[indicator]?.toFixed(2) || 'N/A'}
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        tooltip.transition().duration(500).style('opacity', 0);
      });

    return () => {
      tooltip.remove();
    };
  }, [data, indicator]);

  return (
    <div 
      id="timeseries-chart"
      ref={containerRef} 
      className="w-full min-h-[450px]"
    />
  );
}

