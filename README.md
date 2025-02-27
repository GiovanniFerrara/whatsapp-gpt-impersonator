# WhatsApp Chat Fine-Tuning & Impersonation

[![GitHub](https://img.shields.io/github/license/GiovanniFerrara/whatsapp-gpt-impersonator)](https://github.com/GiovanniFerrara/whatsapp-gpt-impersonator/blob/main/LICENSE)

This project demonstrates how to fine-tune an OpenAI model using WhatsApp chat data and then interact with it through a React-based chat interface where you can choose which participant to impersonate.

![WhatsApp Impersonator Demo](https://github.com/GiovanniFerrara/whatsapp-gpt-impersonator/raw/main/demo-screenshot.png)

## Part 1: Fine-Tuning the Model

The script processes a WhatsApp chat export file and creates a fine-tuning dataset in the format required by OpenAI's API.

### Prerequisites:
- Node.js and npm installed
- OpenAI API key
- Exported WhatsApp chat file (whatsapp.txt)

### Setup:
1. Install dependencies: `npm install`
2. Set your OpenAI API key: `export OPENAI_API_KEY="sk-..."`
3. Place your WhatsApp chat export file as "whatsapp.txt" in the project root

### Usage:
Run the script with: `npm start`

The script will:
1. Parse the WhatsApp chat export file
2. Convert chat messages into training examples
3. Create a JSONL file with the training data
4. Upload the file to OpenAI
5. Start a fine-tuning job

The generated model will learn to respond in a style similar to the WhatsApp conversation participants.

**Note**: Make sure your WhatsApp export file follows the format:
`[DD/MM/YY, HH:mm:ss] Sender Name: Message content`

The script automatically filters out messages containing "immagine omessa" (omitted image) and empty messages.

## Part 2: Chat Interface for Impersonation

Once you have fine-tuned your model, you can use the included React application to have conversations where the AI impersonates different participants from your chat.

### Features:
- Select who you are writing as and who the AI should respond as
- Realistic WhatsApp-style interface
- Real-time conversation with your fine-tuned model
- Environment variable for API key storage

### Setup:
1. Run the setup script: `./setup-chat-interface.sh`
2. Add your OpenAI API key to the .env file created in the chat-interface directory
3. Start the application: `cd chat-interface && npm start`
4. Open your browser to http://localhost:3000
5. Enter your fine-tuned model ID (from the output of the fine-tuning process)
6. Start chatting!

For more details on the chat interface, see the [Chat Interface README](chat-interface/README.md).

## Privacy Note

This tool is designed to be used locally, and no conversation data is sent to any servers except the OpenAI API for generating responses. Your WhatsApp data and conversations remain private and are not shared with any third parties.

## Author: Gian Marco Ferrara
## License: ISC