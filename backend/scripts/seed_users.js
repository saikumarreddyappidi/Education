const API = 'http://127.0.0.1:5003/api';

async function register(user) {
  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    const data = await res.json();
    console.log(`Register ${user.registrationNumber}:`, res.status, data);
  } catch (err) {
    console.error('Register error:', err);
  }
}

(async () => {
  await register({ registrationNumber: 'STAFF123', password: 'Staff@123', role: 'staff', year: '2025', semester: '1', subject: 'Mathematics' });
  await register({ registrationNumber: 'STU001', password: 'Student@123', role: 'student', year: '2025', semester: '1', course: 'Computer Science' });
  console.log('Seeding complete');
})();
