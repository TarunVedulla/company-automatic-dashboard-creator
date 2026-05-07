// ====================== STATE ======================
let allData = [];
let filteredData = [];
let aiSummaries = {};
let lastFileRef = null;
let fileHandle = null;
let realtimeTimer = null;

let activeCharts = new Set(['bar-revenue','pie-industry','scatter','bar-employees','line-revenue','horizontal','radar','ai-table']);

const COLORS = ['#4f8ef7','#f87171','#34d399','#fbbf24','#a78bfa','#fb923c','#38bdf8','#4ade80'];

const PLOTLY_LAYOUT = {
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent',
  font: { family: 'DM Sans', color: '#8b92b8', size: 11 },
  margin: { t:20, b:40, l:50, r:20 },
  xaxis: { gridcolor:'#2e3352', zerolinecolor:'#2e3352', tickfont:{color:'#8b92b8'} },
  yaxis: { gridcolor:'#2e3352', zerolinecolor:'#2e3352', tickfont:{color:'#8b92b8'} },
  legend: { font:{color:'#8b92b8'}, bgcolor:'transparent' },
  hoverlabel: { bgcolor:'#1a1d27', bordercolor:'#4f8ef7', font:{color:'#e8eaf6'} }
};

const PLOTLY_CFG = { responsive:true, displayModeBar:false };

// ====================== FILE & CSV ======================
function loadFile(file) {
  lastFileRef = file;
  const reader = new FileReader();
  reader.onload = e => parseCSV(e.target.result, file.name);
  reader.readAsText(file);
}

function downloadSampleCSV() {
  const csv = `name,industry,size,revenue_eur,employees
Enpal,Solar Energy,Large,5000000,1250
Lieferando,Food Delivery,Large,8000000,5000
Pliant,Fintech,Medium,2000000,250`;
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample_companies.csv';
  a.click();
}

function parseCSV(text, filename) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return showFileError('CSV is empty');

  // Dynamic header parsing
  const rawHeaders = lines[0].split(',').map(h => h.trim());
  const headers = rawHeaders.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};

    headers.forEach((header, index) => {
      const value = values[index] || '';

      // Dynamic column mapping
      if (header.includes('name') || header.includes('company')) {
        row.name = value;
      } 
      else if (header.includes('industry') || header.includes('sector')) {
        row.industry = value;
      } 
      else if (header.includes('size') || header.includes('stage') || header.includes('type')) {
        row.size = value;
      } 
      else if (header.includes('revenue') || header.includes('turnover') || header.includes('sales')) {
        row.revenue_eur = parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
      } 
      else if (header.includes('employee') || header.includes('staff') || header.includes('headcount')) {
        row.employees = parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
      } 
      else {
        // Store any other column
        row[header] = value;
      }
    });

    console.log("Detected columns:", Object.keys(rows[0] || {}));

    // Fallbacks
    if (!row.name) row.name = `Company ${i}`;
    if (!row.industry) row.industry = 'Unknown';
    if (!row.size) row.size = 'Medium';

    row.revenue_eur = row.revenue_eur || 0;
    row.employees = row.employees || 0;

    if (row.name) rows.push(row);
  }

  if (rows.length === 0) {
    return showFileError('No valid data rows found');
  }

  allData = rows;
  
  showFileOK(`✅ Loaded ${rows.length} companies from ${filename}<br><small>Dynamic columns detected</small>`);
  
  updateCompanyFilter();
  applyFilter();
  updateStats();
  
  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('dashboard-content').style.display = 'block';

  // Persist data
  localStorage.setItem('companyAnalyzer_data', JSON.stringify(allData));
}

// Add all other functions: renderHorizontal, generateAI, toggleRealtime, setBgImage, etc.

window.addEventListener('load', () => {
  const savedBg = localStorage.getItem('companyAnalyzer_bg');
  if (savedBg) {
    document.body.style.backgroundImage = savedBg;
    document.body.setAttribute('has-bg-image', 'true');
  }

  const savedData = localStorage.getItem('companyAnalyzer_data');
  if (savedData) {
    allData = JSON.parse(savedData);
    filteredData = [...allData];
    updateCompanyFilter();
    applyFilter();
    updateStats();
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('dashboard-content').style.display = 'block';
  }
});
