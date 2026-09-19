require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const authMiddleware = require('./middleware/authMiddleware'); // Middleware function
const { admin } = require('./middleware/authMiddleware'); // Admin middleware
const cron = require("node-cron");
const { processExpiredOrders } = require("./services/orderExpiryService");

const app = express();

// 1. CORS Middleware (FIRST)
const allowedOrigins = [
    'http://localhost:5173',
    'https://household-sustainability-system.vercel.app'
];
if (process.env.CLIENT_URL) {
    allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

// 2. Connect Database
connectDB();
const geminiRoutes = require("./routes/gemini");

// 3. Init Other Middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use("/api/gemini", geminiRoutes);

app.use("/api/issues", require("./routes/supportTicketRoutes"));
app.use("/api/disasters", require("./routes/disasterRoutes"));


app.use('/api/audit', require('./routes/auditRoutes'));
app.use('/api/waste', require('./routes/wasteRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/weather', require('./routes/weatherRoutes'));


//articles and actions
app.use("/api/actions", require("./routes/actionRoutes"));
app.use("/api/articles", require("./routes/articleRoutes"));

app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders/", require("./routes/orderRoutes"));

const User = require('./models/User');

// Test Admin Route
app.get('/api/admin/dashboard', [authMiddleware, admin], (req, res) => {
    res.json({ msg: 'This is a protected admin route', user: req.user });
});



const PORT = process.env.PORT || 5500;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);

    cron.schedule("0 0 * * *", async () => {
        try {
            console.log("Checking for expired orders...");
            await processExpiredOrders();
        } catch (error) {
            console.error("Error processing expired orders:", error.message);
        }
    });
});

