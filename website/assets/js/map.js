import { clearElement, createElement, createExternalLink } from './dom.js';

function statusDefinition(issue, taxonomy) {
    return taxonomy.statuses.find((status) => status.value === issue.status)
        || taxonomy.statuses[0];
}

function createPopupTag(text, className = 'city') {
    return createElement('span', { className: `issue-tag ${className}`, text });
}

function createIssuePopup(issue, taxonomy) {
    const status = statusDefinition(issue, taxonomy);
    const tags = createElement('div', { className: 'popup-tags' }, [
        createPopupTag(issue.status, `status status-${status.cssClass}`),
        issue.city ? createPopupTag(issue.city) : null,
        issue.type ? createPopupTag(issue.type, 'type') : null
    ]);
    const links = createElement('div', { className: 'popup-links' }, [
        issue.url ? createExternalLink(issue.url, '在 GitHub 查看 →', 'popup-link') : null,
        issue.mapUrl ? createExternalLink(issue.mapUrl, '開啟地圖 →', 'popup-link') : null
    ]);

    return createElement('div', { className: 'popup-content' }, [
        createElement('strong', { className: 'popup-title', text: issue.title }),
        issue.location ? createElement('p', { className: 'popup-location', text: `📍 ${issue.location}` }) : null,
        tags,
        links
    ]);
}

function createCityPopup(city, issues) {
    const list = createElement('ul', { className: 'popup-issue-list' });
    for (const issue of issues.slice(0, 8)) {
        list.append(createElement('li', {}, [
            issue.url ? createExternalLink(issue.url, `#${issue.id} ${issue.title}`, 'popup-link') : null
        ]));
    }

    return createElement('div', { className: 'popup-content' }, [
        createElement('strong', { className: 'popup-title', text: `${city}：${issues.length} 筆` }),
        createElement('p', {
            className: 'popup-location',
            text: '這些案件沒有精確座標，標記僅代表縣市範圍。'
        }),
        list
    ]);
}

export function createIssueMap(taxonomy) {
    const map = L.map('map', {
        center: [23.7, 121],
        zoom: 7,
        zoomControl: true
    });
    const layer = L.layerGroup().addTo(map);
    const markerByIssueId = new Map();
    const cityCoordinates = new Map(taxonomy.cities.map((city) => [city.name, city.coordinates]));

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    function addExactMarker(issue) {
        const status = statusDefinition(issue, taxonomy);
        const marker = L.circleMarker(issue.coordinates, {
            radius: 8,
            fillColor: `#${status.color}`,
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.85
        }).bindPopup(createIssuePopup(issue, taxonomy));
        marker.addTo(layer);
        markerByIssueId.set(issue.id, { marker, precision: 'exact' });
    }

    function addCityMarker(city, issues) {
        const coordinates = cityCoordinates.get(city);
        if (!coordinates) return;

        const radius = Math.min(20, 9 + Math.log2(issues.length + 1) * 3);
        const marker = L.circleMarker(coordinates, {
            radius,
            fillColor: '#58a6ff',
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.75
        }).bindPopup(createCityPopup(city, issues));
        marker.addTo(layer);
        for (const issue of issues) markerByIssueId.set(issue.id, { marker, precision: 'city' });
    }

    return {
        render(issues) {
            layer.clearLayers();
            markerByIssueId.clear();
            const approximateByCity = new Map();

            for (const issue of issues) {
                if (Array.isArray(issue.coordinates) && issue.coordinates.length === 2) {
                    addExactMarker(issue);
                } else if (issue.city) {
                    const cityIssues = approximateByCity.get(issue.city) || [];
                    cityIssues.push(issue);
                    approximateByCity.set(issue.city, cityIssues);
                }
            }

            for (const [city, cityIssues] of approximateByCity) addCityMarker(city, cityIssues);
        },
        focus(issueId) {
            const item = markerByIssueId.get(issueId);
            if (!item) return false;
            map.setView(item.marker.getLatLng(), item.precision === 'exact' ? 16 : 10);
            item.marker.openPopup();
            return true;
        },
        invalidateSize() {
            map.invalidateSize();
        }
    };
}

export function renderLegend(taxonomy) {
    const legend = document.getElementById('map-legend');
    clearElement(legend);
    legend.append(createElement('h3', { text: '圖例' }));

    for (const status of taxonomy.statuses) {
        const dot = createElement('span', { className: 'legend-marker' });
        dot.style.backgroundColor = `#${status.color}`;
        legend.append(createElement('div', { className: 'legend-item' }, [dot, document.createTextNode(status.value)]));
    }

    const cityDot = createElement('span', { className: 'legend-marker approximate' });
    legend.append(createElement('div', { className: 'legend-item' }, [cityDot, document.createTextNode('縣市彙總位置')]));
}
