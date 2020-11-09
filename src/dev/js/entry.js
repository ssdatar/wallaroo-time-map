import mapboxgl from 'mapbox-gl';

window.onResize = (width) => {
  console.log(width);
};

window.enterView = (msg) => {
  console.log('enter-view', msg);
};

mapboxgl.accessToken = 'pk.eyJ1IjoiZGF0YXJrYWxsb28iLCJhIjoiY2toOXI3aW5kMDRlZTJ4cWt0MW5kaHg4eCJ9.V4NfOecIoFaErvFv_lfKLg';

const map = new mapboxgl.Map({
  container: 'wallaroo-map', // container element id
  style: 'mapbox://styles/mapbox/light-v10',
  center: [-95.7129, 37.0902], // initial map center in [lon, lat]
  zoom: 3,
});

const makeMap = () => {
  map.addLayer({
    id: 'packages',
    type: 'circle',
    source: {
      type: 'geojson',
      data: './assets/packages.json',
    },
  });
};

map.on('load', makeMap);
