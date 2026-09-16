require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');

const { verifyConnection, closeDriver } = require('./config/neo4j');
const {
  schemas,
  getStats,
  getCaseFormOptions
} = require('./services/entityService');

const entityRoutes = require('./routes/entities');
const relationshipRoutes = require('./routes/relationships');
const graphRoutes = require('./routes/graph');
const analysisRoutes = require('./routes/analysis');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../public')));


// SESSION — ONLY ONCE
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);


// =====================================================
// EJS
// =====================================================

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));


// =====================================================
// PUBLIC PAGES
// =====================================================

// Landing page
app.get('/', (req, res) => {
  res.render('landing');
});


// =====================================================
// AUTH ROUTES
// =====================================================

app.use('/', authRoutes);


// =====================================================
// DASHBOARD
// =====================================================

app.get('/dashboard', async (req, res) => {

  // User or admin must be logged in
  if (!req.session?.isUser && !req.session?.isAdmin) {
    return res.redirect('/login');
  }

  try {

    const stats = await getStats();

    res.render('dashboard', {
      stats,

      user: {
        username: req.session.username || req.session.adminUsername,
        fullName: req.session.fullName || 'Administrator',
        role: req.session.role || 'ADMIN'
      }
    });

  } catch (e) {

    console.error('Dashboard error:', e);

    res.status(500).send(
      `<h2>Dashboard Error</h2>
       <pre>${e.stack || e.message}</pre>`
    );
  }
});


// =====================================================
// DATA ENTRY
// =====================================================

app.get('/data-entry', async (req, res) => {

  try {

    const type = String(
      req.query.type || 'PERSON'
    ).toUpperCase();

    if (!schemas[type]) {
      return res.status(404).send('Unknown entity type');
    }

    const caseOptions =
      type === 'CASE'
        ? await getCaseFormOptions()
        : {};

    res.render('data-entry', {
      type,
      schema: schemas[type],
      caseOptions
    });

  } catch (e) {

    console.error('Data entry error:', e);

    res.status(500).send(e.message);
  }
});


// =====================================================
// OTHER PAGES
// =====================================================

app.get('/relationships', (req, res) => {
  res.render('relationships');
});

app.get('/graph', (req, res) => {
  res.render('graph');
});

app.get('/entity/:type/:id', (req, res) => {

  res.render('entity-detail', {
    type: String(req.params.type).toUpperCase(),
    id: req.params.id
  });

});


// =====================================================
// API HEALTH
// =====================================================

app.get('/api/health', async (req, res) => {

  try {

    await verifyConnection();

    res.json({
      success: true,
      neo4j: 'connected'
    });

  } catch (e) {

    res.status(503).json({
      success: false,
      neo4j: 'disconnected',
      error: e.message
    });

  }

});


// =====================================================
// ADMIN
// =====================================================

app.use('/admin', adminRoutes);


// =====================================================
// API ROUTES
// =====================================================

app.get('/api/stats', async (req, res) => {

  try {

    res.json({
      success: true,
      data: await getStats()
    });

  } catch (e) {

    res.status(500).json({
      success: false,
      message: e.message
    });

  }

});


app.use('/api/entities', entityRoutes);

app.use('/api/relationships', relationshipRoutes);

app.use('/api/analysis', analysisRoutes);

app.use('/api/graph', graphRoutes);

app.use('/api/ai', aiRoutes);


// =====================================================
// SERVER
// =====================================================

const server = app.listen(PORT, async () => {

  console.log(
    `✓ Server running at http://localhost:${PORT}`
  );

  try {

    await verifyConnection();

    console.log('✓ Neo4j connected');

  } catch (e) {

    console.error(
      '✗ Neo4j connection failed:',
      e.message
    );

  }

});


// =====================================================
// SHUTDOWN
// =====================================================

process.on('SIGINT', async () => {

  server.close();

  await closeDriver();

  process.exit(0);

});


process.on('SIGTERM', async () => {

  server.close();

  await closeDriver();

  process.exit(0);

});