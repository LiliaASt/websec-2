import React, { useState } from 'react';
import { Form, Button, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { searchStations } from '../services/YandexApi';

const StationSearch = ({ onStationSelect, loading }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Введите название станции');
      return;
    }

    setSearching(true);
    setError('');
    setResults([]);

    try {
      const stations = await searchStations(query.trim());
      if (stations.length === 0) {
        setError('Станции не найдены. Попробуйте другой запрос');
      } else {
        setResults(stations);
      }
    } catch (error) {
      console.error('Ошибка поиска:', error);
      setError('Ошибка при поиске станций');
    } finally {
      setSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectStation = (station) => {
    console.log('Выбрана станция:', station);
    onStationSelect(station);
    setResults([]);
    setQuery('');
  };

  return (
    <div className="station-search">
      <Form>
        <Form.Group>
          <Form.Label>Название станции</Form.Label>
          <div className="d-flex">
            <Form.Control
              type="text"
              placeholder="Например: Самара, Тольятти..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={searching || loading}
            />
            <Button
              variant="primary"
              onClick={handleSearch}
              disabled={searching || loading}
              className="ms-2"
            >
              {searching ? <Spinner animation="border" size="sm" /> : 'Найти'}
            </Button>
          </div>
        </Form.Group>
      </Form>

      {error && (
        <Alert variant="warning" className="mt-3">
          {error}
        </Alert>
      )}

      {searching && (
        <div className="text-center mt-3">
          <Spinner animation="border" size="sm" />
          <span className="ms-2">Поиск станций...</span>
        </div>
      )}

      {results.length > 0 && (
        <ListGroup className="mt-3">
          {results.map((station, index) => (
            <ListGroup.Item
              key={index}
              action
              onClick={() => handleSelectStation(station)}
              className="station-item"
              style={{ cursor: 'pointer' }}
            >
              <div>
                <strong>{station.title}</strong>
              </div>
              {station.type && (
                <small className="text-muted d-block">{station.type}</small>
              )}
              {station.region && (
                <small className="text-muted">{station.region}</small>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

export default StationSearch;
