const express = require('express');
const cors = require('cors');
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// middle were
app.get(express.json())
app.get(cors);

app.get("/" , async ( req, res) => {
    res.send("Bistro Boss server running ")
})
app.listen(port , () => {
    console.log(`port signel crud server port :${port} `);
})