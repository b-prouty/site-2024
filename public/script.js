async function askBrian() {
    const question = document.getElementById('question').value;

    if (!question) {
        alert('Please enter a question.');
        return;
    }
    
    try {
        const response = await fetch('/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question }),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data:', data);
        document.querySelector('#answer').classList.add('chat-active');
        document.querySelector('.top-content').classList.add('chat-active');
        document.getElementById('answer').innerText = data.answer || 'No answer available.';
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('answer').innerText = 'Sorry, there was an error processing your request.';
    }
} 