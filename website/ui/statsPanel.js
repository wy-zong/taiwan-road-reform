export function renderStats(stats) {
  const safe = stats || {};
  const byStatus = safe.byStatus || {};
  document.getElementById('stat-total').textContent = safe.total || 0;
  document.getElementById('stat-pending').textContent = byStatus['待確認'] || 0;
  document.getElementById('stat-confirmed').textContent = byStatus['已確認'] || 0;
  document.getElementById('stat-petitioned').textContent = byStatus['已陳情'] || 0;
  document.getElementById('stat-processing').textContent = byStatus['處理中'] || 0;
  document.getElementById('stat-resolved').textContent = byStatus['已解決'] || 0;
}

export function renderLastUpdated(timestamp) {
  if (!timestamp) {
    document.getElementById('last-updated').textContent = '-';
    return;
  }
  const formatted = new Date(timestamp).toLocaleString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });
  document.getElementById('last-updated').textContent = formatted;
}
