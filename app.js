var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var methodOverride = require('method-override');
var expressLayouts = require('express-ejs-layouts');
var session = require('express-session');
var flash = require('connect-flash');
var { initDatabase } = require('./models/database');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var travelersRouter = require('./routes/travelers');

var app = express();

// Initialize database
initDatabase().then(() => {
  console.log('Database initialized successfully');
}).catch(err => {
  console.error('Database initialization failed:', err);
});

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Session and flash configuration
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));
app.use(flash());

// Make flash messages available to all views
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Global EJS helper for status badge
app.locals.getStatusBadge = function(status) {
  const statusClasses = {
    'normal': 'bg-green-100 text-green-800',
    'vip': 'bg-yellow-100 text-yellow-800',
    'complique': 'bg-red-100 text-red-800'
  };
  const statusLabels = {
    'normal': 'Normal',
    'vip': 'VIP',
    'complique': 'Compliqué'
  };
  return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || statusClasses.normal}">${statusLabels[status] || status}</span>`;
};

// Global EJS helper for date formatting
app.locals.formatDate = function(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride('_method')); // For PUT/DELETE requests
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/travelers', travelersRouter);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).render('error', {
    title: 'Page non trouvée',
    message: 'La page demandée n\'existe pas'
  });
});

// Error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {
    title: 'Erreur',
    message: err.message
  });
});

module.exports = app;
