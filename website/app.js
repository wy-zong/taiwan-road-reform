/**
 * 台灣交通改革協作平台 - 互動地圖
 */

// ===== 全域變數 =====
let map;
let markers = [];
let allIssues = [];
let filteredIssues = [];

// 台灣縣市座標（用於地圖標記，當 Issue 沒有精確座標時使用）
const cityCoordinates = {
    '台北市': [25.0330, 121.5654],
    '新北市': [25.0120, 121.4650],
    '桃園市': [24.9936, 121.3010],
    '台中市': [24.1477, 120.6736],
    '台南市': [22.9998, 120.2270],
    '高雄市': [22.6273, 120.3014],
    '基隆市': [25.1276, 121.7392],
    '新竹市': [24.8015, 120.9715],
    '新竹縣': [24.8387, 121.0178],
    '苗栗縣': [24.5602, 120.8214],
    '彰化縣': [24.0518, 120.5161],
    '南投縣': [23.9609, 120.9719],
    '雲林縣': [23.7092, 120.4313],
    '嘉義市': [23.4801, 120.4491],
    '嘉義縣': [23.4518, 120.2555],
    '屏東縣': [22.5519, 120.5487],
    '宜蘭縣': [24.7021, 121.7378],
    '花蓮縣': [23.9872, 121.6016],
    '台東縣': [22.7583, 121.1444],
    '澎湖縣': [23.5711, 119.5793],
    '金門縣': [24.4493, 118.3767],
    '連江縣': [26.1505, 119.9499]
};

// 狀態顏色對應
const JITTER_RADIUS = 0.05;

const statusColors = {
    '待確認': '#f0ad4e',
    '已確認': '#0d6efd',
    '已陳情': '#6f42c1',
    '處理中': '#fd7e14',
    '已解決': '#198754',
    '無法解決': '#6c757d'
};

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    loadData();
    setupFilters();
    setupIssueListEvents();
});

// ===== 地圖初始化 =====
function initMap() {
    // 以台灣中心點初始化地圖
    map = L.map('map', {
        center: [23.5, 121],
        zoom: 7,
        zoomControl: true
    });
    
    // 使用 CartoDB 深色地圖圖層
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);
}

// ===== 載入資料 =====
async function loadData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        
        allIssues = data.issues || [];
        filteredIssues = [...allIssues];
        
        updateStats(data.stats);
        updateLastUpdated(data.lastUpdated);
        updateCityFilter();
        renderIssues();
        renderMarkers();
        
    } catch (error) {
        console.error('載入資料失敗:', error);
        document.getElementById('issues-list').innerHTML = 
            '<p class="no-issues">目前沒有任何問題回報<br>成為第一個回報者吧！</p>';
    }
}

// ===== 更新統計 =====
function updateStats(stats) {
    if (!stats) return;
    
    document.getElementById('stat-total').textContent = stats.total || 0;
    document.getElementById('stat-pending').textContent = stats.byStatus?.['待確認'] || 0;
    document.getElementById('stat-confirmed').textContent = stats.byStatus?.['已確認'] || 0;
    document.getElementById('stat-petitioned').textContent = stats.byStatus?.['已陳情'] || 0;
    document.getElementById('stat-processing').textContent = stats.byStatus?.['處理中'] || 0;
    document.getElementById('stat-resolved').textContent = stats.byStatus?.['已解決'] || 0;
}

// ===== 更新最後更新時間 =====
function updateLastUpdated(timestamp) {
    if (!timestamp) return;
    
    const date = new Date(timestamp);
    const formatted = date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    document.getElementById('last-updated').textContent = formatted;
}

// ===== 更新縣市篩選器 =====
function updateCityFilter() {
    const select = document.getElementById('filter-city');
    const cities = [...new Set(allIssues.map(i => i.city).filter(Boolean))];
    
    cities.sort();
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        select.appendChild(option);
    });
}

// ===== 設定篩選器 =====
function setupFilters() {
    const cityFilter = document.getElementById('filter-city');
    const statusFilter = document.getElementById('filter-status');
    const typeFilter = document.getElementById('filter-type');
    const resetBtn = document.getElementById('reset-filters');
    
    cityFilter.addEventListener('change', applyFilters);
    statusFilter.addEventListener('change', applyFilters);
    typeFilter.addEventListener('change', applyFilters);
    
    resetBtn.addEventListener('click', () => {
        cityFilter.value = '';
        statusFilter.value = '';
        typeFilter.value = '';
        applyFilters();
    });
}

// ===== 設定問題列表事件（事件委派） =====
function setupIssueListEvents() {
    const issuesList = document.getElementById('issues-list');
    if (!issuesList) return;

    issuesList.addEventListener('click', (event) => {
        const externalLink = event.target.closest('[data-action="open-external"]');
        if (externalLink) {
            // external link 交由瀏覽器開新分頁，避免觸發 card 聚焦
            event.stopPropagation();
            return;
        }

        const issueCard = event.target.closest('.issue-card[data-issue-id]');
        if (!issueCard || !issuesList.contains(issueCard)) return;

        const issueId = Number(issueCard.dataset.issueId);
        if (Number.isNaN(issueId)) return;

        focusIssue(issueId);
    });
}

// ===== 套用篩選 =====
function applyFilters() {
    const city = document.getElementById('filter-city').value;
    const status = document.getElementById('filter-status').value;
    const type = document.getElementById('filter-type').value;
    
    filteredIssues = allIssues.filter(issue => {
        if (city && issue.city !== city) return false;
        if (status && issue.status !== status) return false;
        if (type && issue.type !== type) return false;
        return true;
    });
    
    renderIssues();
    renderMarkers();
}

// ===== 渲染問題列表 =====
function renderIssues() {
    const container = document.getElementById('issues-list');
    const countEl = document.getElementById('issues-count');
    
    countEl.textContent = filteredIssues.length;
    
    if (filteredIssues.length === 0) {
        container.innerHTML = '<p class="no-issues">沒有符合條件的問題</p>';
        return;
    }
    
    // 依照建立時間排序（新的在前）
    const sorted = [...filteredIssues].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    container.innerHTML = sorted.map(issue => `
        <div class="issue-card" data-issue-id="${issue.id}">
            <div class="issue-card-header">
                <span class="issue-card-title">${escapeHtml(issue.title)}</span>
                <span class="issue-card-id">#${issue.id}</span>
            </div>
            <div class="issue-card-meta">
                <span class="issue-tag status status-${getStatusClass(issue.status)}">${issue.status}</span>
                ${issue.city ? `<span class="issue-tag city">${issue.city}</span>` : ''}
                ${issue.url ? `<a href="${escapeHtml(issue.url)}" target="_blank" rel="noopener noreferrer" data-action="open-external" class="issue-tag city">GitHub ↗</a>` : ''}
            </div>
        </div>
    `).join('');
}

// ===== 渲染地圖標記 =====
function renderMarkers() {
    // 清除現有標記
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    
    filteredIssues.forEach(issue => {
        // 取得座標（優先使用 Issue 座標，否則使用縣市中心）
        let coords = null;
        
        if (issue.coordinates && issue.coordinates.length === 2) {
            coords = issue.coordinates;
        } else if (issue.city && cityCoordinates[issue.city]) {
            // 對缺乏精確座標的資料使用「固定抖動」，避免同縣市標記完全重疊
            const base = cityCoordinates[issue.city];
            const jitter = getDeterministicJitter(issue.id, issue.city);
            coords = [base[0] + jitter[0], base[1] + jitter[1]];
        }
        
        if (!coords) return;
        
        // 建立自訂標記
        const color = statusColors[issue.status] || '#6c757d';
        const marker = L.circleMarker(coords, {
            radius: 8,
            fillColor: color,
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        });
        
        // 建立 Popup
        const popupContent = `
            <div class="popup-content">
                <div class="popup-title">${escapeHtml(issue.title)}</div>
                ${issue.location ? `<div class="popup-location">📍 ${escapeHtml(issue.location)}</div>` : ''}
                <div class="popup-tags">
                    <span class="issue-tag status status-${getStatusClass(issue.status)}">${issue.status}</span>
                    ${issue.city ? `<span class="issue-tag city">${issue.city}</span>` : ''}
                    ${issue.type ? `<span class="issue-tag city">${issue.type}</span>` : ''}
                </div>
                <a href="${issue.url}" target="_blank" class="popup-link">在 GitHub 查看 →</a>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        marker.issueId = issue.id;
        marker.addTo(map);
        markers.push(marker);
    });
}


function getDeterministicJitter(issueId, city) {
    const seed = `${city || ''}:${issueId || ''}`;
    const latJitter = (seededRandom(seed, 'lat') - 0.5) * JITTER_RADIUS;
    const lngJitter = (seededRandom(seed, 'lng') - 0.5) * JITTER_RADIUS;
    return [latJitter, lngJitter];
}

function seededRandom(seed, salt = '') {
    const input = `${seed}:${salt}`;
    let hash = 2166136261;

    for (let i = 0; i < input.length; i += 1) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }

    return (hash >>> 0) / 4294967295;
}

// ===== 聚焦到特定 Issue =====
function focusIssue(issueId) {
    const marker = markers.find(m => m.issueId === issueId);
    if (marker) {
        map.setView(marker.getLatLng(), 14);
        marker.openPopup();
    }
    
    // 也在新分頁開啟 GitHub Issue
    const issue = allIssues.find(i => i.id === issueId);
    if (issue && issue.url) {
        window.open(issue.url, '_blank');
    }
}

// ===== 工具函數 =====
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function getStatusClass(status) {
    const map = {
        '待確認': 'pending',
        '已確認': 'confirmed',
        '已陳情': 'petitioned',
        '處理中': 'processing',
        '已解決': 'resolved',
        '無法解決': 'unresolvable'
    };
    return map[status] || 'pending';
}
