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
3. Install dependencies:
```
npm install
```
4. Start the development server:
```
npm start
```

### Usage
1. Enter your OpenAI API key in the designated field
2. Enter your fine-tuned model ID (from the output of the fine-tuning process)
3. Select which participant you want to impersonate from the dropdown
4. Type your message and click Send
5. The AI will respond in the style of the selected participant

## How It Works
The application uses the OpenAI Chat Completions API to interact with your fine-tuned model. It sends a system message instructing the model to mimic the selected participant's communication style, along with the conversation history.

## Note
This application requires an internet connection to interact with the OpenAI API. Your API key and model ID are not stored anywhere except in your browser's memory during the session.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.