const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Example POST route
app.post('/api/data', (req, res) => {
    console.log('Received data:', req.body);
    res.json({ message: 'Data received successfully!', received: req.body });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
