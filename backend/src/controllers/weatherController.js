const axios = require('axios');

exports.getWeather = async (req, res) => {
    try {
        const { lat, lon, city } = req.query;
        const apiKey = process.env.OPENWEATHER_API_KEY;

        if (!apiKey || apiKey === 'your_api_key_here') {
            return res.status(500).json({ msg: 'Weather API key not configured' });
        }

        let url;
        if (lat && lon) {
            url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        } else if (city) {
            url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        } else {
            return res.status(400).json({ msg: 'Location parameters are required' });
        }

        const response = await axios.get(url);

        const weatherData = {
            city: response.data.name,
            temp: response.data.main.temp,
            description: response.data.weather[0].description,
            icon: response.data.weather[0].icon,
            humidity: response.data.main.humidity,
            windSpeed: response.data.wind.speed
        };

        res.json(weatherData);
    } catch (err) {
        console.error('Weather API Error:', err.response?.data || err.message);
        const status = err.response?.status || 500;
        const msg = err.response?.data?.message || 'Failed to fetch weather data';
        res.status(status).json({ msg });
    }
};

exports.getForecast = async (req, res) => {
    try {
        const { lat, lon, city } = req.query;
        const apiKey = process.env.OPENWEATHER_API_KEY;

        if (!apiKey || apiKey === 'your_api_key_here') {
            return res.status(500).json({ msg: 'Weather API key not configured' });
        }

        let url;
        if (lat && lon) {
            url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        } else if (city) {
            url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
        } else {
            return res.status(400).json({ msg: 'Location parameters are required' });
        }

        const response = await axios.get(url);

        // Return the full forecast list so frontend can process it as needed
        res.json({
            city: response.data.city.name,
            list: response.data.list
        });
    } catch (err) {
        console.error('Forecast API Error:', err.response?.data || err.message);
        const status = err.response?.status || 500;
        const msg = err.response?.data?.message || 'Failed to fetch forecast data';
        res.status(status).json({ msg });
    }
};
