const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

let SQL = null;
let db = null;

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'wsq.sqlite');

async function initDB(){
  if (!SQL){
    SQL = await initSqlJs({
      locateFile: file => path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', file)
    });
  }
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive:true });

  if (fs.existsSync(DB_PATH)){
    const filebuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(filebuffer);
  } else {
    db = new SQL.Database();
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL,
        passwordHash TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        mode TEXT,
        price REAL,
        location TEXT,
        providerName TEXT,
        ownerEmail TEXT
      );
    `);
    persist();
  }
}
function persist(){
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}
function run(sql, params=[]){
  const stmt = db.prepare(sql); stmt.bind(params); stmt.step(); stmt.free(); persist();
}
function all(sql, params=[]){
  const stmt = db.prepare(sql); stmt.bind(params);
  const rows = []; while (stmt.step()) rows.push(stmt.getAsObject()); stmt.free(); return rows;
}
function get(sql, params=[]){ const rows = all(sql, params); return rows[0] || null; }

function insertUser(u){ run('INSERT INTO users (id,name,email,role,passwordHash) VALUES (?,?,?,?,?)',[u.id,u.name,u.email,u.role,u.passwordHash]); }
function getUserByEmail(email){ return get('SELECT * FROM users WHERE lower(email)=lower(?)',[email]); }
function getAllLearners(){ return all('SELECT id,name,email,role FROM users WHERE role=?',['learner']); }

function insertCourse(c){ run('INSERT INTO courses (id,title,mode,price,location,providerName,ownerEmail) VALUES (?,?,?,?,?,?,?)',[c.id,c.title,c.mode,c.price,c.location,c.providerName,c.ownerEmail]); }
function getAllCourses(){ return all('SELECT * FROM courses ORDER BY title'); }
function getCoursesByOwnerEmail(email){ return all('SELECT * FROM courses WHERE ownerEmail=? ORDER BY title',[email]); }

function getSummaryCounts(){
  const q = t => (get(t).n || 0);
  return {
    totalUsers: q('SELECT COUNT(*) n FROM users'),
    learners: q('SELECT COUNT(*) n FROM users WHERE role="learner"'),
    corporates: q('SELECT COUNT(*) n FROM users WHERE role="corporate"'),
    providers: q('SELECT COUNT(*) n FROM users WHERE role="provider"'),
    admins: q('SELECT COUNT(*) n FROM users WHERE role="admin"'),
    courses: q('SELECT COUNT(*) n FROM courses')
  };
}

module.exports = {
  initDB, insertUser, getUserByEmail, getAllLearners,
  insertCourse, getAllCourses, getCoursesByOwnerEmail,
  getSummaryCounts
};
