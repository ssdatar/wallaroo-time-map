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
const zoom = isMobile.any() ? 2 : 3.1;
const radiusFactor = isMobile.any() ? 0.2 : 0.3;

// const roundTime = (time, minutesToRound) => {
//   let [hours, minutes] = time.split(':');
//   hours = parseInt(hours, 10);
//   minutes = parseInt(minutes, 10);

//   // Convert hours and minutes to time in minutes
//   const t = (hours * 60) + minutes;
//   const rounded = Math.round(t / minutesToRound) * minutesToRound;
//   const rHr = Math.floor(rounded / 60);
//   const rMin = (rounded % 60);

//   return rHr * 60 + rMin;
// };

const maxTime = 6480; // Max value in data
// const Now = `${new Date().getHours()}:${new Date().getMinutes()}`;
// const nowTime = roundTime(Now, 30) + (Math.floor(maxTime / 1440) * 24 * 60);

const map = new mapboxgl.Map({
  container: 'wallaroo-map',
  style: 'mapbox://styles/mapbox/dark-v9',
  center: [-95.7129, 37.0902],
  zoom,
  minZoom: zoom,
  maxZoom: 5,
});

map.addControl(new mapboxgl.NavigationControl());
const popup = new mapboxgl.Popup();

const convertToTime = (n) => {
  let h = Math.floor(n / 60) % 24;
  let m = n % 60;
  h = h < 10 ? `0${h}` : h;
  m = m < 10 ? `0${m}` : m;
  return `${h}:${m}`;
};

const makeMap = () => {
  let filterTime = ['==', ['get', 'Time'], maxTime];
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
      'line-width': 1.3,
    },
  });

  map.addLayer({
    id: 'cities',
    type: 'circle',
    source: {
      type: 'geojson',
      data: './assets/cities.geojson',
    },
    paint: {
      'circle-color': '#e2e2e2',
      'circle-radius': isMobile.any() ? 4 : 5,
      'circle-stroke-width': 2,
      'circle-opacity': 0.6,
    },
  });

  map.addLayer({
    id: 'packages',
    type: 'circle',
    source: {
      type: 'geojson',
      data: './assets/packages-2.geojson',
    },
    paint: {
      'circle-radius': ['*', ['sqrt', ['number', ['get', 'Value']]], radiusFactor],
      'circle-color': [
        'case',
        ['==', ['get', 'flag'], 0], '#8dd3c7',
        ['==', ['get', 'flag'], 1], '#ffffb3',
        ['==', ['get', 'flag'], 2], '#fdc086',
        ['==', ['get', 'flag'], 3], '#fb8072',
        '#d3d3d3',
      ],
      'circle-stroke-color': '#ececec',
      'circle-stroke-width': 1.5,
      'circle-opacity': 0.8,
    },
    filter: ['all', filterTime, filterFlag],
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

  map.moveLayer('place-city-lg-n');

  // const { layers } = map.getStyle();
  // layers.forEach((l) => {
  //   console.log(l.id);
  // });

  activeDay.innerText = 'Now';
  activeHr.innerText = convertToTime(6480);

  map.on('click', 'packages', (e) => {
    console.log(e.features[0].properties);
    const status = {
      0: 'OK',
      1: 'Delayed',
      2: 'Potentially damaged',
      3: 'Delayed and potentially damaged',
    };

    const html = `
    <h4>Package #${e.features[0].properties.Package}</h4>
    <p>Value: $${e.features[0].properties.Value}.00</p>
    <p>Status: ${status[e.features[0].properties.flag]}</p>`;

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
    filterTime = ['==', ['get', 'Time'], m];
    const day = Math.floor((maxTime - m) / 1440);

    activeDay.innerText = !day ? 'Now' : `Now - ${Math.abs(day)} days`;
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
