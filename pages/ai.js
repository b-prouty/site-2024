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
                  <script
              dangerouslySetInnerHTML={{
                __html: `!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))} }(p=t.createElement('script')).type='text/javascript',p.crossOrigin='anonymous',p.async=!0,p.src=s.api_host.replace('.i.posthog.com','-assets.i.posthog.com')+'/static/array.js',(r=t.getElementsByTagName('script')[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a='posthog',u.people=u.people||[],u.toString=function(t){var e='posthog';return'posthog'!==a&&(e+='.'+a),t||(e+=' (stub)'),e},u.people.toString=function(){return u.toString(1)+'.people (stub)'},o='init Re Cs Fs Pe Rs Ms capture Ve calculateEventProperties Ds register register_once register_for_session unregister unregister_for_session zs getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty js As createPersonProfile Ns Is Us opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing Os debug I Ls getPageViewId captureTraceFeedback captureTraceMetric'.split(' '),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);posthog.init('phc_oEMOxaQpUpSsiQMkUb0pSZAYOicVbsyBKVOOdULdBeM',{api_host:'https://us.i.posthog.com',defaults:'2025-05-24',person_profiles:'always'})`
              }}
            />
        </Head>
      <div className={styles.container}>
        <h1>Ask Brian</h1>
        <textarea id="question" placeholder="Type your question here..."></textarea>
        <button onClick={() => window.askBrian()}>Ask</button>
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