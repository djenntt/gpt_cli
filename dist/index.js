import dotenv from 'dotenv';
import * as fs from 'fs/promises';
import { Configuration, OpenAIApi } from 'openai';
dotenv.config();
const config = new Configuration({
    organization: process.env.OPENAI_ORG,
    apiKey: process.env.OPENAI_API_KEY,
});
const CONTEXT_FILE = 'context.txt';
const loadContext = async () => {
    try {
        await fs.access(CONTEXT_FILE, fs.constants.F_OK);
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            await fs.writeFile(CONTEXT_FILE, '');
            console.warn('Context file not found. Creating new one.');
        }
    }
    try {
        const data = await fs.readFile(CONTEXT_FILE, 'utf8');
        const lines = data.split('\n').filter(Boolean);
        return lines.map((line) => {
            const [prompt, response] = line.split('|');
            return { prompt, response };
        });
    }
    catch (err) {
        return [];
    }
};
const saveContext = async (updatedContext) => {
    const data = updatedContext
        .map(({ prompt, response }) => `${prompt}|${response ? response.replace('\n\n', '\n') : ''}`)
        .join('\n');
    await fs.writeFile(CONTEXT_FILE, data);
};
const clearContext = async () => {
    await fs.writeFile(CONTEXT_FILE, '');
};
const openai = new OpenAIApi(config);
async function generateResponse(prompt) {
    const loadedContext = await loadContext();
    const prompts = loadedContext.map(({ prompt }) => prompt).join('\n') + prompt;
    const response = (await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: prompts,
        temperature: 0.7,
        max_tokens: 75,
        top_p: 1.0,
        frequency_penalty: 0.5,
        presence_penalty: 0.0,
    }));
    const newEntry = {
        prompt,
        response: response.data.choices[0].text,
    };
    const newContext = [...loadedContext, newEntry];
    await saveContext(newContext);
    return response.data.choices[0].text;
}
const prompt = process.argv.slice(2).join(' ').trim();
if (!prompt.length)
    console.error('Error: Please provide a valid prompt.');
else if (prompt === 'clear') {
    clearContext()
        .then(() => console.log('GPT: Cleared.'))
        .catch((error) => console.error('Error:', error));
}
else {
    generateResponse(prompt)
        .then((response) => console.log(`GPT: ${response}`))
        .catch((error) => console.error('Error:', error));
}
