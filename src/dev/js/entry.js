import mapboxgl from 'mapbox-gl';
import { select } from './utils/dom';

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
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [-95.7129, 37.0902],
  zoom: 3,
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
    id: 'packages',
    type: 'circle',
    source: {
      type: 'geojson',
      data: './assets/packages.json',
    },
    paint: {
      'circle-radius': [
        'interpolate', ['linear'], ['zoom'],
        0, ['sqrt', ['get', 'Value']],
        7, ['/', 2, ['sqrt', ['get', 'Value']]],
      ],
      'circle-color': [
        'case',
        ['==', ['number', ['get', 'Delayed']], 0],
        '#ffff99',
        ['>', ['number', ['get', 'Delayed']], 1],
        '#fdc086',
        ['>', ['number', ['get', 'Damaged']], 0],
        '#beaed4',
        '#7fc97f',
      ],
      'circle-stroke-color': '#efefef',
      'circle-stroke-width': 1.5,
      'circle-opacity': 0.8,
    },
  });

  map.setFilter('packages', ['==', ['get', 'Time'], 60]);

  map.on('click', 'packages', (e) => {
    console.log(e);

    popup
      .setLngLat(e.lngLat)
      .setHTML(e.features[0].properties.Package)
      .addTo(map);
  });

  slider.addEventListener('change', (e) => {
    const m = +e.target.value;
    const filterTime = ['==', ['get', 'Time'], m];
    console.log(m);
    const day = Math.floor(parseInt(m, 10) / 1440);

    activeDay.innerText = `${day + 1}`;
    activeHr.innerText = convertToTime(+m);

    map.setFilter('packages', filterTime);
  });
};

map.on('load', makeMap);
