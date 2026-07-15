require("dotenv").config();

const express = require("express");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();

// ==========================
// Middleware
// ==========================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

// ==========================
// Supabase
// ==========================

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// ==========================
// Routes
// ==========================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ==========================
// Test Route
// ==========================

app.get("/test-db", async (req, res) => {

    const { data, error } = await supabase
        .from("messages")
        .select("*");

    if (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }

    res.json({
        success: true,
        data
    });

});
app.get("/env-test", (req, res) => {

    res.json({
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_KEY_EXISTS: !!process.env.SUPABASE_KEY
    });

});

// ==========================
// Contact Form
// ==========================

app.post("/contact", async (req, res) => {

    try {

        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all fields."
            });
        }

        const { error } = await supabase
            .from("messages")
            .insert([
                {
                    name,
                    email,
                    subject,
                    message
                }
            ]);

        if (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        return res.json({
            success: true,
            message: "Message sent successfully!"
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

});


// ==========================
// 404
// ==========================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "404 - Page Not Found"
    });

});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;