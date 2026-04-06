const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = 3001;

const API_KEY = process.env.REACT_APP_API_KEY || '5c35214b-1ca9-4216-a86e-d852deeecfaf';

app.use(cors());
app.use(express.json());

app.use('/api/rasp', async (req, res) => {
  try {
    const apiPath = req.originalUrl.replace('/api/rasp', '');
    const separator = apiPath.includes('?') ? '&' : '?';
    const targetUrl = `https://api.rasp.yandex.net/v3.0${apiPath}${separator}apikey=${API_KEY}`;

    console.log('Прокси запрос к:', targetUrl.replace(API_KEY, '***HIDDEN***'));

    const response = await fetch(targetUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const text = await response.text();

    try {
      const data = JSON.parse(text);
      res.json(data);
    } catch (e) {
      console.error('Ошибка парсинга JSON');
      res.status(500).json({ error: 'API вернул невалидный JSON' });
    }

  } catch (error) {
    console.error('Ошибка прокси:', error.message);
    res.status(500).json({ error: 'Ошибка при выполнении запроса к API' });
  }
});

app.listen(port, () => {
  console.log(`✅ Прокси сервер запущен на http://localhost:${port}`);
});
