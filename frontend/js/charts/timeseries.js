/**
 * 時系列グラフコンポーネント
 */

class TimeSeriesChart {
    constructor(containerId) {
        this.containerId = containerId;
        this.margin = { top: 20, right: 80, bottom: 60, left: 80 };
        this.width = 0;
        this.height = 0;
        this.svg = null;
        this.xScale = null;
        this.yScale1 = null; // 労働時間用
        this.yScale2 = null; // 経済指標用
        this.data = null;
        this.currentIndicator = 'gdp_growth_rate';
    }
    
    /**
     * グラフを初期化
     */
    init() {
        const container = d3.select(`#${this.containerId}`);
        const containerNode = container.node();
        
        if (!containerNode) {
            console.error(`Container ${this.containerId} not found`);
            return;
        }
        
        const containerWidth = containerNode.clientWidth || 800;
        this.width = containerWidth - this.margin.left - this.margin.right;
        this.height = 500 - this.margin.top - this.margin.bottom;
        
        // SVGを作成
        this.svg = container
            .append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom);
        
        this.g = this.svg
            .append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
    }
    
    /**
     * データを更新してグラフを描画
     */
    async update(data, indicator = 'gdp_growth_rate') {
        if (!this.svg) {
            this.init();
        }
        
        this.data = data;
        this.currentIndicator = indicator;
        
        // データをフィルタリング（欠損値を除外）
        const filteredData = data.filter(d => 
            d.year && 
            d.hours_per_year !== null && 
            d[indicator] !== null
        );
        
        if (filteredData.length === 0) {
            this.showMessage('データがありません');
            return;
        }
        
        // スケールを設定
        this.xScale = d3.scaleLinear()
            .domain(d3.extent(filteredData, d => d.year))
            .range([0, this.width]);
        
        const hoursExtent = d3.extent(filteredData, d => d.hours_per_year);
        this.yScale1 = d3.scaleLinear()
            .domain(hoursExtent)
            .nice()
            .range([this.height, 0]);
        
        const indicatorExtent = d3.extent(filteredData, d => d[indicator]);
        this.yScale2 = d3.scaleLinear()
            .domain(indicatorExtent)
            .nice()
            .range([this.height, 0]);
        
        // 既存の要素をクリア
        this.g.selectAll('*').remove();
        
        // グリッド線
        this.drawGrid();
        
        // 軸を描画
        this.drawAxes(filteredData, indicator);
        
        // ラインを描画
        this.drawLines(filteredData, indicator);
        
        // 凡例
        this.drawLegend(indicator);
        
        // ツールチップ
        this.addTooltip(filteredData, indicator);
    }
    
    /**
     * グリッド線を描画
     */
    drawGrid() {
        // 横のグリッド線
        const yTicks = this.yScale1.ticks(5);
        this.g.selectAll('.grid-line')
            .data(yTicks)
            .enter()
            .append('line')
            .attr('class', 'grid-line')
            .attr('x1', 0)
            .attr('x2', this.width)
            .attr('y1', d => this.yScale1(d))
            .attr('y2', d => this.yScale1(d))
            .attr('stroke', '#e0e0e0')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '3,3');
    }
    
    /**
     * 軸を描画
     */
    drawAxes(data, indicator) {
        // X軸
        const xAxis = d3.axisBottom(this.xScale)
            .tickFormat(d3.format('d'));
        
        this.g.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${this.height})`)
            .call(xAxis)
            .append('text')
            .attr('x', this.width / 2)
            .attr('y', 45)
            .attr('fill', '#333')
            .style('text-anchor', 'middle')
            .text('年');
        
        // Y軸（左：労働時間）
        const yAxis1 = d3.axisLeft(this.yScale1)
            .tickFormat(d3.format('d'));
        
        this.g.append('g')
            .attr('class', 'axis y-axis y-axis-left')
            .call(yAxis1)
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -50)
            .attr('x', -this.height / 2)
            .attr('fill', '#e74c3c')
            .style('text-anchor', 'middle')
            .text('労働時間（時間/年）');
        
        // Y軸（右：経済指標）
        const yAxis2 = d3.axisRight(this.yScale2);
        
        const indicatorLabels = {
            'gdp_growth_rate': 'GDP成長率（%）',
            'gdp_per_capita_usd': '一人当たりGDP（USD）'
        };
        
        this.g.append('g')
            .attr('class', 'axis y-axis y-axis-right')
            .attr('transform', `translate(${this.width},0)`)
            .call(yAxis2)
            .append('text')
            .attr('transform', 'rotate(90)')
            .attr('y', 50)
            .attr('x', this.height / 2)
            .attr('fill', '#3498db')
            .style('text-anchor', 'middle')
            .text(indicatorLabels[indicator] || indicator);
    }
    
    /**
     * ラインを描画
     */
    drawLines(data, indicator) {
        // 労働時間のライン
        const line1 = d3.line()
            .x(d => this.xScale(d.year))
            .y(d => this.yScale1(d.hours_per_year))
            .curve(d3.curveMonotoneX);
        
        this.g.append('path')
            .datum(data)
            .attr('class', 'line labor-hours-line')
            .attr('d', line1)
            .attr('fill', 'none')
            .attr('stroke', '#e74c3c')
            .attr('stroke-width', 2);
        
        // 経済指標のライン
        const line2 = d3.line()
            .x(d => this.xScale(d.year))
            .y(d => this.yScale2(d[indicator]))
            .curve(d3.curveMonotoneX);
        
        this.g.append('path')
            .datum(data)
            .attr('class', 'line economic-line')
            .attr('d', line2)
            .attr('fill', 'none')
            .attr('stroke', '#3498db')
            .attr('stroke-width', 2);
        
        // データポイント
        this.g.selectAll('.dot-labor')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'dot dot-labor')
            .attr('cx', d => this.xScale(d.year))
            .attr('cy', d => this.yScale1(d.hours_per_year))
            .attr('r', 3)
            .attr('fill', '#e74c3c');
        
        this.g.selectAll('.dot-economic')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'dot dot-economic')
            .attr('cx', d => this.xScale(d.year))
            .attr('cy', d => this.yScale2(d[indicator]))
            .attr('r', 3)
            .attr('fill', '#3498db');
    }
    
    /**
     * 凡例を描画
     */
    drawLegend(indicator) {
        const legend = this.g.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${this.width - 150}, 20)`);
        
        const indicatorLabels = {
            'gdp_growth_rate': 'GDP成長率',
            'gdp_per_capita_usd': '一人当たりGDP'
        };
        
        const items = [
            { label: '労働時間', color: '#e74c3c' },
            { label: indicatorLabels[indicator] || indicator, color: '#3498db' }
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
    }
    
    /**
     * ツールチップを追加
     */
    addTooltip(data, indicator) {
        const tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background', 'rgba(0,0,0,0.8)')
            .style('color', 'white')
            .style('padding', '10px')
            .style('border-radius', '4px')
            .style('pointer-events', 'none');
        
        const dots = this.g.selectAll('.dot-labor, .dot-economic');
        
        dots
            .on('mouseover', function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style('opacity', 0.9);
                tooltip.html(`
                    <strong>${d.year}年</strong><br/>
                    労働時間: ${d.hours_per_year.toFixed(0)}時間<br/>
                    ${indicator}: ${d[indicator] !== null ? d[indicator].toFixed(2) : 'N/A'}
                `)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px');
            })
            .on('mouseout', function() {
                tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            });
    }
    
    /**
     * メッセージを表示
     */
    showMessage(message) {
        if (!this.svg) return;
        
        this.g.selectAll('*').remove();
        this.g.append('text')
            .attr('x', this.width / 2)
            .attr('y', this.height / 2)
            .attr('text-anchor', 'middle')
            .attr('fill', '#999')
            .style('font-size', '18px')
            .text(message);
    }
}

