const express = require('express');
const router = express.Router();
const horoscopeController = require('../controllers/horoscope.controllers');

router.post('/', horoscopeController.getHoroscope);

module.exports = router;
