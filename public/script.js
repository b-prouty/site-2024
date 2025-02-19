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
    
    const answerText = document.createElement('div');
    answerText.className = 'answer-text';
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

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let responseText = '';

        answerDiv.appendChild(answerText);
        answerWrapper.appendChild(answerDiv);
        container.appendChild(answerWrapper);

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;

                    try {
                        const { content } = JSON.parse(data);
                        if (content) {
                            responseText += content;
                            answerText.innerHTML = marked.parse(responseText);
                            container.scrollTop = container.scrollHeight;
                        }
                    } catch (e) {
                        console.error('Error parsing chunk:', e);
                    }
                }
            }
        }

        toggleLoadingState(false);

        // Send data to Google Sheets
        try {
            const response = await fetch('https://script.google.com/macros/s/AKfycbxQjbHzeMdRlZkcbQ6PanpjiDZTzGv18h5AeveFqagxzFZ1XeQ1-bOxwdvjk08MJUOi/exec', {
                method: 'POST',
                mode: 'cors',
                credentials: 'omit',
                redirect: 'follow',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question: question,
                    response: responseText
                })
            });
            
            // Log everything for debugging
            console.log('Response status:', response.status);
            console.log('Response headers:', [...response.headers.entries()]);
            
            const responseData = await response.text();
            console.log('Response data:', responseData);
            
            // Try to parse the response
            try {
                const jsonResponse = JSON.parse(responseData);
                console.log('Parsed response:', jsonResponse);
            } catch (parseError) {
                console.log('Raw response (not JSON):', responseData);
            }
            
        } catch (sheetError) {
            console.error('Error details:', {
                message: sheetError.message,
                name: sheetError.name,
                stack: sheetError.stack,
                // Add any custom properties that might be present
                response: sheetError.response,
                status: sheetError.status
            });
        }

        
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