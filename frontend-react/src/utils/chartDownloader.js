export function downloadAsPNG(svgElement, filename = 'chart.png') {
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  img.onload = function() {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    canvas.toBlob(function(blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    });
  };
  
  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
}

export function downloadAsSVG(svgElement, filename = 'chart.svg') {
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const blob = new Blob([svgData], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadChart(containerId, format = 'png', filename = null) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container ${containerId} not found`);
    return;
  }
  
  const svg = container.querySelector('svg');
  if (!svg) {
    console.error('SVG element not found');
    return;
  }
  
  const defaultFilename = filename || `chart_${new Date().getTime()}.${format}`;
  
  if (format === 'png') {
    downloadAsPNG(svg, defaultFilename);
  } else if (format === 'svg') {
    downloadAsSVG(svg, defaultFilename);
  } else {
    console.error(`Unsupported format: ${format}`);
  }
}

