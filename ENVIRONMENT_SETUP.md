# 🔑 Environment Setup Guide

## Required Environment Variables

To run this application, you need to set up environment variables for API access.

### 1. Create Environment File

Copy the example file and add your actual API keys:

```bash
cp .env.example .env.local
```

### 2. Required Variables

Add these variables to your `.env.local` file:

```env
# OpenAI API Key (required for transcription and AI features)
OPENAI_API_KEY=your_openai_api_key_here

# JWT Secret (required for authentication)
JWT_SECRET=your_jwt_secret_here

# App URL (required for proper routing)
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

### 3. Optional Variables

```env
# Gemini API Key (alternative AI provider)
GEMINI_API_KEY=your_gemini_api_key

# Perplexity API Key (for deep search)
PERPLEXITY_API_KEY=your_perplexity_api_key
```

## Getting API Keys

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env.local` file

### Other Keys
- **Gemini**: [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Perplexity**: [Perplexity Settings](https://www.perplexity.ai/settings/api)

## Security Notes

- ✅ `.env.local` is automatically ignored by Git
- ✅ Never commit API keys to version control
- ✅ Use different keys for development and production
- ✅ Rotate keys regularly for security

## Features Enabled

With proper environment setup, these features will work:
- 🎤 Voice transcription (OpenAI Whisper)
- 🤖 AI chat responses
- 🎭 3D Avatar with lip sync
- 🔐 User authentication

## Troubleshooting

If you see "OPENAI_API_KEY environment variable is required":
1. Check that `.env.local` exists
2. Verify the API key is correctly set
3. Restart the development server
4. Ensure no extra spaces or quotes around the key