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

const map = new mapboxgl.Map({
  container: 'wallaroo-map',
  style: 'mapbox://styles/mapbox/dark-v9',
  center: [-95.7129, 37.0902],
  zoom: isMobile.any() ? 2 : 3,
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
      'text-variable-anchor': ['top', 'right'],
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
      'circle-radius': ['*', ['sqrt', ['number', ['get', 'Value']]], 0.5],
      'circle-color': [
        'case',
        ['==', ['get', 'Damaged'], '0'], '#ffffb3',
        // ['>', ['number', ['get', 'Delayed']], 1],// '#fdc086',
        ['==', ['get', 'Damaged'], '1'], '#fb8072',
        '#8dd3c7',
      ],
      'circle-stroke-color': '#ececec',
      'circle-stroke-width': 1.5,
      'circle-opacity': 0.8,
    },
  });

  map.setFilter('packages', ['==', ['get', 'Time'], 4890]);
  activeDay.innerText = 'Now';
  activeHr.innerText = '09:30';

  map.on('click', 'packages', (e) => {
    console.log(e);

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
    const filterTime = ['==', ['get', 'Time'], m];
    const day = Math.floor(parseInt(m, 10) / 1440);

    activeDay.innerText = day > 2 ? 'Now' : `Now - ${Math.abs(day - 3)} days`;
    activeHr.innerText = convertToTime(+m);

    map.setFilter('packages', filterTime);
  });
};

map.on('load', makeMap);
