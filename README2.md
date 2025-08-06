# Plant Health Monitoring System - Technical Analysis

Project Overview

Plant Health Monitoring System is a comprehensive AI-powered web application designed to identify plant diseases, provide treatment recommendations, and offer gardening assistance. The system combines computer vision for plant disease detection with conversational AI for personalized care guidance.

 ->Architecture & Tech Stack

 Frontend Framework
- Next.js 15.1.4 - React-based full-stack framework with App Router
- React 19.0.0 - Modern React with latest features
- TypeScript 5 - Type-safe development
- Tailwind CSS 3.4.1 - Utility-first CSS framework

-> AI & Machine Learning
- Google Gemini 2.0 Flash - Primary AI model for conversational responses 
- Trained five deep learning models  to detect disease of the plants.

-> External APIs & Services
- Plant Disease Classification API (`https://plantapi.duckdns.org/predict/plant_classifier`)
  - Convolutional Neural Networks(CNN) based plant disease detection
  - Supports: tomato, chilli, potato, cucumber plants
  - Returns plant name and disease classification

->Development Tools
- PostCSS - CSS processing
- ESLint - Code linting
- GSAP - Advanced animations and motion paths

->AI Agents & Models

1. Primary AI Agent (Gemini 2.0 Flash)
Location: `src/app/api/chat/route.ts`
- Purpose: Main conversational AI for plant care guidance
- Specialization: Farming, gardening, and plant disease treatment
- System Prompt: Specialized in tomato, chilli, potato, and cucumber plants
- Response Style: Concise, actionable advice with headings

->API Endpoints

 Core Chat APIs
1. `/api/chat` - Main conversational AI endpoint
2. `/api/chat-with-image` - Image-aware chat with plant classification

User Interface Components

Landing Page
- Hero Component (`src/components/LandingPage/Hero.tsx`)
  - GSAP animations with motion paths
  - Responsive design with Tailwind CSS
  - Interactive upload area with drag-and-drop

Detection Interface
- Main Detection Page (`src/app/detect/page.tsx`)
  - Real-time image upload and preview
  - Plant type selection (tomato, chilli, potato, cucumber)
  - Streaming chat interface with markdown support
  - Progress indicators and status feedback

Key Features

 1. Plant Disease Detection
- Image Upload: Drag-and-drop or click-to-upload
- Plant Classification: Automatic plant type detection
- Disease Analysis: AI-powered disease identification
- Treatment Recommendations: Personalized care advice

 2. Conversational AI
- Streaming Responses: Real-time AI responses
- Context Awareness: Maintains conversation context
- Markdown Support: Rich text formatting
- Multi-modal: Text and image input support

Environment Setup
Required Environment Variables
```env
GEMINI_API_KEY=your_gemini_api_key
```

 External Dependencies
- Plant Classification API: `https://plantapi.duckdns.org`

Data Flow

 Image Analysis Pipeline
1. Image Upload → User uploads plant image
2. Plant Classification → External API analyzes image
3. Disease Detection → AI identifies plant disease
4. Treatment Generation → AI provides care recommendations

Chat Flow
1. User Input → Text or image input
2. Disease Detection Processing → Request will be processed by backend API which is deployed on DigitalOcean
3. AI Generation → Gemini/Ollama response generation
4. Streaming Response → Real-time response delivery
5. Context Update → Conversation history maintenance

 Security & Performance

Security Features
- API Key Management: Environment variable protection
- Input Validation: File type and size validation
- Error Handling: Comprehensive error management
- Rate Limiting: Built-in Next.js protection

Performance Optimizations
- Streaming Responses: Real-time AI responses
- Image Optimization: Next.js automatic image optimization
- Code Splitting: Automatic route-based code splitting

Development Workflow

Local Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

 Deployment
- Vercel: Recommended deployment platform
- Environment Variables: Configure in deployment settings
- Backend API:Developed using fast API and deployed on DigitalOcean



