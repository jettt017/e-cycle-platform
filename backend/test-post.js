const payload = {
  name: "Budi",
  phone: "08123",
  address: "Jl Test",
  city: "Jakarta",
  postalCode: "12345",
  date: "2026-05-10",
  time: "09:00 - 11:00",
  deviceTypes: ["Smartphone"],
  deviceCount: "1-3",
  kondisi: ["Baik"],
  notes: "Test notes",
  priority: "reguler"
};

fetch('http://localhost:5000/api/pickups', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
.then(res => res.text())
.then(console.log)
.catch(console.error);
