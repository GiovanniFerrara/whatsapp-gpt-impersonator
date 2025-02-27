import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, Dropdown, Card } from 'react-bootstrap';
import OpenAI from 'openai';

// Define the types of participants
const participants = [
  "Luca Zambello",
  "Gian Marco",
  "Giovanni Moretto",
  "Aleksandra Kondricz",
  "Jason Lopez",
  "Erika",
  "Nikit",
  "Svitlana Siklitska",
  "Matteo Pillon",
  "Dany Suarez",
  "Maro"
];

// Message interface
interface Message {
  role: 'user' | 'assistant';
  content: string;
  sender?: string;
}

const ChatInterface: React.FC = () => {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(participants[0]);
  const [apiKey, setApiKey] = useState('');
  const [modelId, setModelId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message to OpenAI API
  const sendMessage = async () => {
    if (!input.trim() || !apiKey || !modelId) return;

    // Add user message
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const openai = new OpenAI({ apiKey });
      
      // Create system message to instruct the AI to impersonate the selected participant
      const systemContent = `You are ${selectedParticipant} in a WhatsApp conversation. 
        Respond naturally in ${selectedParticipant}'s communication style and personality. 
        Keep responses conversational and match the tone of the chat.`;
      
      // Create conversation history
      const conversation = [
        { role: 'system', content: systemContent },
        ...messages.map(msg => ({ 
          role: msg.role, 
          content: msg.content 
        })),
        { role: 'user', content: input }
      ];

      // Send to OpenAI
      const response = await openai.chat.completions.create({
        model: modelId,
        messages: conversation as any,
        temperature: 0.7,
        max_tokens: 300,
      });

      // Add AI response
      const aiMessage: Message = { 
        role: 'assistant', 
        content: response.choices[0].message.content || 'No response', 
        sender: selectedParticipant 
      };
      
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      
      // Add error message
      const errorMessage: Message = { 
        role: 'assistant', 
        content: 'Error: Failed to get a response. Please check your API key and model ID.',
        sender: 'System'
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="mb-4">
        <Col md={6}>
          <h2>WhatsApp Chat Impersonator</h2>
          <p>Interact with your fine-tuned model to mimic chat participants</p>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>OpenAI API Key</Form.Label>
            <Form.Control
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Model ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your fine-tuned model ID"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <div 
            className="chat-container border rounded p-3 mb-3" 
            style={{ height: '400px', overflowY: 'auto', backgroundColor: '#e5e5e5' }}
          >
            {messages.map((message, index) => (
              <Card 
                key={index} 
                className={`mb-2 ${message.role === 'user' ? 'ms-auto' : 'me-auto'}`} 
                style={{ 
                  maxWidth: '75%', 
                  backgroundColor: message.role === 'user' ? '#dcf8c6' : 'white',
                  borderRadius: '10px'
                }}
              >
                <Card.Body>
                  {message.sender && (
                    <Card.Subtitle className="mb-1 text-muted">
                      {message.sender}
                    </Card.Subtitle>
                  )}
                  <Card.Text style={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Card.Text>
                </Card.Body>
              </Card>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <Form onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
            <Row>
              <Col md={3}>
                <Dropdown className="mb-3">
                  <Dropdown.Toggle variant="primary" id="dropdown-participants" className="w-100">
                    {selectedParticipant}
                  </Dropdown.Toggle>
                  <Dropdown.Menu style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {participants.map((name, index) => (
                      <Dropdown.Item 
                        key={index} 
                        onClick={() => setSelectedParticipant(name)}
                      >
                        {name}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
              <Col md={7}>
                <Form.Control
                  type="text"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                />
              </Col>
              <Col md={2}>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-100" 
                  disabled={loading || !input.trim() || !apiKey || !modelId}
                >
                  {loading ? 'Sending...' : 'Send'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default ChatInterface;