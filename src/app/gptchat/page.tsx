'use client';

import { useState, useEffect } from 'react';

const ChatPage = () => {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>(
    []
  );
  const [userInput, setUserInput] = useState<string>('');
  const [streamedMessage, setStreamedMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    // This ensures the component runs only on the client-side
    setIsClient(true);
  }, []);

  const sendMessage = () => {
    if (!userInput.trim()) return;

    setLoading(true);
    setMessages((prev) => [...prev, { role: 'user', text: userInput }]);
    setStreamedMessage('');

    const eventSource = new EventSource(
      `/api/chat2?message=${encodeURIComponent(userInput)}`
    );

    eventSource.onmessage = (event) => {
      console.log('Received token:', event.data);
      const token = event.data;

      if (token === '[DONE]') {
        eventSource.close();
        setMessages((prev) => [...prev, { role: 'ai', text: streamedMessage }]);
        setLoading(false);
      } else {
        setStreamedMessage((prev) => prev + token);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Error with EventSource:', error);
      eventSource.close();
      setLoading(false);
    };

    setUserInput('');
  };

  if (!isClient) {
    return null; // Render nothing initially until client-side JavaScript is ready
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white shadow-md p-6 rounded-lg">
        <div className="h-96 overflow-y-auto mb-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-2 ${
                msg.role === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-black'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {streamedMessage && (
            <div className="text-left">
              <div className="inline-block p-3 bg-gray-200 text-black rounded-lg">
                {streamedMessage}
              </div>
            </div>
          )}
        </div>
        <div className="flex">
          <input
            type="text"
            className="flex-grow border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600"
            onClick={sendMessage}
            disabled={loading}
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
