const PROXY_URL = process.env.REACT_APP_PROXY_URL || 'http://localhost:3001/api/rasp';

let stationsCache = null;

export const fetchAllStations = async () => {
  try {
    const url = `${PROXY_URL}/stations_list/?lang=ru_RU&format=json`;
    console.log('Загрузка списка станций...');

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ошибка: ${response.status}`);
    }

    const data = await response.json();

    const stations = [];

    if (data.countries) {
      for (const country of data.countries) {
        if (country.regions) {
          for (const region of country.regions) {
            if (region.settlements) {
              for (const settlement of region.settlements) {
                if (settlement.stations) {
                  for (const station of settlement.stations) {
                    if (station.transport_type === 'train') {
                      stations.push({
                        code: station.codes?.yandex_code,
                        title: station.title,
                        type: station.station_type,
                        lat: station.latitude,
                        lon: station.longitude,
                        region: region.title,
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    const validStations = stations.filter(s => s.code);
    console.log(`Загружено станций: ${validStations.length}`);

    return validStations;
  } catch (error) {
    console.error('Ошибка загрузки станций:', error);
    throw error;
  }
};

export const searchStations = async (query) => {
  try {
    if (!stationsCache) {
      stationsCache = await fetchAllStations();
    }

    const lowerQuery = query.toLowerCase();
    const results = stationsCache.filter(station =>
      station.title.toLowerCase().includes(lowerQuery)
    );

    return results.slice(0, 15);
  } catch (error) {
    console.error('Ошибка поиска станций:', error);
    return [];
  }
};

export const fetchStationSchedule = async (stationCode) => {
  try {
    console.log('Запрос расписания для станции:', stationCode);

    const url = `${PROXY_URL}/schedule/?station=${stationCode}&transport_types=suburban&event=departure&limit=50&lang=ru_RU`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ошибка: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.text || data.error);
    }

    if (data.schedule && data.schedule.length > 0) {
      return data.schedule.map(item => ({
        number: item.thread?.number || '—',
        title: item.thread?.title || 'Пригородный поезд',
        departure: item.departure,
        arrival: item.arrival,
        platform: item.platform,
        carrier: item.thread?.carrier,
        duration: item.duration,
      }));
    }

    return [];
  } catch (error) {
    console.error('Ошибка при получении расписания станции:', error);
    throw error;
  }
};

export const fetchRouteSchedule = async (fromCode, toCode, date = null) => {
  try {
    let url = `${PROXY_URL}/search/?from=${fromCode}&to=${toCode}&transport_types=suburban&limit=50&lang=ru_RU`;
    if (date) {
      url += `&date=${date}`;
    }

    console.log('Поиск маршрута...');

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ошибка: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.text || data.error);
    }

    if (data.segments && data.segments.length > 0) {
      return data.segments.map(segment => ({
        number: segment.thread?.number || '—',
        title: segment.thread?.title || 'Пригородный поезд',
        departure: segment.departure,
        arrival: segment.arrival,
        duration: segment.duration,
        platform: segment.platform,
        carrier: segment.thread?.carrier,
        from: segment.from?.title,
        to: segment.to?.title,
      }));
    }

    return [];
  } catch (error) {
    console.error('Ошибка при получении расписания маршрута:', error);
    throw error;
  }
};
