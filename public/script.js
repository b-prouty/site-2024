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
    // Create new conversation element
    const answerWrapper = document.createElement('div');
    answerWrapper.className = 'answer-wrapper';
    
    const answerDiv = document.createElement('div');
    answerDiv.className = 'answer';
    
    const answerText = document.createElement('p');

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const response = await fetch('/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            if (response.status === 504) {
                throw new Error('The request timed out. Please try again.');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data:', data);
        
        
        answerText.innerText = data.answer || 'No answer available.';
        
        answerDiv.appendChild(answerText);
        answerWrapper.appendChild(answerDiv);
        const container = document.querySelector('#conversation-container');
        container.appendChild(answerWrapper);
        
        // Add chat-active classes
        container.classList.add('chat-active');
        document.querySelector('.top-content').classList.add('chat-active');

        container.scrollTop = container.scrollHeight;
        
        toggleLoadingState(false);
    } catch (error) {
        console.error('Error:', error);
        answerText.innerText = 'Sorry, there was an error processing your request. Please try asking your question again.' + error;
        answerDiv.classList.add('error');
        answerDiv.appendChild(answerText);
        answerWrapper.appendChild(answerDiv);
        document.querySelector('#conversation-container').appendChild(answerWrapper);
        toggleLoadingState(false);
    }


    
} 