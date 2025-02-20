WhatsApp Chat Fine-Tuning Example

This project demonstrates how to fine-tune an OpenAI model using WhatsApp chat data. The script processes a WhatsApp chat export file and creates a fine-tuning dataset in the format required by OpenAI's API.

Prerequisites:
- Node.js and npm installed
- OpenAI API key
- Exported WhatsApp chat file (whatsapp.txt)

Setup:
1. Install dependencies: npm install
2. Set your OpenAI API key: export OPENAI_API_KEY="sk-..."
3. Place your WhatsApp chat export file as "whatsapp.txt" in the project root

Usage:
Run the script with: npm start

The script will:
1. Parse the WhatsApp chat export file
2. Convert chat messages into training examples
3. Create a JSONL file with the training data
4. Upload the file to OpenAI
5. Start a fine-tuning job

The generated model will learn to respond in a style similar to the WhatsApp conversation participants.

Note: Make sure your WhatsApp export file follows the format:
[DD/MM/YY, HH:mm:ss] Sender Name: Message content

The script automatically filters out messages containing "immagine omessa" (omitted image) and empty messages.

Author: Gian Marco Ferrara
License: ISC