const state = {
  issues: [],
  filters: { city: '', status: '', type: '' },
  markers: [],
  map: null,
};

export function getIssues() {
  return state.issues;
}

export function setIssues(issues) {
  state.issues = Array.isArray(issues) ? issues : [];
}

export function getFilters() {
  return { ...state.filters };
}

export function setFilters(nextFilters) {
  state.filters = { ...state.filters, ...nextFilters };
}

export function resetFilters() {
  state.filters = { city: '', status: '', type: '' };
}

export function getMarkers() {
  return state.markers;
}

export function setMarkers(markers) {
  state.markers = Array.isArray(markers) ? markers : [];
}

export function getMap() {
  return state.map;
}

export function setMap(map) {
  state.map = map;
}
