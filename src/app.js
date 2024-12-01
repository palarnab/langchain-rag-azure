const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");
const fileupload = require("express-fileupload");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xssClean = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const compression = require("express-compression");

const { connectDB } = require("./config/db");
const errorHandler = require("./middleware/error");

// load config
dotenv.config();

// connect to db
connectDB();

// Route files
const admin = require("./services/admin/route");
const auth = require("./services/auth/route");
const chat = require("./services/chat/route");

const app = express();
app.set("trust proxy", true);

// compression
app.use(compression());

// file upload
app.use(fileupload());
app.use(express.static(path.join(__dirname, "./../public")));

// data parser middleware
app.use(express.json());

// cookie parser for accessing cookie
app.use(cookieParser());

// mongo sanitize data
app.use(mongoSanitize());

// security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'"],
      },
    },
  })
);

// prevent xss attacks
app.use(xssClean());

// rate limiting
app.use(
  rateLimit({
    windowMs: 10 * 60 * 1000, // 10min
    max: process.env.MAX_RATE_LIMIT || 200,
  })
);

// prevent http param pollution
app.use(hpp());

// server identification
app.use(function (req, res, next) {
  res.setHeader("rag-azure", process.env.SERVERNAME);
  next();
});

app.get("/health", (req, res) => {
  res.status(200).send("healthy");
});

app.use("/api/v1/admin", admin);
app.use("/api/v1/auth", auth);
app.use("/api/v1/chat", chat);

app.use(errorHandler);

module.exports = app;
