if (process.env.NODE_ENV !== "production")
    require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const { STATUS_CODES } = require('http');
const { urlencoded } = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local')
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const flash = require('connect-flash');
const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
//my own modules
const ExpressError = require('./utils/ExpressError');

const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const helmet = require("helmet");// Helmet helps you secure your Express apps by setting various HTTP headers. 
const MongoStore = require('connect-mongo');




//'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected")
});

const app = express();

app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());
app.use(helmet());// using it will let us using all the middleware that comes with hemlmet  

const secret = process.env.SECRET || 'thisshouldbeabettersecret';
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret,
    }
});

store.on("error",function(e){
    console.log("SESSION STORE ERROR",e);
})

const sessionConfig = {
    store,
    name: '_fyc',// this in order not to use the default cookie name (without this it shows connect.id), 
    // and there might be a hacker and use it for his own script  and use this field connect.id 
    secret, ,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,//this in order to add extra security and prevent revealing the cookie to  third party 
        //secure:true,// this says this cookie should only work over https
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,//there is a lot of reason that we want to expire a cookie.
        maxAge: 1000 * 60 * 60 * 24 * 7//, for instasnce we dont want a user to be login in for ever in our website.
    }

}

app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());//in case we need persistence login session
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())// used in order to serialize the user and store it in the session
passport.deserializeUser(User.deserializeUser())//how to remove  user from a session 

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
//This is the array that needs added to
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/", // added to styleSrcUrls
    "https://use.fontawesome.com/" // added to styleSrcUrls
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [
    "https://fonts.gstatic.com/",
    "https://cdn.jsdelivr.net/",
    "https://use.fontawesome.com/"];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                'https://res.cloudinary.com/dn7otedur/', //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use((req, res, next) => {

    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
})



app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);


app.get('/', (req, res) => {
    res.render('home');
})


app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
})
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'oh no,something went wrong';
    res.status(statusCode).render('error', { err });

})

app.listen(3000, () => {
    console.log('serving on port 3000');
})


