import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function ComparisonChart({ data }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    d3.select(containerRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 80, bottom: 60, left: 80 };
    const containerWidth = containerRef.current.clientWidth || 800;
    const width = containerWidth - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#666')
      .style('font-size', '16px')
      .text('国際比較データは準備中です');

    g.append('text')
      .attr('x', width / 2)
      .attr('y', height / 2 + 30)
      .attr('text-anchor', 'middle')
      .attr('fill', '#999')
      .style('font-size', '14px')
      .text('OECDデータから他国のデータを取得する必要があります');

  }, [data]);

  return (
    <div 
      id="comparison-chart"
      ref={containerRef} 
      className="w-full min-h-[450px]"
    />
  );
}

