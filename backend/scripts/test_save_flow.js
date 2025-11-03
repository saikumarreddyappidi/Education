(async () => {
  const API = 'http://localhost:5003/api';
  const headers = {'Content-Type':'application/json'};
  try {
    console.log('--- STAFF LOGIN ---');
    let res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ registrationNumber: 'STAFF123', password: 'Staff@123' })
    });
    let data = await res.json();
    console.log('STAFF LOGIN STATUS', res.status, data);
    const staffToken = data.token;

    console.log('\n--- CREATE SHARED NOTE AS STAFF ---');
    res = await fetch(`${API}/notes`, {
      method: 'POST',
      headers: { ...headers, Authorization: `Bearer ${staffToken}` },
      body: JSON.stringify({ title: 'Shared Note from Staff', content: 'This is shared content', tags: ['exam'], shared: true })
    });
    data = await res.json();
    console.log('CREATE NOTE STATUS', res.status, data);

    console.log('\n--- STUDENT LOGIN ---');
    res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ registrationNumber: 'STU001', password: 'Student@123' })
    });
    data = await res.json();
    console.log('STUDENT LOGIN STATUS', res.status, data);
    const studentToken = data.token;

    console.log('\n--- SEARCH STAFF NOTES AS STUDENT ---');
    res = await fetch(`${API}/notes/search/STAFF123`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    data = await res.json();
    console.log('SEARCH STATUS', res.status, JSON.stringify(data, null, 2));

    if (data && data.notes && data.notes.length > 0) {
      const noteId = data.notes[0]._id;
      console.log('\n--- SAVE NOTE TO STUDENT ACCOUNT ---', noteId);
      res = await fetch(`${API}/notes/save/${noteId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      const saveData = await res.json();
      console.log('SAVE STATUS', res.status, JSON.stringify(saveData, null, 2));

      console.log('\n--- FETCH STUDENT NOTES ---');
      res = await fetch(`${API}/notes/my`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      const myNotes = await res.json();
      console.log('MY NOTES STATUS', res.status, JSON.stringify(myNotes, null, 2));
    } else {
      console.log('No shared notes found for STAFF123');
    }
  } catch (err) {
    console.error('ERROR DURING TEST FLOW:', err);
  }
})();
