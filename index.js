const express = require("express");
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const http = require('http');
const initializeSocket = require('./chat/socket/socket');
const errorHandler = require('./middlewares/errorHandler');

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

const io = initializeSocket(server);

// ============== DB Connection =============
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("db connected successfully"))
  .catch((err) => {
    console.log("err in connecting to database", err);
    process.exit(1);
  });

// ============== Middlewares =============
app.use(cors({
  origin: true,
  credentials: true,
}));


app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(errorHandler);
// ============== Routes =============
// Auth Routes
const authRouter = require('./routes/auth.routes');
const userRouter = require('./routes/user.routes');

app.use('/api/v1', authRouter);
app.use('/api/v1/users', userRouter);

// Astrologer Routes
const astrologerRouter = require('./routes/astrologer.routes');
app.use('/api/v1/astrologers', astrologerRouter);

// Review Routes
const reviewRouter = require('./routes/review.routes');
app.use('/api/v1/reviews', reviewRouter);

// Chat Routes
const chatRouter = require('./chat/routes/chat.routes');
app.use('/api/v1/chat', chatRouter);

// ============== Astrology Routes =============
const horoscopeRouter = require('./astroCalculation/routes/horoscope.route');
app.use('/api/v1/horoscope', horoscopeRouter);

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});