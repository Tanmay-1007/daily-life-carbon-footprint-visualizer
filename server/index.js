const express = require('express');
const cors = require('cors');
const path = require('path');
const { addRecord, readRecords } = require('./storage');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

function calculateFootprint(body) {
  const transportMiles = Number(body.transportMiles || 0);
  const electricityKwh = Number(body.electricityKwh || 0);
  const dietType = body.dietType || 'balanced';
  const wasteKg = Number(body.wasteKg || 0);
  const flightHours = Number(body.flightHours || 0);

  const transportKg = transportMiles * 0.27;
  const electricityKg = electricityKwh * 0.45;
  const dietCoefficient = dietType === 'meat' ? 3.0 : dietType === 'plant' ? 1.2 : 2.0;
  const dietKg = dietCoefficient * 2.0;
  const wasteKgCO2 = wasteKg * 1.8;
  const flightKg = flightHours * 90;
  const total = transportKg + electricityKg + dietKg + wasteKgCO2 + flightKg;

  return {
    categories: {
      transportation: Number(transportKg.toFixed(1)),
      electricity: Number(electricityKg.toFixed(1)),
      diet: Number(dietKg.toFixed(1)),
      waste: Number(wasteKgCO2.toFixed(1)),
      flights: Number(flightKg.toFixed(1))
    },
    total: Number(total.toFixed(1)),
    advice: total < 20
      ? 'Excellent! Your daily footprint is low. Keep up the sustainable choices.'
      : total < 35
      ? 'Good job. Small changes can reduce your impact further.'
      : 'Consider reducing car travel, choosing plant-based meals, and lowering energy usage.'
  };
}

app.post('/api/footprint', (req, res) => {
  const result = calculateFootprint(req.body);
  const record = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    input: {
      transportMiles: req.body.transportMiles || 0,
      electricityKwh: req.body.electricityKwh || 0,
      dietType: req.body.dietType || 'balanced',
      wasteKg: req.body.wasteKg || 0,
      flightHours: req.body.flightHours || 0
    },
    result
  };

  addRecord(record);
  res.json(record);
});

app.get('/api/reports', (req, res) => {
  res.json(readRecords());
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
