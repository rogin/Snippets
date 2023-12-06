//created by Micheal Hobbs?
function getCached(cacheKey, params, callback, maxCacheSize = 100) {
    // Generate the key for the specific data
    const key = JSON.stringify(params)
  ​
    // If no cache exists, create one
    if (!$gc(cacheKey)) {
      $gc(cacheKey, JSON.stringify({keys: [], data: {}}))
    }
  ​
    // Get the cache
    let cache = JSON.parse($gc(cacheKey))
  ​
    if (cache.data[key]) {
      // Remove key from its current position and push it to the end (most recently used)
      const index = cache.keys.indexOf(key)
      if (index > -1) {
        cache.keys.splice(index, 1)
      }
      cache.keys.push(key)
      $gc(cacheKey, JSON.stringify(cache))
      return cache.data[key]
    } else {
      const result = callback(params)
  ​
      // If we are about to exceed the max cache size, evict the least recently used item
      if (cache.keys.length >= maxCacheSize) {
        const lruKey = cache.keys.shift()
        delete cache.data[lruKey]
      }
  ​
      // Add the new item to the cache
      cache.data[key] = result
      cache.keys.push(key)
      $gc(cacheKey, JSON.stringify(cache))
      return result
    }
  }