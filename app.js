const express 				= require('express'),
	  mongoose 				= require('mongoose'),
	  passport 				= require('passport'),
	  bodyParser			= require('body-parser'),
	  LocalStrategy 		= require('passport-local'),
	  passportLocalMongoose = require('passport-local-mongoose'),
	  User					= require('./models/user');

const app = express();

mongoose.connect("mongodb://localhost:27017/auth_demo_app", {useNewUrlParser: true});

app.use(require("express-session")( {
	secret: "write anything you want",
	resave: false,
	saveUninitialized: false
}));
app.set('view engine', 'ejs');

// Setting up passport for our app
app.use(passport.initialize());
app.use(passport.session());	
app.use(bodyParser.urlencoded({extended: true}));

// We have added the serializeUser() and deSerializeUser() with the User Schema in the models/user.js file.
// Used for reading the session and taking the data from a session to encode and decode it.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));

app.get('/', (req, res) => {
	res.render('home');
});

app.get('/secret', isLoggedIn, (req, res) => {
	// Here we need to add a middleware just to check if there is a user logged in or not. Without that middleware everyone could access the page directly via the URL
	res.render('secret');
});

// Auth Routes
// Show sign up form
app.get('/register', (req, res) => {
	res.render('register');
});
// Handling user signup
app.post('/register', (req, res) => {
	
	// Add a body parser and configure it
	// We don't save the password in our DB directly, insetead we pass it as an arugment and passport will hash it into a string
	User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
		if(err) {
			console.log(err);
			return res.render('register');
		}
		// The next line will log the user in
		passport.authenticate("local")(req, res, () => {
			res.redirect("/secret");
		});
	});
});

// LOGIN ROUTE
app.get('/login', (req, res) => {
	res.render('login');
});
// login logic
// middleware
app.post('/login', passport.authenticate("local", {
	successRedirect: "/secret",
	failureRedirect: "/login"	
}), (req, res) => {} );

// LOGOUT ROUTE
app.get("/logout", (req, res) => {
	// It ends the user session
	req.logout();
	res.redirect("/");
});

// Function to check if a user is logged in or not
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		// move along, eveyrthing is fine.
		return next(); 
	}
	res.redirect("/login");
}

app.listen(3000, () => {
	console.log('Server is running...');
});