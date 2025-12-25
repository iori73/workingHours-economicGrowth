import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function ReadingChart({ data }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0 || !containerRef.current) return;

    d3.select(containerRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 80, bottom: 60, left: 80 };
    const containerWidth = containerRef.current.clientWidth || 800;
    const width = containerWidth - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    const filteredData = data.filter(d => 
      d.year && 
      d.hours_per_year !== null && 
      d.reading_minutes_per_day !== null
    );

    if (filteredData.length === 0) {
      const svg = d3.select(containerRef.current)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

      svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)
        .append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#666')
        .style('font-size', '16px')
        .text('読書時間データがありません');
      return;
    }

    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

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
      .domain(d3.extent(filteredData, d => d.reading_minutes_per_day))
      .nice()
      .range([height, 0]);

    // Axes
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

    g.append('g')
      .attr('class', 'axis y-axis')
      .attr('transform', `translate(${width},0)`)
      .call(d3.axisRight(yScale2))
      .append('text')
      .attr('transform', 'rotate(90)')
      .attr('y', 55)
      .attr('x', height / 2)
      .attr('fill', '#8b5cf6')
      .style('text-anchor', 'middle')
      .text('読書時間（分/日）');

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

    // Reading time line
    const line2 = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale2(d.reading_minutes_per_day))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(filteredData)
      .attr('fill', 'none')
      .attr('stroke', '#8b5cf6')
      .attr('stroke-width', 2)
      .attr('d', line2);

    // Legend
    const legend = g.append('g')
      .attr('transform', `translate(${width - 120}, 10)`);

    const items = [
      { label: '労働時間', color: '#ef4444' },
      { label: '読書時間', color: '#8b5cf6' }
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

  }, [data]);

  return (
    <div 
      id="reading-chart"
      ref={containerRef} 
      className="w-full min-h-[450px]"
    />
  );
}

