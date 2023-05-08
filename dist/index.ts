import dotenv from 'dotenv'
import * as fs from 'fs/promises'
import { Configuration, OpenAIApi } from 'openai'

dotenv.config()

type Choice = {
	text: string
}

type CompletionResponseData = {
	choices: Choice[]
}

type CreateCompletionResponse = {
	data: CompletionResponseData
}

const config = new Configuration({
	organization: process.env.OPENAI_ORG,
	apiKey: process.env.OPENAI_API_KEY,
})

const CONTEXT_FILE = 'context.txt'

interface ContextEntry {
	prompt: string
	response: string
}

const loadContext = async (): Promise<ContextEntry[]> => {
	try {
		await fs.access(CONTEXT_FILE, fs.constants.F_OK)
	} catch (err: any) {
		if (err.code === 'ENOENT') {
			await fs.writeFile(CONTEXT_FILE, '')
			console.warn('Context file not found. Creating new one.')
		}
	}

	try {
		const data = await fs.readFile(CONTEXT_FILE, 'utf8')
		const lines = data.split('\n').filter(Boolean)
		return lines.map((line) => {
			const [prompt, response] = line.split('|')
			return { prompt, response }
		})
	} catch (err) {
		return []
	}
}

const saveContext = async (updatedContext: ContextEntry[]): Promise<void> => {
	const data = updatedContext
		.map(
			({ prompt, response }) =>
				`${prompt}|${response ? response.replace('\n\n', '\n') : ''}`
		)
		.join('\n')
	await fs.writeFile(CONTEXT_FILE, data)
}

const clearContext = async (): Promise<void> => {
	await fs.writeFile(CONTEXT_FILE, '')
}

const openai = new OpenAIApi(config)

const generateResponse = async (prompt: string): Promise<string> => {
	const loadedContext = await loadContext()
	const prompts =
		loadedContext.map(({ prompt }) => prompt).join('\n') + prompt

	const response = (await openai.createCompletion({
		model: 'text-davinci-003',
		prompt: prompts,
		temperature: 0.7,
		max_tokens: 75,
		top_p: 1.0,
		frequency_penalty: 0.5,
		presence_penalty: 0.0,
	})) as CreateCompletionResponse

	await saveContext([
		...loadedContext,
		{
			prompt,
			response: response.data.choices[0].text,
		},
	])

	return response.data.choices[0].text
}

const prompt = process.argv.slice(2).join(' ').trim()

if (!prompt.length) console.error('Error: Please provide a valid prompt.')
else if (prompt === 'clear') {
	clearContext()
		.then(() => console.log('GPT: Cleared.'))
		.catch((error) => console.error('Error:', error))
} else {
	generateResponse(prompt)
		.then((response) => console.log(`GPT: ${response}`))
		.catch((error) => console.error('Error:', error))
}
