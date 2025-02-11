async function askBrian() {
    const question = document.getElementById('question').value;

    if (!question) {
        alert('Please enter a question.');
        return;
      }
      
      const response = await fetch(window.location.origin + '/api/ask', {  // Use window.location.origin to get the correct base URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      
    const data = await response.json();
    // console.log(data.answer); 
    console.log('Data:', data);
    document.getElementById('answer').innerText = data.answer || 'No answer available.';
  }