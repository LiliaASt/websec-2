import React, { useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { searchStations } from '../services/YandexApi';

const RouteSearch = ({ onRouteSearch, loading }) => {
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [date, setDate] = useState('');
  const [fromResults, setFromResults] = useState([]);
  const [toResults, setToResults] = useState([]);
  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);
  const [searchingFrom, setSearchingFrom] = useState(false);
  const [searchingTo, setSearchingTo] = useState(false);

  const searchStation = async (query, setResults, setSearching) => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const stations = await searchStations(query);
      setResults(stations);
    } catch (error) {
      console.error('Ошибка поиска:', error);
    }
    setSearching(false);
  };

  const handleFromSearch = () => {
    searchStation(fromQuery, setFromResults, setSearchingFrom);
  };

  const handleToSearch = () => {
    searchStation(toQuery, setToResults, setSearchingTo);
  };

  const selectFromStation = (station) => {
    setSelectedFrom(station);
    setFromQuery(station.title);
    setFromResults([]);
  };

  const selectToStation = (station) => {
    setSelectedTo(station);
    setToQuery(station.title);
    setToResults([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedFrom && selectedTo) {
      onRouteSearch(selectedFrom, selectedTo, date || undefined);
    } else {
      alert('Пожалуйста, выберите станции отправления и назначения');
    }
  };

  const defaultDate = new Date().toISOString().split('T')[0];

  return (
    <div className="route-search">
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Станция отправления</Form.Label>
          <div className="d-flex">
            <Form.Control
              type="text"
              placeholder="Введите название станции"
              value={fromQuery}
              onChange={(e) => setFromQuery(e.target.value)}
            />
            <Button
              variant="outline-primary"
              onClick={handleFromSearch}
              disabled={searchingFrom}
              className="ms-2"
              size="sm"
            >
              {searchingFrom ? <Spinner animation="border" size="sm" /> : 'Поиск'}
            </Button>
          </div>
          {fromResults.length > 0 && (
            <div className="search-results mt-2" style={{ position: 'absolute', zIndex: 1000, backgroundColor: 'white', width: 'calc(100% - 2rem)' }}>
              {fromResults.map((station, idx) => (
                <div
                  key={idx}
                  className="result-item p-2 border rounded mb-1 cursor-pointer"
                  onClick={() => selectFromStation(station)}
                  style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}
                >
                  <strong>{station.title}</strong>
                  {station.type && <small className="text-muted ms-2">{station.type}</small>}
                </div>
              ))}
            </div>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Станция назначения</Form.Label>
          <div className="d-flex">
            <Form.Control
              type="text"
              placeholder="Введите название станции"
              value={toQuery}
              onChange={(e) => setToQuery(e.target.value)}
            />
            <Button
              variant="outline-primary"
              onClick={handleToSearch}
              disabled={searchingTo}
              className="ms-2"
              size="sm"
            >
              {searchingTo ? <Spinner animation="border" size="sm" /> : 'Поиск'}
            </Button>
          </div>
          {toResults.length > 0 && (
            <div className="search-results mt-2" style={{ position: 'absolute', zIndex: 1000, backgroundColor: 'white', width: 'calc(100% - 2rem)' }}>
              {toResults.map((station, idx) => (
                <div
                  key={idx}
                  className="result-item p-2 border rounded mb-1 cursor-pointer"
                  onClick={() => selectToStation(station)}
                  style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}
                >
                  <strong>{station.title}</strong>
                  {station.type && <small className="text-muted ms-2">{station.type}</small>}
                </div>
              ))}
            </div>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Дата поездки (опционально)</Form.Label>
          <Form.Control
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={defaultDate}
          />
        </Form.Group>

        <Button
          type="submit"
          variant="success"
          className="w-100"
          disabled={loading || !selectedFrom || !selectedTo}
        >
          {loading ? <Spinner animation="border" size="sm" /> : 'Найти расписание'}
        </Button>
      </Form>

      {selectedFrom && selectedTo && (
        <div className="alert alert-info mt-3">
          Маршрут: {selectedFrom.title} → {selectedTo.title}
        </div>
      )}
    </div>
  );
};

export default RouteSearch;
