import { getMap, setMap, getMarkers, setMarkers } from '../state.js';

const cityCoordinates = {
  '台北市': [25.0330, 121.5654], '新北市': [25.0120, 121.4650], '桃園市': [24.9936, 121.3010],
  '台中市': [24.1477, 120.6736], '台南市': [22.9998, 120.2270], '高雄市': [22.6273, 120.3014],
  '基隆市': [25.1276, 121.7392], '新竹市': [24.8015, 120.9715], '新竹縣': [24.8387, 121.0178],
  '苗栗縣': [24.5602, 120.8214], '彰化縣': [24.0518, 120.5161], '南投縣': [23.9609, 120.9719],
  '雲林縣': [23.7092, 120.4313], '嘉義市': [23.4801, 120.4491], '嘉義縣': [23.4518, 120.2555],
  '屏東縣': [22.5519, 120.5487], '宜蘭縣': [24.7021, 121.7378], '花蓮縣': [23.9872, 121.6016],
  '台東縣': [22.7583, 121.1444], '澎湖縣': [23.5711, 119.5793], '金門縣': [24.4493, 118.3767],
  '連江縣': [26.1505, 119.9499],
};

const statusColors = { '待確認': '#f0ad4e', '已確認': '#0d6efd', '已陳情': '#6f42c1', '處理中': '#fd7e14', '已解決': '#198754', '無法解決': '#6c757d' };

export function initMap() {
  const map = L.map('map', { center: [23.5, 121], zoom: 7, zoomControl: true });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd', maxZoom: 19,
  }).addTo(map);
  setMap(map);
}

export function renderMarkers(issues) {
  const map = getMap();
  getMarkers().forEach((m) => map.removeLayer(m));

  const nextMarkers = issues.map((issue) => {
    const coords = getIssueCoords(issue);
    if (!coords) return null;
    const marker = L.circleMarker(coords, {
      radius: 8, fillColor: statusColors[issue.status] || '#6c757d', color: '#ffffff', weight: 2, opacity: 1, fillOpacity: 0.8,
    });
    marker.issueId = issue.id;
    marker.bindPopup(buildPopup(issue));
    marker.addTo(map);
    return marker;
  }).filter(Boolean);

  setMarkers(nextMarkers);
}

export function focusIssue(issueId, issues) {
  const map = getMap();
  const marker = getMarkers().find((m) => m.issueId === issueId);
  if (marker) {
    map.setView(marker.getLatLng(), 14);
    marker.openPopup();
  }
  const issue = issues.find((i) => i.id === issueId);
  if (issue?.url) window.open(issue.url, '_blank');
}

function getIssueCoords(issue) {
  if (issue.coordinates?.length === 2) return issue.coordinates;
  if (issue.city && cityCoordinates[issue.city]) {
    const [lat, lng] = cityCoordinates[issue.city];
    const offset = () => (Math.random() - 0.5) * 0.05;
    return [lat + offset(), lng + offset()];
  }
  return null;
}

function buildPopup(issue) {
  return `<div class="popup-content"><div class="popup-title">${escapeHtml(issue.title)}</div>${issue.location ? `<div class="popup-location">📍 ${escapeHtml(issue.location)}</div>` : ''}<div class="popup-tags"><span class="issue-tag status status-${getStatusClass(issue.status)}">${issue.status}</span>${issue.city ? `<span class="issue-tag city">${issue.city}</span>` : ''}${issue.type ? `<span class="issue-tag city">${issue.type}</span>` : ''}</div><a href="${issue.url}" target="_blank" class="popup-link">在 GitHub 查看 →</a></div>`;
}

function escapeHtml(str) { const div = document.createElement('div'); div.textContent = str || ''; return div.innerHTML; }
function getStatusClass(status) { return ({ '待確認':'pending','已確認':'confirmed','已陳情':'petitioned','處理中':'processing','已解決':'resolved','無法解決':'unresolvable' })[status] || 'pending'; }
