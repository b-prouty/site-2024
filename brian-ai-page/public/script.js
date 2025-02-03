async function askBrian() {
    const question = document.getElementById('question').value;
  
    if (!question) {
      alert('Please enter a question.');
      return;
    }
  
    // const response = await fetch('/ask', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ question }),
    // });

    const response = await fetch('public/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
  
    const data = await response.json();
    console.log('Data:', data);
    document.getElementById('answer').innerText = data.answer || 'No answer available.';
  }