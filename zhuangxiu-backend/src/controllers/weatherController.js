const axios = require('axios');
const { getCachedWeather, setCachedWeather, isCacheValid } = require('../utils/weatherCache');

// 心知天气API配置
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || 'SgY8VJE-FquQ_9tFA';
const WEATHER_API_BASE = 'https://api.seniverse.com/v3/weather/daily.json';

/**
 * 获取天气数据（带缓存）
 */
async function fetchWeatherData(location) {
  try {
    const url = `${WEATHER_API_BASE}?key=${WEATHER_API_KEY}&location=${location}&language=zh-Hans&unit=c&start=0&days=5`;

    const response = await axios.get(url, {
      timeout: 10000
    });

    if (response.data && response.data.results && response.data.results.length > 0) {
      return response.data.results[0];
    } else {
      throw new Error('天气API返回数据格式错误');
    }
  } catch (error) {
    console.error(`获取${location}天气数据失败:`, error.message);
    throw error;
  }
}

/**
 * 获取北京天气
 */
exports.getBeijingWeather = async (req, res) => {
  try {
    // 先检查缓存
    const cachedData = getCachedWeather('beijing');
    if (cachedData) {
      return res.status(200).json({
        status: 'success',
        data: cachedData,
        cached: true
      });
    }

    // 缓存无效，调用API
    const weatherData = await fetchWeatherData('beijing');

    // 保存到缓存
    setCachedWeather('beijing', weatherData);

    res.status(200).json({
      status: 'success',
      data: weatherData,
      cached: false
    });
  } catch (error) {
    console.error('获取北京天气失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取天气数据失败',
      error: error.message
    });
  }
};

/**
 * 获取洛阳天气
 */
exports.getLuoyangWeather = async (req, res) => {
  try {
    // 先检查缓存
    const cachedData = getCachedWeather('luoyang');
    if (cachedData) {
      return res.status(200).json({
        status: 'success',
        data: cachedData,
        cached: true
      });
    }

    // 缓存无效，调用API
    const weatherData = await fetchWeatherData('luoyang');

    // 保存到缓存
    setCachedWeather('luoyang', weatherData);

    res.status(200).json({
      status: 'success',
      data: weatherData,
      cached: false
    });
  } catch (error) {
    console.error('获取洛阳天气失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取天气数据失败',
      error: error.message
    });
  }
};

/**
 * 获取所有天气数据（一次性获取两个城市）
 */
exports.getAllWeather = async (req, res) => {
  try {
    const results = {
      beijing: null,
      luoyang: null,
      cached: true
    };

    // 检查缓存是否有效
    const cacheValid = isCacheValid();

    // 获取北京天气
    const beijingCached = getCachedWeather('beijing');
    if (beijingCached && cacheValid) {
      results.beijing = beijingCached;
    } else {
      try {
        const beijingData = await fetchWeatherData('beijing');
        setCachedWeather('beijing', beijingData);
        results.beijing = beijingData;
        results.cached = false;
      } catch (error) {
        console.error('获取北京天气失败:', error);
        // 如果API调用失败，尝试使用缓存（即使过期）
        results.beijing = beijingCached;
      }
    }

    // 获取洛阳天气
    const luoyangCached = getCachedWeather('luoyang');
    if (luoyangCached && cacheValid) {
      results.luoyang = luoyangCached;
    } else {
      try {
        const luoyangData = await fetchWeatherData('luoyang');
        setCachedWeather('luoyang', luoyangData);
        results.luoyang = luoyangData;
        results.cached = false;
      } catch (error) {
        console.error('获取洛阳天气失败:', error);
        // 如果API调用失败，尝试使用缓存（即使过期）
        results.luoyang = luoyangCached;
      }
    }

    res.status(200).json({
      status: 'success',
      data: results
    });
  } catch (error) {
    console.error('获取天气数据失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取天气数据失败',
      error: error.message
    });
  }
};
