require("dotenv").config();

const express = require("express");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();

/* ==========================
   Middleware
========================== */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

/* ==========================
   Supabase Connection
========================== */

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

/* ==========================
   Home Route
========================== */

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ==========================
   Test Supabase Connection
========================== */

app.get("/test", async (req, res) => {

    const { data, error } = await supabase
        .from("users")
        .select("*");

    if (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }

    res.status(200).json({
        success: true,
        data
    });

});

/* ==========================
   Contact Form API
========================== */

app.post("/contact", async (req, res) => {

    const { name, email, subject, message } = req.body;

    /* ========= Validation ========= */

    if (!name || !email || !subject || !message) {
        return res.status(400).json({
            success: false,
            message: "Please fill in all fields."
        });
    }

    /* ========= Email Validation ========= */

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid email address."
        });
    }

    /* ========= Name Validation ========= */

    if (name.trim().length < 3) {
        return res.status(400).json({
            success: false,
            message: "Name must be at least 3 characters."
        });
    }

    /* ========= Subject Validation ========= */

    if (subject.trim().length < 5) {
        return res.status(400).json({
            success: false,
            message: "Subject must be at least 5 characters."
        });
    }

    /* ========= Message Validation ========= */

    if (message.trim().length < 10) {
        return res.status(400).json({
            success: false,
            message: "Message must be at least 10 characters."
        });
    }

    /* ========= Save to Supabase ========= */

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
            message: "Unable to save your message."
        });
    }

    res.status(200).json({
        success: true,
        message: "Message sent successfully!"
    });

});

/* ==========================
   404 Route
========================== */

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message: "404 - Page Not Found"

    });

});

/* ==========================
   Start Server
========================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`🚀 Server Running On Port ${PORT}`);

});