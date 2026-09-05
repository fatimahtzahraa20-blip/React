import supabase from "../supabaseClient.js";

export const registerUser = async (req, res) => {

    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });

    if (error) {
        return res.status(400).json({
            error: error.message
        });
    }

    res.status(201).json({
        message: "User Registered Successfully",
        user: data.user,
        token: data.session?.access_token
    });

};

export const loginUser = async (req, res) => {

    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        return res.status(401).json({
            error: error.message
        });
    }

    res.status(200).json({
        message: "Login Successful",
        user: data.user,
        token: data.session.access_token
    });

};