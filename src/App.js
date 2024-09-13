import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Grid,
  Paper,
  CircularProgress,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme();

const App = () => {
  const [input, setInput] = useState(() => localStorage.getItem('input') || '');
  const [useChatGPT, setUseChatGPT] = useState(
    () => JSON.parse(localStorage.getItem('useChatGPT')) || false
  );
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('apiKey') || '');
  const [targetLanguage, setTargetLanguage] = useState(
    () => localStorage.getItem('targetLanguage') || 'Spanish'
  );
  const [sentenceCount, setSentenceCount] = useState(
    () => parseInt(localStorage.getItem('sentenceCount')) || 5
  );
  const [howManyTargetWordsToUse, setHowManyTargetWordsToUse] = useState(
    () => parseInt(localStorage.getItem('howManyTargetWordsToUse')) || 30
  );
  const [useNarrativeDetails, setUseNarrativeDetails] = useState(
    () => JSON.parse(localStorage.getItem('useNarrativeDetails')) || false
  );
  const [narrativeDetails, setNarrativeDetails] = useState(
    () => localStorage.getItem('narrativeDetails') || ''
  );
  const [translateToEnglishAfterward, setTranslateToEnglishAfterward] = useState(
    () => JSON.parse(localStorage.getItem('translateToEnglishAfterward')) || false
  );
  const [llamaUrl, setLlamaUrl] = useState(
    () => localStorage.getItem('llamaUrl') || 'http://localhost:11434/api/generate'
  );
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
  }, [
    input,
    useChatGPT,
    apiKey,
    targetLanguage,
    sentenceCount,
    howManyTargetWordsToUse,
    llamaUrl,
    useNarrativeDetails,
    narrativeDetails,
    translateToEnglishAfterward,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const vocabList = input
      .split('\n')
      .filter((line) => line.trim() && !line.startsWith('#'))
      .map((line) => {
        const [wordInTargetLanguage, wordInNativeLanguage] = line.split('\t'); // Adjusted for tab separation
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
    prompt += `The story should make use of the following ${targetLanguage} words/phrases:\n${vocabList
      .map((word) => `${word.wordInTargetLanguage} - ${word.wordInNativeLanguage}`)
      .join('\n')}`;

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

  async function sendPromptToChatGPT(prompt, apiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
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
        body: JSON.stringify(requestData),
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

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="md" sx={{ mb: 4 }}>
        <Box sx={{ mt: 4 }}>
          <Typography component="h1" variant="h3" align="center" gutterBottom>
            Anki Story Writer
          </Typography>
          <Typography variant="h6" align="center" color="textSecondary" paragraph>
            This app uses AI to generate a short story that makes use of a random selection of the
            vocabulary words you're learning with Anki.
          </Typography>
        </Box>
        <Paper elevation={3} sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  id="vocab-input"
                  label="Deck Pasted from an Anki Export"
                  multiline
                  rows={6}
                  variant="outlined"
                  fullWidth
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Export an Anki deck's cards into a text file. You can do this in the desktop version of Anki (not AnkiWeb) by clicking Browse, then (from the menu) Notes -> Export Notes. Set the export format to 'Notes in Plain Text (.txt)', and uncheck the box that says 'Include HTML and media references'.

That resulting text file should have one card per line, with a tab separating the question and answer.

Then, copy and paste the entire file contents here.`}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  id="target-language"
                  label="Target Language"
                  variant="outlined"
                  fullWidth
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  id="sentence-count"
                  label="Number of Sentences"
                  type="number"
                  variant="outlined"
                  fullWidth
                  value={sentenceCount}
                  onChange={(e) => setSentenceCount(parseInt(e.target.value) || 0)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  id="target-words"
                  label="Number of Target Words"
                  type="number"
                  variant="outlined"
                  fullWidth
                  value={howManyTargetWordsToUse}
                  onChange={(e) => setHowManyTargetWordsToUse(parseInt(e.target.value) || 0)}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={useChatGPT}
                      onChange={(e) => setUseChatGPT(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Use ChatGPT"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  id="api-input"
                  label={useChatGPT ? 'OpenAI API Key' : 'Llama3 URL'}
                  variant="outlined"
                  fullWidth
                  type={useChatGPT ? 'password' : 'text'}
                  value={useChatGPT ? apiKey : llamaUrl}
                  onChange={(e) =>
                    useChatGPT ? setApiKey(e.target.value) : setLlamaUrl(e.target.value)
                  }
                  placeholder={useChatGPT ? 'Enter OpenAI API Key' : 'Enter Llama3 URL'}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={useNarrativeDetails}
                      onChange={(e) => setUseNarrativeDetails(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Describe the Type of Story You Want"
                />
                {useNarrativeDetails && (
                  <TextField
                    id="narrative-details"
                    label="Narrative Details"
                    variant="outlined"
                    fullWidth
                    value={narrativeDetails}
                    onChange={(e) => setNarrativeDetails(e.target.value)}
                    placeholder="Provide details about the kind of story you want..."
                    sx={{ mt: 2 }}
                  />
                )}
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={translateToEnglishAfterward}
                      onChange={(e) => setTranslateToEnglishAfterward(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Provide an English Translation"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={isLoading}
                  startIcon={isLoading && <CircularProgress size={24} />}
                >
                  {isLoading ? 'Generating...' : 'Generate Story'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {output && (
          <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Generated Story:
            </Typography>
            <Typography variant="body1" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
              {output}
            </Typography>
          </Paper>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default App;
