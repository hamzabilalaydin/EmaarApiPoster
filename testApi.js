const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// POST endpoint
app.post('/data', (req, res) => {
    const { name, age } = req.body;
    
    if (!name || !age) {
        return res.status(400).json({ message: 'Name and age are required' });
    }
    
    res.status(200).json({ message: 'Data received', data: { name, age } });
});

app.get("/data", (req, res) => {
    req.body.name = "Hamza",
    req.body.age = "29"
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
