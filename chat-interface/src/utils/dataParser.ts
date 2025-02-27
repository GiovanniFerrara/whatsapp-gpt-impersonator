/**
 * Parses JSONL formatted training data
 * @param data Raw string data in JSONL format
 * @returns Array of parsed JSON objects
 */
export const parseJSONL = (data: string): any[] => {
  const result: any[] = [];
  
  // Split by newlines and filter out empty lines
  const lines = data.split(/\r?\n/).filter(line => line.trim());
  
  // Process each line individually
  for (const line of lines) {
    try {
      // Handle cases where the line might be truncated or malformed
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      // Try to parse the line as JSON
      const parsed = JSON.parse(trimmedLine);
      if (parsed) {
        result.push(parsed);
      }
    } catch (e) {
      console.warn("Failed to parse line:", line, e);
      // Continue to the next line even if current line parsing failed
    }
  }
  
  return result;
};

/**
 * Extracts participant names from training data messages
 * @param data Array of parsed training data objects
 * @returns Array of unique participant names
 */
export const extractParticipantsFromData = (data: any[]): string[] => {
  const participants = new Set<string>();
  
  for (const example of data) {
    try {
      if (example.messages && Array.isArray(example.messages)) {
        // Extract system message which contains the participant name
        const systemMessage = example.messages.find(
          (m: any) => m.role === "system"
        );
        
        if (systemMessage?.content) {
          const match = systemMessage.content.match(
            /You are ([^]+?) in a WhatsApp conversation/
          );
          if (match && match[1]) {
            participants.add(match[1].trim());
          }
        }
      }
    } catch (e) {
      console.error("Error processing example:", e);
    }
  }
  
  return Array.from(participants);
};
