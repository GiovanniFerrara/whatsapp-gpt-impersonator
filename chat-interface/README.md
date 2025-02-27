# WhatsApp Chat Impersonator

This React application allows you to interact with your fine-tuned OpenAI model to mimic different participants in your WhatsApp chat.

## Features
- Select which chat participant to impersonate
- Realistic WhatsApp-style interface
- Real-time conversation with your fine-tuned model
- Conversation history

## Getting Started

### Prerequisites
- Node.js and npm installed
- OpenAI API Key
- Fine-tuned model ID from your training process

### Installation
1. Clone this repository
2. Navigate to the project directory
3. Create a `.env` file in the root of the chat-interface directory with your OpenAI API key:
```
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
```
4. Install dependencies:
```
npm install
```
5. Start the development server:
```
npm start
```

### Usage
1. The app will automatically use the API key from your `.env` file
2. Enter your fine-tuned model ID (from the output of the fine-tuning process)
3. Select who you are writing as from the first dropdown
4. Select who the AI should respond as from the second dropdown
5. Type your message and click Send
6. The AI will respond in the style of the selected participant

## How It Works
The application uses the OpenAI Chat Completions API to interact with your fine-tuned model. It sends a system message instructing the model to mimic the selected participant's communication style, along with the conversation history.

## Note
This application requires an internet connection to interact with the OpenAI API. Your model ID is not stored anywhere except in your browser's memory during the session. Your API key is stored in the `.env` file, which should not be committed to your repository (it's in `.gitignore`).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.