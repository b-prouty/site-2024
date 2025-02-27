function generateSessionId() {
    if (!localStorage.getItem('sessionId')) {
        const timestamp = new Date().getTime();
        const random = Math.random().toString(36).substring(2, 15);
        const sessionId = `${timestamp}-${random}`;
        localStorage.setItem('sessionId', sessionId);
    }
    return localStorage.getItem('sessionId');
}

async function askBrian() {
    const sessionId = generateSessionId();
    
    const question = document.getElementById('question').value;
    const container = document.querySelector('#conversation-container');
    const topContent = document.querySelector('#top-content');
    const chipsContainer = document.querySelector('#chips-container');
    const inputContainer = document.querySelector('#input-container');
    const mainContainer = document.querySelector('#container');
    const body = document.querySelector('body');

    if (!question || question.trim() === '') {
        alert('Please enter a question.');
        return;
    } else {
        toggleLoadingState(true);
        if(topContent.style.opacity !== '0%') {
            topContent.style.opacity = '0%';
            topContent.classList.add('chat-active')
            container.classList.add('chat-active');
            chipsContainer.classList.add('chat-active');
            inputContainer.classList.add('chat-active');
            mainContainer.classList.add('chat-active');
            body.classList.add('chat-active');
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

        console.log('response:', response);

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
                            
                            // Process images
                            const images = Array.from(answerText.getElementsByTagName('img'));
                            let currentGroup = [];
                            
                            for (let i = 0; i < images.length; i++) {
                                const img = images[i];
                                
                                // Add lightbox attributes
                                if (!img.hasAttribute('data-lightbox')) {
                                    img.setAttribute('data-lightbox', 'true');
                                    img.addEventListener('click', () => openLightbox(img.src));
                                }
                                
                                // Check if this image is consecutive with the previous one
                                const isConsecutive = currentGroup.length > 0 && 
                                    Array.from(img.parentNode.childNodes)
                                        .filter(node => {
                                            // Filter out empty text nodes
                                            return !(node.nodeType === Node.TEXT_NODE && !node.textContent.trim());
                                        })
                                        .some((node, index, array) => {
                                            const prevIndex = array.indexOf(currentGroup[currentGroup.length - 1]);
                                            return prevIndex !== -1 && index === prevIndex + 1;
                                        });
                                
                                if (isConsecutive) {
                                    currentGroup.push(img);
                                } else {
                                    // If we have a previous group, wrap it
                                    if (currentGroup.length > 1) {
                                        const container = document.createElement('div');
                                        container.className = 'sample-img-container';
                                        currentGroup[0].parentNode.insertBefore(container, currentGroup[0]);
                                        currentGroup.forEach(groupImg => {
                                            // Remove from parent (usually a <p> tag)
                                            if (groupImg.parentNode.tagName === 'P') {
                                                groupImg.parentNode.removeChild(groupImg);
                                            }
                                            container.appendChild(groupImg);
                                        });
                                    }
                                    // Start new group with current image
                                    currentGroup = [img];
                                }
                            }
                            
                            // Handle the last group
                            if (currentGroup.length > 1) {
                                const container = document.createElement('div');
                                container.className = 'sample-img-container';
                                currentGroup[0].parentNode.insertBefore(container, currentGroup[0]);
                                currentGroup.forEach(groupImg => {
                                    if (groupImg.parentNode.tagName === 'P') {
                                        groupImg.parentNode.removeChild(groupImg);
                                    }
                                    container.appendChild(groupImg);
                                });
                            }
                            
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
            const deploymentUrl = 'https://script.google.com/macros/s/AKfycbykoBDjHEuJSEVe-DJaYzYx75EoRoSFbAzTx_DPhJWV77UAF58Oxxe56NVXW7VBCYgp/exec';
            
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = deploymentUrl;
            form.target = 'hidden-iframe';
            form.style.display = 'none';

            // Add sessionId to the form data
            const sessionInput = document.createElement('input');
            sessionInput.type = 'hidden';
            sessionInput.name = 'sessionId';
            sessionInput.value = sessionId;
            form.appendChild(sessionInput);

            // Format timestamp as MM/DD/YYYY HH:MM:SS
            const now = new Date();
            const formattedTimestamp = now.toLocaleString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).replace(',', '');

            const timestampInput = document.createElement('input');
            timestampInput.type = 'hidden';
            timestampInput.name = 'timestamp';
            timestampInput.value = formattedTimestamp;
            form.appendChild(timestampInput);

            // Existing form inputs
            const questionInput = document.createElement('input');
            questionInput.type = 'hidden';
            questionInput.name = 'question';
            questionInput.value = question;
            form.appendChild(questionInput);

            const responseInput = document.createElement('input');
            responseInput.type = 'hidden';
            responseInput.name = 'response';
            responseInput.value = responseText;
            form.appendChild(responseInput);

            // Create hidden iframe to prevent page reload
            const iframe = document.createElement('iframe');
            iframe.name = 'hidden-iframe';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            // Add form to body and submit
            document.body.appendChild(form);
            form.submit();

            // Clean up after submission
            setTimeout(() => {
                document.body.removeChild(form);
                document.body.removeChild(iframe);
            }, 1000);

            console.log('Data submitted via form');
            
        } catch (sheetError) {
            console.error('Error details:', {
                message: sheetError.message,
                name: sheetError.name,
                stack: sheetError.stack
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

function createLightbox() {
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close">&times;</button>
            <button class="lightbox-nav prev">&lt;</button>
            <img src="" alt="Lightbox image">
            <button class="lightbox-nav next">&gt;</button>
        </div>
    `;
    document.body.appendChild(lightbox);

    // Add event listeners
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.prev').addEventListener('click', showPrevImage);
    lightbox.querySelector('.next').addEventListener('click', showNextImage);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    return lightbox;
}

let currentImageIndex = 0;
let imagesArray = [];

function openLightbox(imageSrc) {
    let lightbox = document.getElementById('lightbox');
    if (!lightbox) {
        lightbox = createLightbox();
    }

    // Get all images in the conversation
    const allImages = document.querySelectorAll('.answer-text img');
    imagesArray = Array.from(allImages).map(img => img.src);
    currentImageIndex = imagesArray.indexOf(imageSrc);

    const lightboxImg = lightbox.querySelector('img');
    lightboxImg.src = imageSrc;
    
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Update navigation buttons visibility
    updateNavButtons();
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function showPrevImage() {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        const lightboxImg = document.querySelector('.lightbox img');
        lightboxImg.src = imagesArray[currentImageIndex];
        updateNavButtons();
    }
}

function showNextImage() {
    if (currentImageIndex < imagesArray.length - 1) {
        currentImageIndex++;
        const lightboxImg = document.querySelector('.lightbox img');
        lightboxImg.src = imagesArray[currentImageIndex];
        updateNavButtons();
    }
}

function updateNavButtons() {
    const prevButton = document.querySelector('.lightbox .prev');
    const nextButton = document.querySelector('.lightbox .next');
    
    prevButton.style.display = currentImageIndex === 0 ? 'none' : 'block';
    nextButton.style.display = currentImageIndex === imagesArray.length - 1 ? 'none' : 'block';
} 