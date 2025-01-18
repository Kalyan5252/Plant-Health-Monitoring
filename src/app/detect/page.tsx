'use client';
import React, { useRef, useState, useEffect, FormEvent } from 'react';
import { IoCloudUpload } from 'react-icons/io5';
import { FaSearch } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa';
import { RiLeafFill } from 'react-icons/ri';
import { useChat } from 'ai/react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatHelpers {
  messages: Message[];
  input: string;
  handleSubmit: (event: React.FormEvent) => void;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  isLoading: boolean;
}

// function cleanRepeatedText(input: string): string {
//   // Regular expression to match repeated words with quotation marks
//   const regex = /\b(\w+)\1+\b/g;

//   // Replace the repeated words with just one occurrence of the word
//   const cleanedText = input.replace(regex, '$1');

//   // Clean extra spaces between words and trim the string
//   return cleanedText.replace(/\s{2,}/g, ' ').trim();
// }

const Page = () => {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    initialMessages: [],
  }) as ChatHelpers;

  const [submitted, setSubmitted] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  let refString = '';

  // const [messages, setMessages] = useState<Message[]>([
  // {
  //   id: '234',
  //   role: 'user',
  //   content: 'whoch model u r',
  // },
  // ]);
  // const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setInput(e.target.value);
  // };

  // const handleSubmit = async (e: FormEvent) => {
  //   e.preventDefault();
  //   if (!input.trim()) return;

  //   const userMessage: Message = {
  //     id: Date.now().toString(),
  //     role: 'user',
  //     content: input,
  //   };

  //   setMessages((prev) => [...prev, userMessage]);
  //   console.log('length:', messages.length);
  //   // startStream();
  //   setInput('');
  //   setIsLoading(true);
  //   console.log('length:', messages.length);
  // };

  // useEffect(() => {
  //   console.log('for effect:', messages);
  //   if (messages.length > 0)
  //     if (messages[messages.length - 1].role === 'user') startStream();
  // }, [messages]);

  // Function to clean repeated words
  const cleanRepeatedText = (text: string) => {
    let cleanedString = text.replace(/([.,])\1+/g, '$1');

    // Fix repeated words (e.g., "CanCan" -> "Can", "II'll'll" -> "I'll")
    cleanedString = cleanedString.replace(/\b(\w+)\s+\1\b/g, '$1');
    cleanedString = cleanedString.replace(/\b(\w+w+)\s+\1\b/g, '$1');
    cleanedString = cleanedString.replace(/\\n/g, ' ');

    // Fix repeated contractions (e.g., "I'm'm" -> "I'm", "I'll'll" -> "I'll")
    cleanedString = cleanedString.replace(/(\w+'\w+)\1\b/gi, '$1');

    // Remove redundant punctuation (e.g., "??", "**", "::")
    cleanedString = cleanedString.replace(/([.,!?*:])\1+/g, '$1');

    // Clean up standalone symbols like "**", "::", or "** ::"
    cleanedString = cleanedString.replace(/(\*\*|::)/g, '');

    // Normalize spaces (e.g., excessive spaces or spaces around punctuation)
    cleanedString = cleanedString.replace(/\s+/g, ' ').trim();

    // Fix repeated contractions like "I'd'd" -> "I'd"
    cleanedString = cleanedString.replace(/(\w+'\w+)\s+\1\b/gi, '$1');

    // Normalize line breaks and extra whitespace
    cleanedString = cleanedString
      .replace(/\n\s*\n/g, '\n\n') // Reduce multiple line breaks to two
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim(); // Remove leading and trailing spaces

    return cleanedString;
  };

  // const fixResponse = () => {
  //   console.log('fixing:', messages);
  //   const cleanedText = cleanRepeatedText(
  //     messages[messages.length - 1].content
  //   );
  //   console.log('cleanedText:', cleanedText);
  //   // const updatedMessages = [...messages];
  //   // updatedMessages[messages.length - 1].content = cleanedText;
  //   // setMessages(updatedMessages);
  //   return cleanedText;
  // };

  // const startStream = () => {
  //   console.log('messages:', messages);
  //   // const messages = JSON.stringify({ messages });
  //   const queryParams = new URLSearchParams({
  //     messages: JSON.stringify(messages),
  //   });

  //   const eventSource = new EventSource(`/api/chat?${queryParams.toString()}`);

  //   eventSource.onmessage = (event) => {
  //     const data = event.data;
  //     // console.log(data);

  //     if (data === '[DONE]') {
  //       eventSource.close();
  //       setIsLoading(false);
  //       console.log('done mesg:', refString);
  //       setMessages((prev) => {
  //         const updatedMessages = [...prev];
  //         const assistantMessage: Message = {
  //           id: Date.now().toString(),
  //           role: 'assistant',
  //           content: cleanRepeatedText(refString),
  //         };
  //         updatedMessages[prev.length - 1] = assistantMessage;
  //         return updatedMessages;
  //       });
  //       return;
  //     }

  //     const assistantMessage: Message = {
  //       id: Date.now().toString(),
  //       role: 'assistant',
  //       content: data,
  //     };

  //     setMessages((prev) => {
  //       const lastMessage = prev[prev.length - 1];

  //       // Append to the last assistant message if it exists
  //       if (lastMessage?.role === 'assistant') {
  //         const updatedMessages = [...prev];
  //         const updatedText = cleanRepeatedText(
  //           updatedMessages[updatedMessages.length - 1].content + data
  //         );
  //         refString = updatedText;
  //         updatedMessages[updatedMessages.length - 1].content = updatedText;
  //         return updatedMessages;
  //       } else {
  //         return [...prev, assistantMessage];
  //       }
  //     });
  //   };

  //   eventSource.onerror = (error) => {
  //     console.error('SSE error:', error);
  //     eventSource.close();
  //     setIsLoading(false);
  //   };
  // };
  // useEffect(() => {
  //   if (messages.length === 0 || !isLoading) return; // Ensure no unnecessary triggers

  //   return () => {
  //     eventSource.close(); // Cleanup on unmount
  //   };
  // }, [messages, isLoading]);

  return (
    <div className="max-h-screen h-screen w-full grid grid-cols-2">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 h-full justify-center items-center"
      >
        <input type="file" accept="image/*" ref={fileRef} hidden />
        <div
          onClick={() => {
            fileRef.current?.click();
          }}
          className="p-16 cursor-pointer border-2 border-dashed flex flex-col justify-center items-center"
        >
          <IoCloudUpload size={24} />
          <h3 className="font-bold ">Upload Leaf Image</h3>
          <p className="font-bold text-xs text-gray-600/80">
            Drag and Drop here
          </p>
        </div>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          className="border-[1px] outline-none focus:border-black w-4/6 transition-all rounded-lg p-2"
          placeholder="Prompt here"
        />
        <button
          type="submit"
          className={`button font-bold px-4 py-2 rounded-full flex items-center gap-2 ${
            isLoading ? 'pointer-events-none cursor-progress' : ''
          }`}
        >
          Analyze <FaSearch size={20} />
        </button>
      </form>
      <div className="border-l-[1.6px] p-8 h-full overflow-y-scroll">
        {messages.map((m, index) => (
          <div
            key={m.id}
            className={`flex flex-col gap-4 mb-4 animate-slide-in`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {m.role === 'user' ? (
              <div className="flex gap-4 max-w-[90%] self-end">
                <div className="w-full flex gap-1 text-[1.2rem] tracking-tight rounded-xl p-4">
                  <p className=" bg-green-800 text-white p-2 rounded-lg">
                    {m.content}
                  </p>
                  <FaUser
                    size={17}
                    className="self-end p-1 bg-gray-400 text-white rounded-full"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-2">
                <div className="w-full flex gap-1 tracking-tight text-[1.2rem] rounded-xl p-4">
                  <RiLeafFill
                    size={20}
                    className="self-end p-1 bg-gray-400 text-white rounded-full"
                  />
                  <p className="max-w-[80%] bg-green-600 p-2 rounded-lg text-white">
                    {m.content}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default Page;
