/**
 * 読書時間チャートコンポーネント
 */

class ReadingChart {
    constructor(containerId) {
        this.containerId = containerId;
        this.margin = { top: 20, right: 80, bottom: 60, left: 80 };
        this.width = 0;
        this.height = 0;
        this.svg = null;
    }
    
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
        
        this.svg = container
            .append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom);
        
        this.g = this.svg
            .append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
    }
    
    async update(data) {
        if (!this.svg) {
            this.init();
        }
        
        // 読書時間データをフィルタリング
        const filteredData = data.filter(d => 
            d.year && 
            d.hours_per_year !== null && 
            d.reading_minutes_per_day !== null
        );
        
        if (filteredData.length === 0) {
            this.showMessage('読書時間データがありません');
            return;
        }
        
        // スケールを設定
        const xScale = d3.scaleLinear()
            .domain(d3.extent(filteredData, d => d.year))
            .range([0, this.width]);
        
        const yScale1 = d3.scaleLinear()
            .domain(d3.extent(filteredData, d => d.hours_per_year))
            .nice()
            .range([this.height, 0]);
        
        const yScale2 = d3.scaleLinear()
            .domain(d3.extent(filteredData, d => d.reading_minutes_per_day))
            .nice()
            .range([this.height, 0]);
        
        // 既存の要素をクリア
        this.g.selectAll('*').remove();
        
        // 軸を描画
        const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
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
        
        const yAxis1 = d3.axisLeft(yScale1);
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
        
        const yAxis2 = d3.axisRight(yScale2);
        this.g.append('g')
            .attr('class', 'axis y-axis y-axis-right')
            .attr('transform', `translate(${this.width},0)`)
            .call(yAxis2)
            .append('text')
            .attr('transform', 'rotate(90)')
            .attr('y', 50)
            .attr('x', this.height / 2)
            .attr('fill', '#9b59b6')
            .style('text-anchor', 'middle')
            .text('読書時間（分/日）');
        
        // 労働時間のライン
        const line1 = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale1(d.hours_per_year))
            .curve(d3.curveMonotoneX);
        
        this.g.append('path')
            .datum(filteredData)
            .attr('class', 'line labor-hours-line')
            .attr('d', line1)
            .attr('fill', 'none')
            .attr('stroke', '#e74c3c')
            .attr('stroke-width', 2);
        
        // 読書時間のライン
        const line2 = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale2(d.reading_minutes_per_day))
            .curve(d3.curveMonotoneX);
        
        this.g.append('path')
            .datum(filteredData)
            .attr('class', 'line reading-line')
            .attr('d', line2)
            .attr('fill', 'none')
            .attr('stroke', '#9b59b6')
            .attr('stroke-width', 2);
        
        // 凡例
        const legend = this.g.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${this.width - 150}, 20)`);
        
        const items = [
            { label: '労働時間', color: '#e74c3c' },
            { label: '読書時間', color: '#9b59b6' }
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

