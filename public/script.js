function generateSessionId() {
    if (!localStorage.getItem('sessionId')) {
        const timestamp = new Date().getTime();
        const random = Math.random().toString(36).substring(2, 15);
        const sessionId = `${timestamp}-${random}`;
        localStorage.setItem('sessionId', sessionId);
    }
    return localStorage.getItem('sessionId');
}

// Add conversation history tracking
let conversationHistory = [];

async function askBrian() {
    const sessionId = generateSessionId();
    
    const questionInput = document.getElementById('question');
    const question = questionInput.value.trim();  // Use trim() to handle whitespace
    const container = document.querySelector('#conversation-container');
    const topContent = document.querySelector('#top-content');
    const chipsContainer = document.querySelector('#chips-container');
    const inputContainer = document.querySelector('#input-container');
    const mainContainer = document.querySelector('#container');
    const body = document.querySelector('body');

    if (!question) {
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

        // Add the current question to conversation history
        conversationHistory.push({ role: "user", content: question });

        const response = await fetch('/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                question,
                conversationHistory 
            }),
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
                        const parsedData = JSON.parse(data);
                        const { content, conversationHistory: updatedHistory } = parsedData;
                        
                        if (content) {
                            responseText += content;
                            answerText.innerHTML = marked.parse(responseText);
                            
                            // Update conversation history if provided in the response
                            if (updatedHistory) {
                                conversationHistory = updatedHistory;
                            }
                            
                            container.scrollTop = container.scrollHeight;
                        }
                    } catch (e) {
                        console.error('Error parsing chunk:', e);
                    }
                }
            }
        }

        // Generate and add follow-up questions after the complete response
        const followUpSection = generateFollowUpQuestions(responseText);
        if (followUpSection) {
            // Remove any existing follow-up section
            const existingFollowUp = answerDiv.querySelector('.follow-up-section');
            if (existingFollowUp) {
                existingFollowUp.remove();
            }
            answerDiv.appendChild(followUpSection);
        }
        
        // Add New Chat button after the response
        const newChatButton = document.createElement('button');
        newChatButton.className = 'chip';
        newChatButton.onclick = () => {
            conversationHistory = []; // Clear conversation history
            window.location.reload();
        };
        newChatButton.style.marginLeft = '.5rem';
        newChatButton.style.marginTop = '-0.75rem';
        newChatButton.style.border = 'none';
        newChatButton.innerHTML = '<img src="img/refresh.svg" alt="Refresh Chat">New Chat';
        
        // Remove any existing New Chat button before adding a new one
        const existingButton = answerWrapper.querySelector('.chip');
        if (existingButton) {
            existingButton.remove();
        }
        answerWrapper.appendChild(newChatButton);
        
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

        toggleLoadingState(false);
        stopPlaceholderAnimation();

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
        // stopPlaceholderAnimation();
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

// Add this new function to generate follow-up questions
function generateFollowUpQuestions(content) {
    // Define categories and their related follow-up patterns
    const categories = {
        projects: {
            trigger: /(project|case study|redesign|improved|developed)/i,
            related: [
                "What were the key results of this project?",
                "What teams were involved in this project?",
                "How long did this project take?",
                "What was your specific role in this project?"
            ],
            explore: [
                "Tell me about your design process",
                "What design tools do you use?",
                "How do you measure success?"
            ]
        },
        experience: {
            trigger: /(experience|worked|role|position|job)/i,
            related: [
                "What were your main responsibilities?",
                "What skills did you use most?",
                "Can you tell me about a specific project?",
                "What teams did you collaborate with?"
            ],
            explore: [
                "What are your career goals?",
                "Tell me about your ideal role",
                "What industries interest you most?"
            ]
        },
        design_process: {
            trigger: /(design process|methodology|approach|research|testing)/i,
            related: [
                "How do you validate your design decisions?",
                "What research methods do you use?",
                "How do you collaborate with developers?",
                "How do you measure success?"
            ],
            explore: [
                "Tell me about your recent projects",
                "What design tools do you use?",
                "How do you handle design systems?"
            ]
        },
        leadership: {
            trigger: /(lead|mentor|manage|team)/i,
            related: [
                "How do you approach mentoring?",
                "What's your collaboration style?",
                "How do you handle design reviews?",
                "How do you maintain design consistency?"
            ],
            explore: [
                "Tell me about your design process",
                "What are your strengths?",
                "How do you measure KPIs?"
            ]
        },
        tools: {
            trigger: /(tool|figma|sketch|software|prototype)/i,
            related: [
                "How do you use these tools in your workflow?",
                "What prototyping tools do you prefer?",
                "How do you handle design handoff?",
                "Do you have experience with other tools?"
            ],
            explore: [
                "Tell me about your design process",
                "How do you collaborate with developers?",
                "What's your approach to design systems?"
            ]
        },
        personal: {
            trigger: /(hobby|interest|personal|value|life)/i,
            related: [
                "What inspires your designs?",
                "How do these interests influence your work?",
                "What are your core values?",
                "How do you maintain work-life balance?"
            ],
            explore: [
                "Tell me about your background",
                "What's your ideal role?",
                "What are your strengths?"
            ]
        }
    };

    // Find matching categories based on the content
    const matchingCategories = Object.entries(categories)
        .filter(([_, pattern]) => pattern.trigger.test(content));

    // If no categories match, return some default exploratory questions
    if (matchingCategories.length === 0) {
        return [
            "Tell me about your background",
            "What are your recent projects?",
            "What's your design process?",
            "What are your strengths?"
        ];
    }

    // Get related and exploratory questions from matching categories
    const relatedQuestions = matchingCategories
        .flatMap(([_, pattern]) => pattern.related)
        .slice(0, 2); // Get 2 related questions

    const exploreQuestions = matchingCategories
        .flatMap(([_, pattern]) => pattern.explore)
        .slice(0, 2); // Get 2 exploratory questions

    // Create the follow-up section with both types of questions
    const followUpSection = document.createElement('div');
    followUpSection.className = 'follow-up-section';

    // Add related questions
    const relatedGroup = document.createElement('div');
    relatedGroup.className = 'follow-up-group';
    
    const relatedTitle = document.createElement('p');
    relatedTitle.className = 'follow-up-title';
    relatedTitle.textContent = 'Related questions:';
    relatedGroup.appendChild(relatedTitle);

    const relatedContainer = document.createElement('div');
    relatedContainer.className = 'chip-container';
    relatedQuestions.forEach(question => {
        const chip = document.createElement('button');
        chip.className = 'chip related';
        chip.textContent = question;
        chip.onclick = () => {
            document.getElementById('question').value = question;
            askBrian();
        };
        relatedContainer.appendChild(chip);
    });
    relatedGroup.appendChild(relatedContainer);
    followUpSection.appendChild(relatedGroup);

    // Add exploratory questions
    const exploreGroup = document.createElement('div');
    exploreGroup.className = 'follow-up-group';
    
    const exploreTitle = document.createElement('p');
    exploreTitle.className = 'follow-up-title';
    exploreTitle.textContent = 'Explore more:';
    exploreGroup.appendChild(exploreTitle);

    const exploreContainer = document.createElement('div');
    exploreContainer.className = 'chip-container';
    exploreQuestions.forEach(question => {
        const chip = document.createElement('button');
        chip.className = 'chip explore';
        chip.textContent = question;
        chip.onclick = () => {
            document.getElementById('question').value = question;
            askBrian();
        };
        exploreContainer.appendChild(chip);
    });
    exploreGroup.appendChild(exploreContainer);
    followUpSection.appendChild(exploreGroup);

    return followUpSection;
} 