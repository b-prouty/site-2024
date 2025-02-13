async function askBrian() {
    toggleLoadingState(true);
    const question = document.getElementById('question').value;
    const container = document.querySelector('#conversation-container');
    const topContent = document.querySelector('#top-content');
    const chipsContainer = document.querySelector('#chips-container');

    if (!question) {
        alert('Please enter a question.');
        return;
    } else {
        
        if(!topContent.classList.contains('chat-active')) {
            // Add chat-active classes
            container.classList.add('chat-active');
            topContent.classList.add('chat-active');
            chipsContainer.classList.add('chat-active');
        }

        // Create new conversation element
        const questionWrapper = document.createElement('div');
        questionWrapper.className = 'question-wrapper';
        
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        
        const questionText = document.createElement('p');
        questionText.innerText = question;
        
        questionDiv.appendChild(questionText);
        questionWrapper.appendChild(questionDiv);
        container.appendChild(questionWrapper);
        container.scrollTop = container.scrollHeight;
    }
    // Create new conversation element
    const answerWrapper = document.createElement('div');
    answerWrapper.className = 'answer-wrapper';
    
    const answerDiv = document.createElement('div');
    answerDiv.className = 'answer';
    
    const answerText = document.createElement('p');

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased to 30 seconds

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
        container.appendChild(answerWrapper);
        

        container.scrollTop = container.scrollHeight;
        
        toggleLoadingState(false);
    } catch (error) {
        const container = document.querySelector('#conversation-container');

        console.error('Error:', error);
        let errorMessage = 'Sorry, there was an error processing your request. Please try asking your question again. ';
        
        // Add specific message for abort errors
        if (error.name === 'AbortError') {
            errorMessage += 'The request took too long to complete. Please try again.';
        } else {
            errorMessage += error.message;
        }

        answerText.innerText = errorMessage;
        answerDiv.classList.add('error');
        answerDiv.appendChild(answerText);
        answerWrapper.appendChild(answerDiv);
        container.appendChild(answerWrapper);
        container.scrollTop = container.scrollHeight;
        toggleLoadingState(false);
    }


    
} 