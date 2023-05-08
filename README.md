# GPT CLI

A quick example for interacting with the OpenAI GPT API. It's not meant to be a full-featured CLI, but rather a way to test out prompts and see what the API returns.

## Installation

```bash
yarn install
```

## Setup

You'll need to create a `.env` file in the root of the project with your OpenAI API key.

```bash
OPENAI_ORG="org-xxxxxxxxxxxxxxxxxxxxxxxx"
OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

## Usage

### Prompts

Similar to chat.openai.com, you can chain prompts together to create a conversation.

```bash
yarn gpt suggest top 5 scifi books
```

```txt
GPT:

1. Dune by Frank Herbert
2. The Hitchhiker's Guide to the Galaxy by Douglas Adams
3. Foundation by Isaac Asimov
4. The War of the Worlds by H.G. Wells
5. Ender's Game by Orson Scott Card
```

```bash
yarn gpt update this to include fantasy
```

```txt

GPT:

1. The Lord of the Rings by J.R.R. Tolkien
2. Harry Potter and the Sorcerer's Stone by J.K. Rowling
3. A Game of Thrones by George R.R. Martin
4. The Wheel of Time Series by Robert Jordan
5. The Chronicles of Narnia by C.S Lewis
```

This all gets saved to a file called `context.txt` in the root of the project.

### Clearing Context

```bash
yarn gpt clear
```

This will empty the context file.
