import mongoose from "mongoose";
import { mongodbURL } from "../secret.js"; // make sure to add .js for ES Modules

const connectDB = async (options = {}) => {
    try {
        await mongoose.connect(mongodbURL, options);
        console.log("Connection to database successful");

        mongoose.connection.on("error", (error) => {
            console.error("DB connection error: ", error);
        });
    } catch (error) {
        console.error("Could not connect to DB: ", error.toString());
    }
};

export default connectDB;
