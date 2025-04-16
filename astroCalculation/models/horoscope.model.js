const mongoose = require('mongoose');

const horoscopeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // Save the date of birth as a Date; you may need to convert the client's string to a Date.
  dob: { type: Date, required: true },
  time: { type: String, required: true }, // Storing time as a string (HH:mm format)
  place: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Horoscope', horoscopeSchema);
