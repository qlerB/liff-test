const express = require("express");

const app = express();

app.use(express.json());

app.post("/api/login", (req, res) => {
    console.log("Received:", req.body);

    res.json({
        success: true,
        message: "Backend received your data",
        data: req.body
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});