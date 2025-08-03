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

const Page = () => {
  const [submitted, setSubmitted] = useState(false);
  const [globalImage, setGlobalImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [diseasePredicted, setDiseasePredicted] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      initialMessages: [],
      api: diseasePredicted ? '/api/chat-with-image' : '/api/chat', // Use enhanced API when classification is available
    }) as ChatHelpers;

  // Custom input handler that includes classification context when available
  const handleEnhancedInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    handleInputChange(e);
  };

  // Custom submit handler that enhances the input with classification data
  const handleEnhancedSubmit = (
    e: React.FormEvent,
    classificationData?: any
  ) => {
    e.preventDefault();
    if (!input.trim()) return;

    console.log('got the classificationData', classificationData);

    // Use passed classification data or fall back to state
    const dataToUse = classificationData || diseasePredicted;

    // If we have classification data, send it to the enhanced API
    if (dataToUse) {
      console.log('Using enhanced API with classification data:', dataToUse);

      // Send the enhanced input directly to the chat API with classification context
      fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `here are the details of plant ${dataToUse.prediction} and the disease predicted is ${dataToUse.predictedDisease} and the further details provided through context as per given user plant/leaf image  \n\n ${input}`,
            },
          ],
          context: {
            plantClassification: {
              result: dataToUse.result,
              prediction: dataToUse.prediction,
              plantName: dataToUse.plantName,
              predictedDisease: dataToUse.predictedDisease,
            },
          },
        }),
      })
        .then((response) => {
          if (response.ok) {
            console.log('Enhanced chat request sent successfully');

            // Use regular handleSubmit to show the user's original input in chat
            handleSubmit(e);
          } else {
            throw new Error('Chat API failed');
          }
        })
        .then((res) => {
          console.log('ai responL', res);
        })
        .catch((error) => {
          console.error('Error sending enhanced chat:', error);
          // Fallback to regular chat
          handleSubmit(e);
        });
    } else {
      console.log('No disease prediction available, using regular input');
      // Regular chat
      handleSubmit(e);
    }
  };

  const fileRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setGlobalImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Custom submit handler with two paths
  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsAnalyzing(true);

    try {
      // Path 1: No image or already has disease prediction
      if (!globalImage || diseasePredicted) {
        // Use enhanced submit handler
        console.log('got into non-image path');

        handleEnhancedSubmit(e);
      } else {
        console.log('got into image path');
        // Path 2: Image is provided and no disease prediction yet
        // First, get the plant classification result
        const plantFormData = new FormData();
        plantFormData.append('file', globalImage);
        plantFormData.append('plantName', 'test');

        const plantResponse = await fetch(
          'http://134.209.149.188:8000/predict/plant_classifier',
          {
            method: 'POST',
            body: plantFormData,
          }
        );

        if (plantResponse.ok) {
          const result = await plantResponse.json();
          console.log('detect res:', result);
          setDiseasePredicted(result);

          // Now use the enhanced submit handler
          handleEnhancedSubmit(e, result);
        } else {
          throw new Error('Failed to classify plant');
        }
      }
    } catch (error) {
      console.error('Error in analysis:', error);
      // Continue with normal chat flow even if classification fails
      handleEnhancedSubmit(e);
    } finally {
      setIsAnalyzing(false);
    }
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
          onClick={() => {
            fileRef.current?.click();
          }}
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
                  setDiseasePredicted(null);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ) : (
            <>
              <IoCloudUpload size={24} />
              <h3 className="font-bold ">Upload Leaf Image</h3>
              <p className="font-bold text-xs text-gray-600/80">
                Drag and Drop here
              </p>
            </>
          )}
        </div>
        <input
          type="text"
          value={input}
          onChange={handleEnhancedInputChange}
          className="border-[1px] outline-none focus:border-black w-4/6 transition-all rounded-lg p-2"
          placeholder="Prompt here"
        />
        <button
          type="submit"
          className={`button font-bold px-4 py-2 rounded-full flex items-center gap-2 ${
            isLoading || isAnalyzing
              ? 'pointer-events-none cursor-progress'
              : ''
          }`}
          disabled={isLoading || isAnalyzing}
        >
          {globalImage && !diseasePredicted ? 'Analyze with Image' : 'Chat'}
          <FaSearch size={20} />
        </button>

        {isAnalyzing && (
          <p className="text-sm text-gray-600">
            {globalImage && !diseasePredicted
              ? 'Analyzing plant image...'
              : 'Processing...'}
          </p>
        )}

        {globalImage && diseasePredicted && (
          <p className="text-sm text-green-600">
            ✓ Image analyzed: {diseasePredicted.prediction} -{' '}
            {diseasePredicted.predictedDisease}
          </p>
        )}
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
                  <div className="max-w-[80%] bg-green-600 p-2 rounded-lg text-white">
                    {m.content}
                    {/* <ReactMarkdown>{m.content}</ReactMarkdown> */}
                  </div>
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
