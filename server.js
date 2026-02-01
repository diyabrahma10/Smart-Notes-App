import express from "express";
import path from "path";
import { registerRouter } from "./routers/auth.routes/register.route.js";
import session from "express-session";
import flash from "connect-flash";
import { loginRouter } from "./routers/auth.routes/login.route.js";
import cookieParser from "cookie-parser";
import { dashRouter } from "./routers/dashboard.route.js";



const app = express();

app.set("view engine", "ejs");
app.set("views", "views");
app.use(cookieParser())
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// session (required for flash)
app.use(session({
  secret: process.env.SESSION_SECRET || "smartnotes-secret",
  resave: false,
  saveUninitialized: false
}));

// flash
app.use(flash());

app.use((req, res, next) => {
    res.locals.flashErrors = req.flash("error");     // from redirects
    res.locals.flashSuccess = req.flash("success"); 
    res.locals.errorr= [];
    res.locals.success=[];
    res.locals.user = null;
    res.locals.urls = [];
    next();
})

app.get("/", (req, res) => {
    res.redirect('/register');
});

app.use('/', registerRouter);
app.use('/', loginRouter);
app.use('/dashboard', dashRouter);

app.listen(3000, () => {
    console.log(`Server running on http://localhost:${3000}`);
});