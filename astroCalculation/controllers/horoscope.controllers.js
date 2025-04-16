// server/astroCalculation/controllers/horoscope.controllers.js

// If using Node.js v18+ this should work. Otherwise, install node-fetch:
// const fetch = require('node-fetch');
const { formatHoroscopeRequest } = require('../utils/utils');

exports.getHoroscope = async (req, res) => {
  try {
    // Optionally format or validate the input request.
    const requestData = formatHoroscopeRequest(req.body);

    // Define the VedAstro API base URL.
    // Set VEDASTRO_API_BASE_URL to "http://localhost:3001" (or another value) as needed.
    const VEDASTRO_API_BASE_URL = process.env.VEDASTRO_API_BASE_URL || "http://localhost:3001";

    // Proxy the request to the Dockerized VedAstro API.
    const apiResponse = await fetch(`${VEDASTRO_API_BASE_URL}/api/gethoroscope`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      return res.status(apiResponse.status).json({ error: errorText });
    }

    const data = await apiResponse.json();
    return res.json(data);
  } catch (error) {
    console.error("Error in getHoroscope Controller:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
