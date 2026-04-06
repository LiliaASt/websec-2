import React, { useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import MapComponent from '../components/MapComponent';
import StationSearch from '../components/StationSearch';
import ScheduleDisplay from '../components/ScheduleDisplay';
import RouteSearch from '../components/RouteSearch';
import { fetchStationSchedule, fetchRouteSchedule } from '../services/YandexApi';

function App() {
  const [selectedStation, setSelectedStation] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [routeSchedule, setRouteSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('station');
  const mapRef = useRef(null);

  const loadStationSchedule = async (station) => {
    setLoading(true);
    setSelectedStation(station);
    setRouteSchedule(null);
    try {
      const data = await fetchStationSchedule(station.code);
      setSchedule(data);
    } catch (error) {
      console.error('Ошибка загрузки расписания:', error);
      alert('Не удалось загрузить расписание. Проверьте подключение.');
    }
    setLoading(false);
  };

  const loadRouteSchedule = async (fromStation, toStation, date) => {
    setLoading(true);
    setSchedule(null);
    try {
      const data = await fetchRouteSchedule(fromStation.code, toStation.code, date);
      setRouteSchedule(data);
    } catch (error) {
      console.error('Ошибка загрузки маршрута:', error);
      alert('Не удалось загрузить расписание маршрута.');
    }
    setLoading(false);
  };

  const handleStationSelect = (station) => {
    loadStationSchedule(station);
    setActiveTab('station');
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🚂 Прибывалка для электричек</h1>
        <p>Расписание электричек</p>
      </header>

      <main className="container-fluid">
        <div className="row">
          <div className="col-lg-8 col-md-12 map-container">
            <MapComponent
              onStationSelect={handleStationSelect}
              selectedStation={selectedStation}
              ref={mapRef}
            />
          </div>

          <div className="col-lg-4 col-md-12 sidebar">
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'station' ? 'active' : ''}`}
                  onClick={() => setActiveTab('station')}
                >
                  Поиск по станции
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'route' ? 'active' : ''}`}
                  onClick={() => setActiveTab('route')}
                >
                  Между станциями
                </button>
              </li>
            </ul>

            <div className="tab-content">
              {activeTab === 'station' && (
                <div className="tab-pane active">
                  <StationSearch
                    onStationSelect={loadStationSchedule}
                    loading={loading}
                  />
                  <ScheduleDisplay
                    schedule={schedule}
                    station={selectedStation}
                    loading={loading}
                  />
                </div>
              )}

              {activeTab === 'route' && (
                <div className="tab-pane active">
                  <RouteSearch
                    onRouteSearch={loadRouteSchedule}
                    loading={loading}
                  />
                  {routeSchedule && (
                    <div className="route-results">
                      <h5 className="mt-3">Результаты поиска</h5>
                      <ScheduleDisplay
                        schedule={routeSchedule}
                        station={null}
                        loading={loading}
                        isRoute={true}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
