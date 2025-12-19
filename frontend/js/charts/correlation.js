/**
 * 相関分析チャートコンポーネント
 */

class CorrelationChart {
    constructor(containerId) {
        this.containerId = containerId;
        this.margin = { top: 20, right: 80, bottom: 60, left: 80 };
        this.width = 0;
        this.height = 0;
        this.svg = null;
        this.xScale = null;
        this.yScale = null;
        this.data = null;
        this.currentIndicator = 'gdp_growth_rate';
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
    
    async update(data, indicator = 'gdp_growth_rate', correlationData = null) {
        if (!this.svg) {
            this.init();
        }
        
        this.data = data;
        this.currentIndicator = indicator;
        
        // データをフィルタリング
        const filteredData = data.filter(d => 
            d.hours_per_year !== null && 
            d[indicator] !== null
        );
        
        if (filteredData.length === 0) {
            this.showMessage('データがありません');
            return;
        }
        
        // スケールを設定
        const hoursExtent = d3.extent(filteredData, d => d.hours_per_year);
        this.xScale = d3.scaleLinear()
            .domain(hoursExtent)
            .nice()
            .range([0, this.width]);
        
        const indicatorExtent = d3.extent(filteredData, d => d[indicator]);
        this.yScale = d3.scaleLinear()
            .domain(indicatorExtent)
            .nice()
            .range([this.height, 0]);
        
        // 既存の要素をクリア
        this.g.selectAll('*').remove();
        
        // グリッド線
        this.drawGrid();
        
        // 軸を描画
        this.drawAxes(indicator);
        
        // 散布図を描画
        this.drawScatter(filteredData, indicator);
        
        // 回帰線を描画
        if (correlationData) {
            this.drawRegressionLine(filteredData, indicator, correlationData);
        }
        
        // 相関統計を表示
        if (correlationData) {
            this.displayStats(correlationData);
        }
    }
    
    drawGrid() {
        const xTicks = this.xScale.ticks(5);
        const yTicks = this.yScale.ticks(5);
        
        // 縦のグリッド線
        this.g.selectAll('.grid-line-x')
            .data(xTicks)
            .enter()
            .append('line')
            .attr('class', 'grid-line grid-line-x')
            .attr('x1', d => this.xScale(d))
            .attr('x2', d => this.xScale(d))
            .attr('y1', 0)
            .attr('y2', this.height)
            .attr('stroke', '#e0e0e0')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '3,3');
        
        // 横のグリッド線
        this.g.selectAll('.grid-line-y')
            .data(yTicks)
            .enter()
            .append('line')
            .attr('class', 'grid-line grid-line-y')
            .attr('x1', 0)
            .attr('x2', this.width)
            .attr('y1', d => this.yScale(d))
            .attr('y2', d => this.yScale(d))
            .attr('stroke', '#e0e0e0')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '3,3');
    }
    
    drawAxes(indicator) {
        const xAxis = d3.axisBottom(this.xScale);
        const yAxis = d3.axisLeft(this.yScale);
        
        this.g.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${this.height})`)
            .call(xAxis)
            .append('text')
            .attr('x', this.width / 2)
            .attr('y', 45)
            .attr('fill', '#333')
            .style('text-anchor', 'middle')
            .text('労働時間（時間/年）');
        
        const indicatorLabels = {
            'gdp_growth_rate': 'GDP成長率（%）',
            'gdp_per_capita_usd': '一人当たりGDP（USD）',
            'labor_productivity': '労働生産性'
        };
        
        this.g.append('g')
            .attr('class', 'axis y-axis')
            .call(yAxis)
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -50)
            .attr('x', -this.height / 2)
            .attr('fill', '#333')
            .style('text-anchor', 'middle')
            .text(indicatorLabels[indicator] || indicator);
    }
    
    drawScatter(data, indicator) {
        this.g.selectAll('.dot')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('cx', d => this.xScale(d.hours_per_year))
            .attr('cy', d => this.yScale(d[indicator]))
            .attr('r', 4)
            .attr('fill', '#3498db')
            .attr('opacity', 0.6)
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .attr('r', 6)
                    .attr('opacity', 1);
            })
            .on('mouseout', function() {
                d3.select(this)
                    .attr('r', 4)
                    .attr('opacity', 0.6);
            });
    }
    
    drawRegressionLine(data, indicator, correlationData) {
        // 線形回帰の計算
        const n = data.length;
        const sumX = data.reduce((sum, d) => sum + d.hours_per_year, 0);
        const sumY = data.reduce((sum, d) => sum + d[indicator], 0);
        const sumXY = data.reduce((sum, d) => sum + d.hours_per_year * d[indicator], 0);
        const sumX2 = data.reduce((sum, d) => sum + d.hours_per_year * d.hours_per_year, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        // 回帰線の端点
        const xMin = d3.min(data, d => d.hours_per_year);
        const xMax = d3.max(data, d => d.hours_per_year);
        const yMin = slope * xMin + intercept;
        const yMax = slope * xMax + intercept;
        
        // 回帰線を描画
        this.g.append('line')
            .attr('class', 'regression-line')
            .attr('x1', this.xScale(xMin))
            .attr('y1', this.yScale(yMin))
            .attr('x2', this.xScale(xMax))
            .attr('y2', this.yScale(yMax))
            .attr('stroke', '#e74c3c')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5');
    }
    
    displayStats(correlationData) {
        const statsContainer = document.getElementById('correlation-stats');
        if (!statsContainer) return;
        
        const indicatorLabels = {
            'gdp_growth_rate': 'GDP成長率',
            'gdp_per_capita_usd': '一人当たりGDP',
            'labor_productivity': '労働生産性'
        };
        
        statsContainer.innerHTML = `
            <h3>相関分析結果: ${indicatorLabels[this.currentIndicator] || this.currentIndicator}</h3>
            <div class="stat-item">
                <span class="stat-label">ピアソンの相関係数:</span>
                <span class="stat-value">${correlationData.pearson_correlation.toFixed(4)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">P値:</span>
                <span class="stat-value">${correlationData.pearson_p_value.toFixed(4)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">サンプル数:</span>
                <span class="stat-value">${correlationData.n_samples}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">解釈:</span>
                <span class="stat-value">${this.interpretCorrelation(correlationData.pearson_correlation)}</span>
            </div>
        `;
    }
    
    interpretCorrelation(corr) {
        const absCorr = Math.abs(corr);
        if (absCorr < 0.1) return '無視できる';
        if (absCorr < 0.3) return '弱い';
        if (absCorr < 0.5) return '中程度';
        if (absCorr < 0.7) return '強い';
        return '非常に強い';
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

