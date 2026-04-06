import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { Style, Icon, Text, Fill, Stroke } from 'ol/style';
import Overlay from 'ol/Overlay';
import { stationsData } from '../data/stations';

const MapComponent = ({ onStationSelect, selectedStation }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const popupRef = useRef(null);
  const [popupContent, setPopupContent] = useState('');

  const samaraCenter = fromLonLat([50.15, 53.2]);

  useEffect(() => {
    if (!mapRef.current) return;

    const popupOverlay = new Overlay({
      element: popupRef.current,
      positioning: 'bottom-center',
      offset: [0, -10],
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: samaraCenter,
        zoom: 9,
      }),
      controls: [],
    });

    map.addOverlay(popupOverlay);
    mapInstanceRef.current = map;

    const addStationsToMap = () => {
      const features = [];

      stationsData.forEach(station => {
        if (station.coordinates && station.coordinates.lon && station.coordinates.lat) {
          const feature = new Feature({
            geometry: new Point(fromLonLat([station.coordinates.lon, station.coordinates.lat])),
            stationData: station,
          });

          feature.setStyle(new Style({
            image: new Icon({
              src: 'https://cdn.rawgit.com/openlayers/openlayers.github.io/master/en/v5.3.0/examples/data/icon.png',
              scale: 0.5,
              anchor: [0.5, 1],
            }),
            text: new Text({
              text: station.title,
              font: '12px Arial',
              fill: new Fill({ color: '#333' }),
              stroke: new Stroke({ color: 'white', width: 2 }),
              offsetY: -20,
            }),
          }));

          features.push(feature);
        }
      });

      const vectorSource = new VectorSource({
        features: features,
      });

      const vectorLayer = new VectorLayer({
        source: vectorSource,
      });

      map.addLayer(vectorLayer);
    };

    addStationsToMap();

    map.on('click', (event) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature);
      if (feature && feature.get('stationData')) {
        const stationData = feature.get('stationData');
        const coordinate = event.coordinate;

        setPopupContent(`
          <strong>${stationData.title}</strong><br/>
          <small>${stationData.type || 'ЖД станция'}</small><br/>
          <button onclick="window.selectStationFromMap('${stationData.code}')">
            Посмотреть расписание
          </button>
        `);
        popupOverlay.setPosition(coordinate);
      } else {
        popupOverlay.setPosition(undefined);
      }
    });

    window.selectStationFromMap = (code) => {
      const station = stationsData.find(s => s.code === code);
      if (station) {
        onStationSelect(station);
        popupOverlay.setPosition(undefined);
      }
    };

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(null);
      }
      delete window.selectStationFromMap;
    };
  }, [onStationSelect, samaraCenter]);

  return (
    <div>
      <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '400px' }}></div>
      <div ref={popupRef} className="ol-popup" dangerouslySetInnerHTML={{ __html: popupContent }}></div>
    </div>
  );
};

export default MapComponent;
