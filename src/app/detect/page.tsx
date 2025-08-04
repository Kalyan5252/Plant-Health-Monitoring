'use client';

import React, { useRef, useState, useEffect, FormEvent } from 'react';
import { useChat } from 'ai/react';
import { IoCloudUpload } from 'react-icons/io5';
import { FaSearch, FaUser } from 'react-icons/fa';
import { RiLeafFill } from 'react-icons/ri';
import ReactMarkdown from 'react-markdown';
import { nanoid } from 'nanoid';

export default function Page() {
  const fileRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [globalImage, setGlobalImage] = useState<File | null>(null);
  const [diseaseContext, setDiseaseContext] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [input, setInput] = useState('');
  const [contextSet, setContextSet] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);

  const { messages, isLoading, append, reload } = useChat({
    api: '/api/chat',
    initialMessages: [],
    body: {
      stream: true,
    },
    onFinish: () => {
      // Optionally scroll to bottom or any custom behavior after response
      scrollToBottom();
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setGlobalImage(file);
      setImagePreview(URL.createObjectURL(file));
      setDiseaseContext(null);
      setContextSet(false);
    }
  };

  const analyzeImage = async () => {
    if (!globalImage || contextSet) return;

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('file', globalImage);
      formData.append('plantName', selectedPlant || 'unknown');

      const res = await fetch(
        // 'http://0.0.0.0:8000/predict/plant_classifier',
        // 'http://134.209.149.188:8000/predict/plant_classifier',
        // 'https://184f0bd997ea.ngrok-free.app/predict/plant_classifier',
        'https://plantapi.duckdns.org/predict/plant_classifier',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!res.ok) throw new Error('Failed to classify plant');

      const result = await res.json();
      console.log('result:', result);
      const contextMsg = `Plant & disease detection phase:\nPlant: ${
        result.plantName
      }\n ${
        result.predictedDisease.toLowerCase().includes('healthy')
          ? ''
          : 'Disease'
      }: ${result.predictedDisease}`;
      setDiseaseContext(contextMsg);

      await append({
        id: nanoid(),
        role: 'system',
        content: contextMsg,
      });

      // Add user prompt automatically to trigger response
      await append({
        id: nanoid(),
        role: 'user',
        content: 'What are the remedies or treatment options for this disease?',
      });

      setContextSet(true);
    } catch (err) {
      console.error('Error analyzing image:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    await append({
      id: nanoid(),
      role: 'user',
      content: input,
    });

    setInput('');
  };

  return (
    <div className="max-h-screen h-screen w-full grid grid-cols-2">
      <form
        onSubmit={handleFormSubmit}
        className="flex flex-col gap-4 h-full justify-center items-center"
      >
        <input
          type="file"
          accept="image/*"
          ref={fileRef}
          hidden
          onChange={handleFileSelect}
        />

        <div
          onClick={() => fileRef.current?.click()}
          className="p-16 cursor-pointer border-2 border-dashed flex flex-col justify-center items-center relative"
        >
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-48 max-h-48 object-contain"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setGlobalImage(null);
                  setImagePreview(null);
                  setDiseaseContext(null);
                  setContextSet(false);
                  setSelectedPlant(null);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ) : (
            <>
              <IoCloudUpload size={24} />
              <h3 className="font-bold">Upload Leaf Image</h3>
              <p className="text-xs text-gray-600/80">Drag and Drop here</p>
            </>
          )}
        </div>

        {imagePreview && (
          <div className="mt-2 flex gap-2 flex-wrap justify-center">
            {['tomato', 'chilli', 'potato', 'cucumber'].map((plant) => (
              <button
                key={plant}
                type="button"
                onClick={() => setSelectedPlant(plant)}
                className={`px-3 py-[0.5px] text-sm rounded-full border transition-all font-medium ${
                  selectedPlant === plant
                    ? 'bg-green-700 text-white'
                    : 'bg-white text-black'
                }`}
              >
                {plant}
              </button>
            ))}
          </div>
        )}

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border-[1px] outline-none focus:border-black w-4/6 transition-all rounded-lg p-2"
          placeholder={
            globalImage && !contextSet
              ? 'Analyze image first'
              : 'Ask something...'
          }
          disabled={!!(globalImage && !contextSet)}
        />

        {/* Toggle Analyze/Chat Button */}
        {globalImage && !contextSet ? (
          <button
            type="button"
            onClick={analyzeImage}
            className="font-bold px-4 py-2 rounded-full flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 transition"
            disabled={isAnalyzing}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        ) : (
          <button
            type="submit"
            className={`font-bold px-4 py-2 rounded-full flex items-center gap-2 bg-green-700 text-white hover:bg-green-800 transition ${
              isLoading ? 'pointer-events-none cursor-progress' : ''
            }`}
            disabled={isLoading || isAnalyzing}
          >
            Ask <FaSearch size={20} />
          </button>
        )}

        {contextSet && (
          <p className="text-sm text-green-600">
            ✓ Image analyzed and ready for chat
          </p>
        )}
      </form>

      <div className="border-l p-8 h-full overflow-y-scroll">
        {messages.map((m, index) => (
          <div
            key={m.id}
            className="mb-4 animate-slide-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {m.role === 'user' ? (
              <div className="flex justify-end text-right">
                <div className="bg-green-800 text-white rounded-lg p-3">
                  {m.content}
                </div>
                <FaUser
                  className="ml-2 self-end bg-gray-400 text-white rounded-full p-1"
                  size={24}
                />
              </div>
            ) : (
              <div className="flex items-start">
                <RiLeafFill
                  className="mr-2 self-start bg-gray-400 text-white rounded-full p-1"
                  size={24}
                />
                <div className="bg-green-600 text-white rounded-lg p-3 max-w-[80%]">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
