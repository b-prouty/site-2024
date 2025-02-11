async function askBrian() {
    toggleLoadingState(true);
    const question = document.getElementById('question').value;

    if (!question) {
        alert('Please enter a question.');
        return;
    } else {
        // Create new conversation element
        const questionWrapper = document.createElement('div');
        questionWrapper.className = 'question-wrapper';
        
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        
        const questionText = document.createElement('p');
        questionText.innerText = question;
        
        questionDiv.appendChild(questionText);
        questionWrapper.appendChild(questionDiv);
        document.querySelector('#conversation-container').appendChild(questionWrapper);
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
        
        // Create new conversation element
        const answerWrapper = document.createElement('div');
        answerWrapper.className = 'answer-wrapper';
        
        const answerDiv = document.createElement('div');
        answerDiv.className = 'answer';
        
        const answerText = document.createElement('p');
        answerText.innerText = data.answer || 'No answer available.';
        
        answerDiv.appendChild(answerText);
        answerWrapper.appendChild(answerDiv);
        document.querySelector('#conversation-container').appendChild(answerWrapper);
        
        // Add chat-active classes
        // document.querySelector('#answer').classList.add('chat-active');
        document.querySelector('#conversation-container').classList.add('chat-active');
        document.querySelector('.top-content').classList.add('chat-active');
        
        toggleLoadingState(false);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('answer').innerText = 'Sorry, there was an error processing your request.';
        toggleLoadingState(false);
    }
    
} 