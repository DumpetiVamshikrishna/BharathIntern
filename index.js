const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

const app = express();
dotenv.config();

const port = process.env.PORT || 3000;

const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;

mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.g5777mb.mongodb.net/registrationFormDB`,
    { useNewUrlParser: true, useUnifiedTopology: true });

const registrationSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});

const Registration = mongoose.model("Registration", registrationSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/pages/index.html");
});

app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Basic validation: check if name, email, and password are provided
        if (!name || !email || !password) {
            console.log("Missing required fields");
            return res.redirect(303, "/error");
        }

        // Validate email format using a regular expression
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log("Invalid email format");
            return res.redirect(303, "/error");
        }

        // Validate password length
        if (password.length < 6) {
            console.log("Password must be at least 6 characters long");
            return res.redirect(303, "/error");
        }

        // Check if the email already exists in the database
        const existingUser = await Registration.findOne({ email: email });
        if (!existingUser) {
            // If the user doesn't exist, save the registration data
            const registrationData = new Registration({
                name,
                email,
                password
            });
            await registrationData.save();
            console.log("User registered successfully");
            return res.redirect(303, "/success");
        } else {
            console.log("User already exists");
            return res.redirect(303, "/error"); // Redirect to "/error" when user already exists
        }
    } catch (error) {
        console.error("Error occurred:", error);
        return res.redirect(303, "/error");
    }
});

app.get("/success", (req, res) => {
    res.sendFile(__dirname + "/pages/success.html");
});

app.get("/error", (req, res) => {
    res.sendFile(__dirname + "/pages/error.html");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
