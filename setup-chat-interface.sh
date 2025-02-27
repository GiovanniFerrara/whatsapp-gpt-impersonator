#!/bin/bash

echo "Setting up WhatsApp Chat Impersonator Interface..."

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

# Navigate to the chat interface directory
cd chat-interface

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    echo "REACT_APP_OPENAI_API_KEY=" > .env
    echo "Please open the .env file and add your OpenAI API key."
else
    echo ".env file already exists."
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Notify about starting the application
echo "Setup complete!"
echo ""
echo "Before running the application, make sure to:"
echo "1. Add your OpenAI API key to the .env file (REACT_APP_OPENAI_API_KEY=your_key_here)"
echo ""
echo "Then run the application with:"
echo "cd chat-interface && npm start"
echo ""
echo "Once the application is running, open your browser to http://localhost:3000"
echo ""
echo "You will need the fine-tuned model ID to use the application."
echo "The model ID can be found in the output of the fine-tuning script you ran earlier."