import mapboxgl from 'mapbox-gl';
import { select } from './utils/dom';
import isMobile from './utils/isMobile';

window.onResize = (width) => {
  console.log(width);
};

window.enterView = (msg) => {
  console.log('enter-view', msg);
};

mapboxgl.accessToken = 'pk.eyJ1IjoiZGF0YXJrYWxsb28iLCJhIjoiY2toOXI3aW5kMDRlZTJ4cWt0MW5kaHg4eCJ9.V4NfOecIoFaErvFv_lfKLg';

const slider = select('#slider');
const activeDay = select('#active-day');
const activeHr = select('#active-hour');
const zoom = isMobile.any() ? 2 : 3;
const radiusFactor = isMobile.any() ? 0.3 : 0.5;

const map = new mapboxgl.Map({
  container: 'wallaroo-map',
  style: 'mapbox://styles/mapbox/dark-v9',
  center: [-95.7129, 37.0902],
  zoom,
  minZoom: zoom,
  maxZoom: 5,
});

const popup = new mapboxgl.Popup();

const convertToTime = (n) => {
  let h = Math.floor(n / 60) % 24;
  let m = n % 60;
  h = h < 10 ? `0${h}` : h;
  m = m < 10 ? `0${m}` : m;
  return `${h}:${m}`;
};

const makeMap = () => {
  let filterTime = ['==', ['get', 'Time'], 4890];
  let filterFlag = ['!=', ['get', 'flag'], 'whatever'];

  map.addLayer({
    id: 'routes',
    type: 'line',
    source: {
      type: 'geojson',
      data: './assets/lines.geojson',
    },
    paint: {
      'line-color': '#888',
      'line-width': 2,
    },
  });

  map.addLayer({
    id: 'cities',
    type: 'circle',
    source: {
      type: 'geojson',
      data: './assets/cities.geojson',
    },
    // layout: {
    //   'text-field': ['get', 'city'],
    //   'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
    //   'text-radial-offset': 0.5,
    //   'text-justify': 'auto',
    // },
    paint: {
      'circle-color': '#e2e2e2',
      'circle-radius': 7,
      'circle-stroke-width': 2,
      'circle-opacity': 0.6,
    },
  });

  map.addLayer({
    id: 'city-label',
    type: 'symbol',
    source: {
      type: 'geojson',
      data: './assets/cities.geojson',
    },
    layout: {
      'text-field': ['get', 'city'],
      'text-variable-anchor': ['top', 'right', 'bottom', 'left'],
      'text-radial-offset': 0.7,
      'text-justify': 'auto',
      'text-size': 12,
    },
    paint: {
      'text-color': '#ededed',
    },
  });

  map.addLayer({
    id: 'packages',
    type: 'circle',
    source: {
      type: 'geojson',
      data: './assets/packages.json',
    },
    paint: {
      'circle-radius': ['*', ['sqrt', ['number', ['get', 'Value']]], radiusFactor],
      'circle-color': [
        'case',
        ['==', ['get', 'flag'], 0], '#8dd3c7',
        ['==', ['get', 'flag'], 1], '#ffffb3',
        ['==', ['get', 'flag'], 1], '#fdc086',
        ['==', ['get', 'flag'], 3], '#fb8072',
        '#d3d3d3',
      ],
      'circle-stroke-color': '#ececec',
      'circle-stroke-width': 1.5,
      'circle-opacity': 0.8,
    },
    filter: ['all', filterTime, filterFlag],
  });

  map.moveLayer('place-city-lg-n');

  const { layers } = map.getStyle();
  layers.forEach((l) => {
    console.log(l.id);
  });

  activeDay.innerText = 'Now';
  activeHr.innerText = '09:30';

  map.on('click', 'packages', (e) => {
    const html = `
    <h4>Package #${e.features[0].properties.Package}</h4>
    <p>Route: ${e.features[0].properties.Route}</p>
    <p>Value: ${e.features[0].properties.Value}</p>
    <p>Delayed: ${e.features[0].properties.Delayed}</p>
    <p>Damaged: ${e.features[0].properties.Damaged}</p>`;

    popup
      .setLngLat(e.lngLat)
      .setHTML(html)
      .addTo(map);
  });

  map.on('mouseenter', 'packages', () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', 'packages', () => {
    map.getCanvas().style.cursor = '';
  });

  slider.addEventListener('input', (e) => {
    const m = +e.target.value;
    console.log(m);
    filterTime = ['==', ['get', 'Time'], m];
    const day = Math.floor(parseInt(m, 10) / 1440);

    activeDay.innerText = day > 2 ? 'Now' : `Now - ${Math.abs(day - 3)} days`;
    activeHr.innerText = convertToTime(+m);

    map.setFilter('packages', ['all', filterTime, filterFlag]);
  });

  document.getElementById('flag-select').addEventListener('change', (e) => {
    const flag = e.target.value;
    console.log(flag);
    if (flag === '0') {
      filterFlag = ['!=', ['get', 'flag'], 'whatever'];
    } else {
      filterFlag = ['==', ['get', 'flag'], +flag];
    }
    map.setFilter('packages', ['all', filterTime, filterFlag]);
  });
};

map.on('load', makeMap);
