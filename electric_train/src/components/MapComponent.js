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
import { Style, Text, Fill, Stroke, Circle } from 'ol/style';
import Overlay from 'ol/Overlay';
import { stationsData } from '../data/stations';

const MAP_CONFIG = {
  centerLon: parseFloat(process.env.REACT_APP_MAP_CENTER_LON),
  centerLat: parseFloat(process.env.REACT_APP_MAP_CENTER_LAT),
  initialZoom: 9,
};

const MapComponent = ({ onStationSelect, selectedStation }) => {
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const [popupContent, setPopupContent] = useState('');
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const mapCenter = fromLonLat([MAP_CONFIG.centerLon, MAP_CONFIG.centerLat]);

    const popupOverlay = new Overlay({
      element: popupRef.current,
      positioning: 'bottom-center',
      offset: [0, -10],
      stopEvent: false,
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: mapCenter,
        zoom: 9,
      }),
      controls: [],
    });

    map.addOverlay(popupOverlay);
    mapInstanceRef.current = map;

    const addStationsToMap = () => {
      if (!stationsData || stationsData.length === 0) {
        console.warn('Нет данных станций для отображения');
        return;
      }

      const features = [];

      stationsData.forEach(station => {
        if (station.coordinates && station.coordinates.lon && station.coordinates.lat) {
          const feature = new Feature({
            geometry: new Point(fromLonLat([station.coordinates.lon, station.coordinates.lat])),
            stationData: station,
          });

          feature.setStyle(new Style({
            image: new Circle({
              radius: 8,
              fill: new Fill({ color: '#4547d7' }),
              stroke: new Stroke({ color: '#ffffff', width: 2 })
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
        } else {
          console.warn(`Станция ${station.title} не имеет координат`);
        }
      });

      console.log(`Добавлено ${features.length} точек на карту`);

      const vectorSource = new VectorSource({
        features: features,
      });

      const vectorLayer = new VectorLayer({
        source: vectorSource,
      });

      map.addLayer(vectorLayer);
    };

    addStationsToMap();

    const clickHandler = (event) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, (feat) => feat);

      if (feature && feature.get('stationData')) {
        const stationData = feature.get('stationData');
        const coordinate = event.coordinate;

        setPopupContent(`
          <strong>${stationData.title}</strong><br/>
          <small>${stationData.type || 'ЖД станция'}</small><br/>
          <button id="popup-select-btn">Посмотреть расписание</button>
        `);
        popupOverlay.setPosition(coordinate);

        setTimeout(() => {
            const btn = document.getElementById('popup-select-btn');
            if (btn) {
                btn.onclick = () => {
                    onStationSelect(stationData);
                    popupOverlay.setPosition(undefined);
                };
            }
        }, 0);

      } else {
        popupOverlay.setPosition(undefined);
      }
    };

    map.on('click', clickHandler);

    return () => {
      map.un('click', clickHandler);
      map.setTarget(undefined);
      mapInstanceRef.current = null;
    };
  }, [onStationSelect]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '400px' }}></div>
      <div ref={popupRef} className="ol-popup" dangerouslySetInnerHTML={{ __html: popupContent }}></div>
    </div>
  );
};

export default MapComponent;
