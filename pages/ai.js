import styles from '../styles/ai.module.css'
import Head from 'next/head'
import { useEffect } from 'react'

export default function AiPage() {
  useEffect(() => {
    // Move your askBrian function here
    window.askBrian = async function() {
      const question = document.getElementById('question').value;

      if (!question) {
        alert('Please enter a question.');
        return;
      }
        
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      
      const data = await response.json();
      console.log(data.answer); 
      console.log('Data:', data);
      document.getElementById('answer').innerText = data.answer || 'No answer available.';
    }
  }, [])

  return (
    <>
      <Head>
        <title>Ask Brian</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className={styles.container}>
        <h1>Ask Brian</h1>
        <textarea id="question" placeholder="Type your question here..."></textarea>
        <button onClick={() => askBrian()}>Ask</button>
        <div id="answer"></div>
      </div>
    </>
  );
} 

// async function askBrian() {
//     const question = document.getElementById('question').value;

//     if (!question) {
//         alert('Please enter a question.');
//         return;
//       }
      
//       const response = await fetch(window.location.origin + '/api/ask', {  // Use window.location.origin to get the correct base URL
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ question }),
//       });
      
//     const data = await response.json();
//     // console.log(data.answer); 
//     console.log('Data:', data);
//     document.getElementById('answer').innerText = data.answer || 'No answer available.';
//   }