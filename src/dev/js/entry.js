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
  container: 'wallaroo-map', // container element id
  style: 'mapbox://styles/mapbox/light-v10',
  center: [-95.7129, 37.0902], // initial map center in [lon, lat]
  zoom: 3,
});

const convertToTime = (n) => {
  let h = Math.floor(n / 60) % 24;
  let m = n % 60;
  h = h < 10 ? `0${h}` : h;
  m = m < 10 ? `0${m}` : m;
  return `${h}:${m}`;
};

const makeMap = () => {
  map.addLayer({
    id: 'packages',
    type: 'circle',
    source: {
      type: 'geojson',
      data: './assets/packages.json',
    },
  });

  map.setFilter('packages', ['==', ['get', 'Time'], '60']);

  slider.addEventListener('change', (e) => {
    const m = e.target.value;
    const filterTime = ['==', ['get', 'Time'], m];
    console.log(m);
    const day = Math.floor(parseInt(m, 10) / 1440);

    activeDay.innerText = `${day + 1}`;
    activeHr.innerText = convertToTime(+m);

    map.setFilter('packages', filterTime);
  });
};

map.on('load', makeMap);
