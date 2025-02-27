import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Dropdown,
  Card,
  Alert,
} from "react-bootstrap";
import OpenAI from "openai";
import { parseJSONL, extractParticipantsFromData } from "../utils/dataParser";

// Default participants as fallback
const DEFAULT_PARTICIPANTS = ["Person A", "Person B", "Person C"];

// Message interface
interface Message {
  role: "user" | "assistant";
  content: string;
  sender?: string;
}

const ChatInterface: React.FC = () => {
  // State for participants
  const [participants, setParticipants] =
    useState<string[]>(DEFAULT_PARTICIPANTS);

  // Load participants from training data
  useEffect(() => {
    const loadParticipants = async () => {
      try {
        const response = await fetch("/training_data.jsonl");
        const data = await response.text();

        // Use our utility functions to properly parse the JSONL data
        const parsedData = parseJSONL(data);
        const extractedParticipants = extractParticipantsFromData(parsedData);

        if (extractedParticipants.length > 0) {
          // Update state with the extracted participants
          setParticipants(extractedParticipants);
        }
      } catch (error) {
        console.error("Error loading participants:", error);
        // Keep the default participants if there's an error
      }
    };

    loadParticipants();
  }, []); // Empty dependency array ensures this runs once when component mounts

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [respondingParticipant, setRespondingParticipant] = useState(
    participants[0]
  );
  const [writingParticipant, setWritingParticipant] = useState(participants[1]);
  const [modelId, setModelId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update selected participants when the participants list changes
  useEffect(() => {
    if (participants.length > 0) {
      setRespondingParticipant(participants[0]);
      setWritingParticipant(participants[1] || participants[0]);
    }
  }, [participants]);

  // Get API key from environment variable
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY || "";

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message to OpenAI API
  const sendMessage = async () => {
    if (!input.trim() || !apiKey || !modelId) return;

    // Add user message with the selected sender
    const userMessage: Message = {
      role: "user",
      content: input,
      sender: writingParticipant as string,
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

      // Create system message to instruct the AI to impersonate the selected participant
      const systemContent = `You are ${respondingParticipant} in a WhatsApp conversation. 
        Respond naturally in ${respondingParticipant}'s communication style and personality. 
        Keep responses conversational and match the tone of the chat.`;

      // Create conversation history with the proper format
      const conversation = [
        { role: "system", content: systemContent },
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.sender ? `${msg.sender}: ${msg.content}` : msg.content,
        })),
        { role: "user", content: `${writingParticipant}: ${input}` },
      ];

      // Send to OpenAI
      const response = await openai.chat.completions.create({
        model: modelId,
        messages: conversation as any,
        temperature: 1,
        max_tokens: 300,
      });

      // Get the response content and add the AI response
      let responseContent =
        response.choices[0].message.content || "No response";

      // If the model included the name in the response, strip it out
      const namePrefix = `${respondingParticipant}: `;
      if (responseContent.startsWith(namePrefix)) {
        responseContent = responseContent.substring(namePrefix.length);
      }

      const aiMessage: Message = {
        role: "assistant",
        content: responseContent,
        sender: respondingParticipant,
      };

      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error("Error calling OpenAI API:", error);

      // Add error message
      const errorMessage: Message = {
        role: "assistant",
        content:
          "Error: Failed to get a response. Please check the API key in your .env file and your model ID.",
        sender: "System",
      };

      setMessages((prevMessages) => [...prevMessages, errorMessage]);
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
          {!apiKey && (
            <Alert variant="warning">
              OpenAI API key not found in environment variables. Please add your
              API key to the .env file as REACT_APP_OPENAI_API_KEY.
            </Alert>
          )}
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Model ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your fine-tuned model ID"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
            />
            <Form.Text className="text-muted">
              Enter the ID of your fine-tuned model (from the output of the
              fine-tuning process)
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <div
            className="chat-container border rounded p-3 mb-3"
            style={{
              height: "400px",
              overflowY: "auto",
              backgroundColor: "#e5e5e5",
            }}
          >
            {messages.map((message, index) => (
              <Card
                key={index}
                className={`mb-2 ${
                  message.role === "user" ? "ms-auto" : "me-auto"
                }`}
                style={{
                  maxWidth: "75%",
                  backgroundColor:
                    message.role === "user" ? "#dcf8c6" : "white",
                  borderRadius: "10px",
                }}
              >
                <Card.Body>
                  {message.sender && (
                    <Card.Subtitle className="mb-1 text-muted">
                      {message.sender}
                    </Card.Subtitle>
                  )}
                  <Card.Text style={{ whiteSpace: "pre-wrap" }}>
                    {message.content}
                  </Card.Text>
                </Card.Body>
              </Card>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <Form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>You are writing as:</Form.Label>
                  <Dropdown>
                    <Dropdown.Toggle
                      variant="outline-primary"
                      id="dropdown-writing"
                      className="w-100"
                    >
                      {writingParticipant}
                    </Dropdown.Toggle>
                    <Dropdown.Menu
                      style={{ maxHeight: "200px", overflowY: "auto" }}
                    >
                      {participants.map((name, index) => (
                        <Dropdown.Item
                          key={index}
                          onClick={() => setWritingParticipant(name)}
                        >
                          {name}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>AI should respond as:</Form.Label>
                  <Dropdown>
                    <Dropdown.Toggle
                      variant="outline-success"
                      id="dropdown-responding"
                      className="w-100"
                    >
                      {respondingParticipant}
                    </Dropdown.Toggle>
                    <Dropdown.Menu
                      style={{ maxHeight: "200px", overflowY: "auto" }}
                    >
                      {participants.map((name, index) => (
                        <Dropdown.Item
                          key={index}
                          onClick={() => setRespondingParticipant(name)}
                        >
                          {name}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={10}>
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
                  {loading ? "Sending..." : "Send"}
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
