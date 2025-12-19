/**
 * 国際比較チャートコンポーネント
 */

class ComparisonChart {
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
        
        // 国際比較データは現在サンプルデータのみ
        // 実際の実装では、OECDデータから他国のデータも取得する必要がある
        this.showMessage('国際比較データは準備中です。実際のデータソースから他国のデータを取得する必要があります。');
    }
    
    showMessage(message) {
        if (!this.svg) return;
        
        this.g.selectAll('*').remove();
        this.g.append('text')
            .attr('x', this.width / 2)
            .attr('y', this.height / 2)
            .attr('text-anchor', 'middle')
            .attr('fill', '#999')
            .style('font-size', '16px')
            .text(message);
    }
}

