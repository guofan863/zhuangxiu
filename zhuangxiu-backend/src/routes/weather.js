const express = require('express');
const router = express.Router();
const { getBeijingWeather, getLuoyangWeather, getAllWeather } = require('../controllers/weatherController');

// 获取北京天气
router.get('/beijing', getBeijingWeather);

// 获取洛阳天气
router.get('/luoyang', getLuoyangWeather);

// 获取所有天气（推荐使用这个接口，一次获取两个城市）
router.get('/all', getAllWeather);

module.exports = router;
