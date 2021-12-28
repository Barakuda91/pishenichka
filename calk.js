const express = require('express');
const app = express();
const port = 1995;

app.get('/', (req, res) => {
    res.sendFile('views/calc.html', { root: __dirname });
});

app.post('/calc', (req, res) => {});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
