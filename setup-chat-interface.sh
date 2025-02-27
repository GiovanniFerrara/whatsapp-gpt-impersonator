#!/bin/bash

echo "Setting up WhatsApp Chat Impersonator Interface..."

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

# Navigate to the chat interface directory
cd chat-interface

# Install dependencies
echo "Installing dependencies..."
npm install

# Notify about starting the application
echo "Setup complete! You can now run the application with the following command:"
echo "cd chat-interface && npm start"
echo ""
echo "Once the application is running, open your browser to http://localhost:3000"
echo ""
echo "You will need your OpenAI API key and the fine-tuned model ID to use the application."
echo "The model ID can be found in the output of the fine-tuning script you ran earlier."