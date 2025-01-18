'use client';
import React, {
  useRef,
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
} from 'react';
import { type Message, useChat } from 'ai/react';

import { IoCloudUpload } from 'react-icons/io5';
import { FaSearch } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa';
import { RiLeafFill } from 'react-icons/ri';

// import { type Message, useChat } from 'ai/react';

const fakeText = `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Accusantium,
repellat praesentium numquam modi maiores ab voluptate, est facilis
architecto officiis natus id explicabo accusamus odit quaerat excepturi
ea cum. Praesentium? Lorem ipsum dolor, sit amet consectetur adipisicing
elit. Accusantium, repellat praesentium numquam modi maiores ab
voluptate, est facilis architecto officiis natus id explicabo accusamus
odit quaerat excepturi ea cum. Praesentium? Lorem ipsum dolor, sit amet
consectetur adipisicing elit. Accusantium, repellat praesentium numquam
modi maiores ab voluptate, est facilis architecto officiis natus id
explicabo accusamus odit quaerat excepturi ea cum. Praesentium?`;

interface ChatHelpers {
  messages: Message[];
  input: string;
  handleSubmit: (event: React.FormEvent) => void;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  isLoading: boolean;
  setMessages: (messages: Message[]) => void;
}

// interface Message {
// id: number;
// role: 'user' | 'ai' | 'assistant';
// content: string;
// }

const page = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  //   const responseRef = useRef<HTMLDivElement>(nul);
  // const [startTyping, setStartTyping] = useState(false);

  // AI MODULE @ai/chat
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputText = useRef<HTMLInputElement>(null);
  const { messages, input, handleInputChange, setMessages } = useChat({
    api: '/api/chat',
    onFinish: () => {
      setIsLoading(false);
    },
    initialMessages: [
      {
        id: '1289',
        role: 'user',
        content: 'hello',
      },
      {
        id: '12289',
        role: 'assistant',
        content:
          'how can i assit u today how can i assit u today how can i assit u today',
      },
      {
        id: '345',
        role: 'user',
        content: 'no thanku',
      },
      {
        id: '331',
        role: 'user',
        content:
          'how can i assit u today how can i assit u today how can i assit u today',
      },
    ],
  }) as ChatHelpers;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;

    setSubmitted(true);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages,
            { id: Date.now().toString(), role: 'user', content: input },
          ],
        }),
      });

      const data = await response.json();

      if (data.content) {
        setMessages([
          ...messages,
          { id: Date.now().toString(), role: 'user', content: input },
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.content,
          },
        ]);
        if (inputText?.current) {
          inputText.current.value = '';
        }
      }
    } catch (error) {
      console.error('Error submitting message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // const [submitted, setSubmitted] = useState(false);
  // const messagesEndRef = useRef<HTMLDivElement>(null);

  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // };

  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  // const onSubmit = (event: React.FormEvent) => {
  //   console.log('analyze event');
  //   event.preventDefault();
  //   if (!input.trim()) return;
  //   setSubmitted(true);
  //   handleSubmit(event);
  // };

  // MY TYPING EFFECT

  // const handleAnalyze = () => {
  //   setStartTyping(true);
  // };

  // const TypingEffect = ({
  //   text,
  //   typingSpeed,
  // }: {
  //   text: string;
  //   typingSpeed: number;
  // }) => {
  //   const [displayedText, setDisplayedText] = useState('');
  //   const [index, setIndex] = useState(0);

  //   useEffect(() => {
  //     if (index < text.length) {
  //       const timeout = setTimeout(() => {
  //         setDisplayedText((prev) => prev + text[index]);
  //         setIndex((prev) => prev + 1);
  //       }, typingSpeed);
  //       return () => clearTimeout(timeout);
  //     }
  //   }, [index, text, typingSpeed]);

  //   return <p>{displayedText}</p>;
  // };

  // const [messages, setMessages] = useState<Message[]>([]);
  // const [input, setInput] = useState<string>('');
  // const [submitted, setSubmitted] = useState<boolean>(false);
  // const messagesEndRef = useRef<HTMLDivElement>(null);

  // // Scroll to the bottom when new messages are added
  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // };

  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  // // Handles the change in input field
  // const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   setInput(e.target.value);
  // };

  // // Submits the input and triggers the SSE stream
  // const handleSubmit = (event: FormEvent) => {
  //   event.preventDefault();
  //   if (!input.trim()) return;

  //   setSubmitted(true);
  //   setMessages((prevMessages) => [
  //     ...prevMessages,
  //     { id: Date.now(), role: 'user', content: input },
  //   ]);
  //   setInput(''); // Clear the input after submit

  //   // Call your backend to start streaming
  //   const eventSource = new EventSource(`/api/chat`);
  //   eventSource.onmessage = function (event) {
  //     const newMessage = { id: Date.now(), role: 'ai', content: event.data };
  //     setMessages((prevMessages) => [
  //       ...prevMessages,
  //       { id: Date.now(), role: 'user', content: input },
  //     ]);
  //   };

  //   eventSource.onerror = function () {
  //     eventSource.close();
  //   };
  // };

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
          ref={inputText}
          onChange={handleInputChange}
          className="border-[1px] outline-none focus:border-black w-4/6 transition-all rounded-lg p-2"
          placeholder="Prompt here"
        />
        <button
          type="submit"
          className="button font-bold px-4 py-2 rounded-full flex items-center gap-2"
        >
          Analyze <FaSearch size={20} />
        </button>
      </form>
      <div className="border-l-[1.6px] p-8 h-full overflow-y-scroll">
        {/* <p ref={responseRef}> */}
        {/* {startTyping && (
          <TypingEffect
            text={fakeText}
            typingSpeed={20} // Adjust typing speed
          />
        )} */}
        {/* </p> */}
        {/* {messages.map((el, index) => (
          <p key={index} className="mb-2">
            {el}
          </p>
        ))} */}
        {messages.map((m, index) => (
          <div
            key={m.id}
            className={`flex flex-col gap-4 mb-4 animate-slide-in`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {m.role === 'user' ? (
              <div className="flex gap-4 max-w-[90%] self-end">
                <div className="w-full  flex gap-1 text-[1.2rem] tracking-tight rounded-xl p-4">
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

export default page;
