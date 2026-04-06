import React from 'react';
import { Card, ListGroup, Badge, Spinner, Alert } from 'react-bootstrap';

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

  const formatTime = (date) => {
    if (!date) return 'Время уточняется';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return 'Время уточняется';
      return dateObj.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Время уточняется';
    }
  };

  const formatFullDate = (date) => {
    if (!date) return null;
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return null;
      return dateObj.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return null;
    }
  };

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
                {formatTime(item.departure)}
              </Badge>
            </div>

            <div className="mt-2 small">
              {item.departure && (
                <div>🕐 Отправление: {formatFullDate(item.departure) || 'Время уточняется'}</div>
              )}
              {item.arrival && (
                <div>🏁 Прибытие: {formatFullDate(item.arrival) || 'Время уточняется'}</div>
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
