async function askBrian() {
    const question = document.getElementById('question').value;

    if (!question) {
        alert('Please enter a question.');
        return;
      }
      
      const response = await fetch('/api/ask', {  // Use relative path to access Next.js API route
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      
    const data = await response.json();
    // console.log(data.answer); 
    console.log('Data:', data);
    document.getElementById('answer').innerText = data.answer || 'No answer available.';
  }