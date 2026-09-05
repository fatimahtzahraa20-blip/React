/* ==========================================
   CREATE MESSAGES TABLE
========================================== */

CREATE TABLE IF NOT EXISTS messages (

    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name TEXT NOT NULL,

    email TEXT NOT NULL,

    subject TEXT NOT NULL,

    message TEXT NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()

);

/* ==========================================
   ENABLE ROW LEVEL SECURITY
========================================== */

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;


/* ==========================================
   INSERT POLICY FOR AUTHENTICATED USERS
========================================== */

CREATE POLICY "Allow insert for visitors"

ON messages

FOR INSERT

TO anon, authenticated

WITH CHECK (true);