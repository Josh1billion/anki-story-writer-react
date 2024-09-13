import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [input, setInput] = useState(() => localStorage.getItem('input') || '');
  const [useChatGPT, setUseChatGPT] = useState(() => JSON.parse(localStorage.getItem('useChatGPT')) || false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('apiKey') || '');
  const [targetLanguage, setTargetLanguage] = useState(() => localStorage.getItem('targetLanguage') || 'Spanish');
  const [sentenceCount, setSentenceCount] = useState(() => parseInt(localStorage.getItem('sentenceCount')) || 5);
  const [howManyTargetWordsToUse, setHowManyTargetWordsToUse] = useState(() => parseInt(localStorage.getItem('howManyTargetWordsToUse')) || 30);
  const [useNarrativeDetails, setUseNarrativeDetails] = useState(() => JSON.parse(localStorage.getItem('useNarrativeDetails')) || false);
  const [narrativeDetails, setNarrativeDetails] = useState(() => localStorage.getItem('narrativeDetails') || '');
  const [translateToEnglishAfterward, setTranslateToEnglishAfterward] = useState(() => JSON.parse(localStorage.getItem('translateToEnglishAfterward')) || false);
  const [llamaUrl, setLlamaUrl] = useState(() => localStorage.getItem('llamaUrl') || 'http://localhost:11434/api/generate');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('input', input);
    localStorage.setItem('useChatGPT', JSON.stringify(useChatGPT));
    localStorage.setItem('apiKey', apiKey);
    localStorage.setItem('targetLanguage', targetLanguage);
    localStorage.setItem('sentenceCount', sentenceCount.toString());
    localStorage.setItem('howManyTargetWordsToUse', howManyTargetWordsToUse.toString());
    localStorage.setItem('llamaUrl', llamaUrl);
    localStorage.setItem('useNarrativeDetails', JSON.stringify(useNarrativeDetails));
    localStorage.setItem('narrativeDetails', narrativeDetails);
    localStorage.setItem('translateToEnglishAfterward', JSON.stringify(translateToEnglishAfterward));
  }, [input, useChatGPT, apiKey, targetLanguage, sentenceCount, howManyTargetWordsToUse, llamaUrl, useNarrativeDetails, narrativeDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const vocabList = input.split('\n')
      .filter(line => line.trim() && !line.startsWith('#'))
      .map(line => {
        const [wordInTargetLanguage, wordInNativeLanguage] = line.split(' - ');
        return { wordInTargetLanguage, wordInNativeLanguage };
      })
      .sort(() => 0.5 - Math.random())
      .slice(0, howManyTargetWordsToUse);

    let prompt = `Write a short story in ${targetLanguage} consisting of ${sentenceCount} sentences.\n`;
    if (useNarrativeDetails) {
      prompt += `${narrativeDetails}\n`;
    }
    if (translateToEnglishAfterward) {
      prompt += `Provide a direct English translation of the entire story afterward.\n`;
    }
    prompt += `The story should make use of the following Spanish words/phrases:\n${vocabList.map(word => `${word.wordInTargetLanguage} - ${word.wordInNativeLanguage}`).join('\n')}`;

    try {
      const response = useChatGPT
        ? await sendPromptToChatGPT(prompt, apiKey)
        : await sendPromptToLlama3(prompt, llamaUrl);
      setOutput(response);
    } catch (error) {
      console.error('Error:', error);
      setOutput('An error occurred while generating the story.');
    }
    setIsLoading(false);
  };

  return (
    <div className="app-container">
      <div className="content-container">
        <h1 className="app-title">Anki Story Writer</h1>
        <div className="app-description">This app uses AI to generate a short story that makes use of a random selection of the vocabulary words you're learning with Anki.</div>
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label htmlFor="vocab-input">Deck pasted from an Anki export</label>
            <textarea
              id="vocab-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Export an Anki deck's cards into a text file. You can do this in the desktop version of Anki (not AnkiWeb) by clicking Browse, then (from the menu) Notes -> Export Notes.  Set the export format to 'Notes in Plain Text (.txt)', and uncheck the box that says 'Include HTML and media references'.

That resulting text file should have one card per line, with a tab separating the question and answer.

Then, copy and paste the entire file contents here."
              rows={10}
              className="textarea-input"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="target-language">Target Language</label>
              <input
                id="target-language"
                type="text"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="text-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="sentence-count">Number of Sentences</label>
              <input
                id="sentence-count"
                type="number"
                value={sentenceCount}
                onChange={(e) => setSentenceCount(parseInt(e.target.value))}
                className="text-input"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="target-words">Number of Target Words</label>
              <input
                id="target-words"
                type="number"
                value={howManyTargetWordsToUse}
                onChange={(e) => setHowManyTargetWordsToUse(parseInt(e.target.value))}
                className="text-input"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group toggle-group">
              <label htmlFor="use-chatgpt">Use ChatGPT</label>
              <div className="toggle-switch">
                <input
                  id="use-chatgpt"
                  type="checkbox"
                  checked={useChatGPT}
                  onChange={(e) => setUseChatGPT(e.target.checked)}
                />
                <label htmlFor="use-chatgpt" className="slider"></label>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="api-input">{useChatGPT ? 'OpenAI API Key' : 'Llama3 URL'}</label>
            <input
              id="api-input"
              type="text"
              value={useChatGPT ? apiKey : llamaUrl}
              onChange={(e) => useChatGPT ? setApiKey(e.target.value) : setLlamaUrl(e.target.value)}
              placeholder={useChatGPT ? 'Enter OpenAI API Key' : 'Enter Llama3 URL'}
              className="text-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="useNarrativeDetails">
              <div className="toggle-switch">
                <input type="checkbox" id="useNarrativeDetails" onChange={(e) => setUseNarrativeDetails(e.target.checked)} />
                <label htmlFor="useNarrativeDetails" className="slider"></label>
              </div>
              Describe the type of story you want
            </label>
            {useNarrativeDetails && <input type="text" className="text-input" value={narrativeDetails} onChange={(e) => setNarrativeDetails(e.target.value)} placeholder="Provide details for the AI about what kind of story you want. For example, you can write 'It should be a story about a ninja mouse named Bob.'" />}
          </div>
          <div className="form-group">
            <label htmlFor="translateToEnglishAfterward">
              <div className="toggle-switch">
                <input type="checkbox" id="translateToEnglishAfterward" onChange={(e) => setTranslateToEnglishAfterward(e.target.checked)} />
                <label htmlFor="translateToEnglishAfterward" className="slider"></label>
              </div>
              Provide an English translation
            </label>
          </div>
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Story'}
          </button>
        </form>
        {output && (
          <div className="output-container">
            <h2 className="output-title">Generated Story:</h2>
            <div className="output-content">
              <pre>{output}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
  
async function sendPromptToChatGPT(prompt, apiKey) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await response.json();
  return data.choices[0].message.content.trim();
}

async function sendPromptToLlama3(prompt, llamaUrl = 'http://localhost:11434/api/generate') {
  const requestData = { model: 'llama3', prompt };
  let resultString = '';
  try {
    const response = await fetch(llamaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    const data = await response.text();
    const strings = data.split('\n');
    for (const str of strings) {
      if (str) {
        const responseObj = JSON.parse(str);
        resultString += responseObj.response;
      }
    }
    return resultString.trim();
  } catch (error) {
    console.error('Error calling Llama3 API:', error);
    throw error;
  }
}

export default App;
