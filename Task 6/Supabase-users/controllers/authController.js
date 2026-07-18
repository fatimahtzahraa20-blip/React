const supabase = require("../config/supabase");

// Signup Function
const signup = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  res.status(201).json({
    message: "User created successfully",
    data,
  });
};

// 👇 Iske neeche Login Function add karna hai
const login = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  res.json({
    message: "Login successful",
    data,
  });
};

// 👇 Sabse end me exports update karna hai
module.exports = {
  signup,
  login,
};