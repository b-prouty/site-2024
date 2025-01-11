async function askBrian() {
    const question = document.getElementById('question').value;
  
    if (!question) {
      alert('Please enter a question.');
      return;
    }
  
    const response = await fetch('/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
  
    const data = await response.json();
    document.getElementById('answer').innerText = data.answer || 'No answer available.';
  }