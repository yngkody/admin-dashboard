import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from "dotenv";
import helmet from 'helmet';
import morgan from 'morgan';

// ROUTES
/*
|  Dashboard                      |
|  Uploads                        |
|  Prep List                      |
|  Scan                           |
|  Labels                         |
|  Reports                        |
|  Users (Admin only)             |
|  Settings (Admin only)
*/

import dashboardRoutes from "./routes/dashboard.js"
import uploadRoutes from "./routes/upload.js"
import preplistRoutes from "./routes/preplist.js"
import shortlistRoutes from "./routes/shortlist.js"
import progressRoutes from "./routes/progress.js"
import scanRoutes from "./routes/scan.js"
import labelsRoutes from "./routes/labels.js"
import reportsRoutes from "./routes/reports.js"
import usersRoutes from "./routes/users.js"
import settingsRoutes from "./routes/settings.js"


// Configuration
dotenv.config();
const app = express();
app.use(express.json())
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}));
app.use(morgan("common"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}));

// ROUTES
/*
|  Dashboard                      |
|  Uploads                        |
|  Prep List                      |
|  Scan                           |
|  Labels                         |
|  Reports                        |
|  Users (Admin only)             |
|  Settings (Admin only)
*/

app.use("/Dashboard", dashboardRoutes);
app.use("/Upload", uploadRoutes);
app.use("/Preplist", preplistRoutes);
app.use("/Shortlist", shortlistRoutes);
app.use("/Progress", progressRoutes);
app.use("/Scan", scanRoutes);
app.use("/Labels", labelsRoutes);
app.use("/Reports", reportsRoutes);
app.use("/Users", usersRoutes);
app.use("/Settings", settingsRoutes);


/* MONGOOSE SETUP */
const PORT = process.env.PORT || 9000;
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
})
.catch((error) => console.log(`${error} did not connect`))