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

function parseCSV(text, filename) {
  // ... (your full parseCSV function from original) ...
  allData = rows;
  filteredData = [...allData];
  showFileOK(`✅ Loaded ${rows.length} companies from ${filename}`);
  updateCompanyFilter();
  applyFilter();
  updateStats();
  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('dashboard-content').style.display = 'block';
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
