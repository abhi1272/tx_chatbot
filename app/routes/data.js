// const express = require('express');
// const { getAllRecords } = require('../services/mongodb');
// const { setCache, getCache } = require('../services/cache');
// const router = express.Router();

// router.get('/data', async (req, res) => {
//   const cacheKey = 'allRecords';
//   let data = getCache(cacheKey);

//   if (!data) {
//     try {
//       data = await getAllRecords('yourCollectionName'); // Replace with your collection name
//       setCache(cacheKey, data);
//       console.log('Data fetched from MongoDB and cached.');
//     } catch (error) {
//       console.error('Error fetching data from MongoDB:', error);
//       return res.status(500).send('Internal Server Error');
//     }
//   } else {
//     console.log('Data retrieved from cache.');
//   }

//   res.json(data);
// });

// module.exports = router;
