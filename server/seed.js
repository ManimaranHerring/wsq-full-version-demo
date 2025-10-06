const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./src/db');

(async () => {
  await db.initDB();

  const users = [
    { name:'Platform Admin', email:'admin@wsq.sg', role:'admin', password:'Admin@123' },
    { name:'Corporate HR',   email:'hr@company.sg', role:'corporate', password:'Hr@123' },
    { name:'Training Provider', email:'provider@train.sg', role:'provider', password:'Prov@123' },
    { name:'Learner Demo',   email:'learner@demo.sg', role:'learner', password:'Learn@123' }
  ];
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    db.insertUser({ id: uuidv4(), name: u.name, email: u.email, role: u.role, passwordHash: hash });
  }

  const courses = [
    { title:'WSQ Safety Orientation',    mode:'Classroom', price:120, location:'Jurong', providerName:'Training Provider', ownerEmail:'provider@train.sg' },
    { title:'WSQ Digital Skills Basics', mode:'Online',    price:80,  location:'Remote', providerName:'Training Provider', ownerEmail:'provider@train.sg' }
  ];
  for (const c of courses) db.insertCourse({ id: uuidv4(), ...c });

  console.log('Seed complete.');
})();
