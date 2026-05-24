import React from 'react';
import { Card, ListGroup, Badge, Spinner, Alert } from 'react-bootstrap';
import { formatTime, formatFullDate } from '../utils/dateUtils'; 

const ScheduleDisplay = ({ schedule, station, loading, isRoute = false }) => {
  if (loading) {
    return (
      <div className="text-center mt-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Загрузка расписания...</p>
      </div>
    );
  }

  if (!schedule || schedule.length === 0) {
    return (
      <Alert variant="info" className="mt-3">
        {station ? 'Выберите станцию для просмотра расписания' : 'Расписание не найдено'}
      </Alert>
    );
  }

  return (
    <div className="schedule-display mt-3">
      {station && !isRoute && (
        <Card className="mb-3">
          <Card.Body>
            <Card.Title>{station.title}</Card.Title>
            <Card.Text className="text-muted small">
              {station.type || 'Железнодорожная станция'}
            </Card.Text>
          </Card.Body>
        </Card>
      )}

      <h6 className="mb-3">
        {isRoute ? 'Доступные рейсы:' : 'Ближайшие отправления:'}
      </h6>

      <ListGroup>
        {schedule.map((item, index) => (
          <ListGroup.Item key={index} className="schedule-item">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <strong>Поезд №{item.number || '—'}</strong>
                <div className="small text-muted">
                  {item.title || 'Пригородный поезд'}
                </div>
              </div>
              <Badge bg="success" pill>
                {formatTime(item.departure || item.arrival)}
              </Badge>
            </div>

            <div className="mt-2 small">
              {item.departure && (
                <div>🕐 Отправление: {formatFullDate(item.departure) || formatTime(item.departure)} </div>
              )}
              {item.arrival && (
                <div> 🏁 Прибытие: {formatFullDate(item.arrival) || formatTime(item.arrival)} </div>
              )}
              {item.duration && (
                <div>⏱️ В пути: {typeof item.duration === 'number' ? Math.floor(item.duration / 60) + ' мин' : item.duration}</div>
              )}
              {item.platform && (
                <div>🚉 Платформа: {item.platform}</div>
              )}
              {item.carrier?.title && (
                <div className="text-muted mt-1">🚂 Перевозчик: {item.carrier.title}</div>
              )}
              {isRoute && item.from && item.to && (
                <div className="text-muted mt-1">📌 {item.from} → {item.to}</div>
              )}
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default ScheduleDisplay;
