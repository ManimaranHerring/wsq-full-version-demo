const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const dbmod = require('./src/db');

const PORT = process.env.PORT || 4000;
const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { sameSite: 'lax' }
}));

function requireRole(...roles){
  return (req,res,next)=>{
    if (!req.session.user) return res.status(401).json({ error:'Not logged in' });
    if (!roles.includes(req.session.user.role)) return res.status(403).json({ error:'Forbidden' });
    next();
  };
}

// --- Auth ---
app.post('/api/auth/login', async (req,res)=>{
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing email/password' });
  const user = dbmod.getUserByEmail(email);
  if (!user) return res.status(400).json({ error: 'Invalid email or password' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ error: 'Invalid email or password' });
  req.session.user = { id:user.id, name:user.name, email:user.email, role:user.role };
  res.json({ ok:true, user:req.session.user });
});

app.post('/api/auth/register', async (req,res)=>{
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password || !role) return res.status(400).json({ error:'Missing fields' });
  if (!['learner','provider'].includes(role)) return res.status(400).json({ error:'Only learner/provider can self-register' });
  if (dbmod.getUserByEmail(email)) return res.status(400).json({ error:'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 10);
  const id = uuidv4();
  dbmod.insertUser({ id, name, email, role, passwordHash });
  req.session.user = { id, name, email, role };
  res.json({ ok:true, user:req.session.user });
});

app.get('/api/auth/me', (req,res)=> res.json({ user: req.session.user || null }));
app.post('/api/auth/logout', (req,res)=> req.session.destroy(()=> res.json({ ok:true })));

// --- Public courses ---
app.get('/api/courses', (req,res)=> res.json({ courses: dbmod.getAllCourses() }));

// --- Provider ---
app.get('/api/provider/courses', requireRole('provider'), (req,res)=>{
  res.json({ courses: dbmod.getCoursesByOwnerEmail(req.session.user.email) });
});
app.post('/api/provider/courses', requireRole('provider'), (req,res)=>{
  const { title, mode, price, location } = req.body || {};
  if (!title) return res.status(400).json({ error:'Title is required' });
  const course = {
    id: uuidv4(),
    title,
    mode: mode || 'Classroom',
    price: Number(price || 0),
    location: location || 'Singapore',
    providerName: req.session.user.name,
    ownerEmail: req.session.user.email
  };
  dbmod.insertCourse(course);
  res.json({ ok:true, course });
});

// --- Corporate ---
app.get('/api/corporate/learners', requireRole('corporate'), (req,res)=>{
  res.json({ learners: dbmod.getAllLearners() });
});

// --- Admin ---
app.get('/api/admin/summary', requireRole('admin'), (req,res)=>{
  res.json(dbmod.getSummaryCounts());
});

// --- Health ---
app.get('/api/health', (_req,res)=> res.json({ ok:true }));

(async ()=> {
  await dbmod.initDB();
  app.listen(PORT, ()=> console.log('API running on http://localhost:'+PORT));
})();
