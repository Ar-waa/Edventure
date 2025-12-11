import app from "./app.js";
import connectDB from './config/db.js';
import { serverPort } from './secret.js';

app.listen(serverPort, async () => {
    console.log(`Server running on http://localhost:${serverPort}`);
    await connectDB();
});

