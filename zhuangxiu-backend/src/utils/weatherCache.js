// 天气数据缓存
const weatherCache = {
  beijing: null,
  luoyang: null,
  lastUpdateDate: null
};

/**
 * 检查缓存是否有效（同一天内有效）
 */
function isCacheValid() {
  if (!weatherCache.lastUpdateDate) {
    return false;
  }

  const today = new Date().toDateString();
  const cacheDate = new Date(weatherCache.lastUpdateDate).toDateString();

  return today === cacheDate;
}

/**
 * 获取缓存的天气数据
 */
function getCachedWeather(city) {
  if (isCacheValid()) {
    return weatherCache[city] || null;
  }
  return null;
}

/**
 * 设置天气数据缓存
 */
function setCachedWeather(city, data) {
  weatherCache[city] = data;
  weatherCache.lastUpdateDate = new Date();
}

/**
 * 清除缓存
 */
function clearCache() {
  weatherCache.beijing = null;
  weatherCache.luoyang = null;
  weatherCache.lastUpdateDate = null;
}

module.exports = {
  getCachedWeather,
  setCachedWeather,
  isCacheValid,
  clearCache
};
