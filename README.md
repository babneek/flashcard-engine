# 🧠 Flashcard Engine

An intelligent flashcard application that transforms PDFs into comprehensive study decks using AI, with spaced repetition and progress tracking.

## ✨ Features

### 🎯 Core Functionality
- **PDF to Flashcards**: Upload any PDF and automatically generate comprehensive flashcards
- **RAG-Powered Generation**: Semantic chunking ensures thorough coverage (237 cards from 8972 words)
- **Spaced Repetition**: SM-2 algorithm schedules reviews based on your performance
- **Time-Based Analytics**: Track how long you spend on each card to identify mastery levels
- **Active Recall**: Type your answer before revealing to test true understanding

### 📊 Progress Tracking
- **Mastery Dashboard**: Track cards across 4 stages (New → Learning → Review → Mastered)
- **Streak Counter**: Build daily study habits with streak tracking 🔥
- **Weak Areas**: Automatically identifies decks that need more attention
- **Activity Charts**: Visualize your study patterns over the last 7 days
- **Time Analytics**: See which cards are quick (mastered) vs slow (need practice)

### 🎨 User Experience
- **Simplified Feedback**: 3 clear options (Hard/Medium/Easy) with smart suggestions
- **Dark Mode**: Toggle between light and dark themes
- **Real-time Search**: Find decks and cards instantly
- **Mobile Responsive**: Study anywhere on any device
- **Smooth Animations**: Delightful transitions and card flips

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Groq API Key ([Get one free](https://console.groq.com))

### Local Development

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# Create test user
python create_test_user.py

# Start server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:8080`

## 🌐 Deployment

### Backend (Render)
1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables:
   - `GROQ_API_KEY` - Your Groq API key
   - `JWT_SECRET` - A secure random string
   - `FRONTEND_URL` - Your Vercel frontend URL

### Frontend (Vercel)
1. Import project on [Vercel](https://vercel.com)
2. Configure:
   - **Root Directory**: `frontend`
   - **Framework**: Vite
3. Add environment variable:
   - `VITE_API_URL` - Your Render backend URL

## 🔑 Test Credentials

```
Email: test@test.com
Password: test123
```

## 📖 Usage Guide

### Creating a Deck

1. Click **"New Deck"** button
2. Enter deck name and description
3. Choose one of two options:
   - **Upload PDF**: Select a PDF file (study notes, textbook chapter, etc.)
   - **Topic Name**: Enter a topic and let AI generate cards
4. Select subject (e.g., CBSE Class 10 History)
5. Click **"Generate Flashcards"**

### Studying Cards

1. Navigate to a deck from the dashboard
2. Click **"Start Review"** to study due cards
3. For each card:
   - Read the question
   - (Optional) Type your answer to test recall
   - Flip the card to see the answer
   - Rate your performance: **Hard** / **Medium** / **Easy**
4. The system suggests difficulty based on time spent:
   - < 8 seconds → Easy (you knew it quickly)
   - 8-25 seconds → Medium (normal thinking time)
   - > 25 seconds → Hard (took longer to recall)

### Tracking Progress

- **Progress Tab**: View overall mastery, streaks, and weak areas
- **Time Analytics**: See which cards are consistently quick vs slow
- **Activity Charts**: Monitor your study patterns
- **Weak Areas**: Focus on decks that need attention

## 🏗️ Architecture

### Tech Stack

**Backend**
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- SQLite (Database)
- Groq API (AI generation - llama-3.3-70b-versatile)
- PyPDF2 (PDF processing)
- Sentence Transformers (Embeddings)

**Frontend**
- React 18 + TypeScript
- Vite (Build tool)
- Tailwind CSS + shadcn/ui (Styling)
- Framer Motion (Animations)
- Recharts (Data visualization)
- React Router (Navigation)

### Project Structure

```
flashcard-engine/
├── backend/
│   ├── database/           # Database connection
│   ├── models/            # SQLAlchemy models
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   │   ├── rag_engine.py       # RAG implementation
│   │   ├── card_generator.py   # AI card generation
│   │   ├── spaced_repetition.py # SM-2 algorithm
│   │   ├── mastery_service.py  # Progress tracking
│   │   └── pdf_processor.py    # PDF parsing
│   ├── main.py            # FastAPI app
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route pages
│   │   ├── lib/           # Utilities and API
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /auth/register` - Create new account
- `POST /auth/login` - Login and get token
- `GET /auth/me` - Get current user

### Decks
- `GET /decks` - List all decks
- `POST /decks` - Create new deck
- `GET /decks/{id}` - Get deck details
- `DELETE /decks/{id}` - Delete deck
- `POST /decks/{id}/upload-pdf` - Upload PDF and generate cards
- `POST /decks/{id}/generate` - Generate cards from topic

### Cards
- `GET /cards/deck/{id}` - Get cards in deck
- `POST /cards/{id}/rate` - Rate card performance
- `GET /cards/deck/{id}/time-analytics` - Get time-based insights

### Progress
- `GET /progress/dashboard` - Overall progress dashboard
- `GET /progress/streak` - Streak information
- `GET /progress/weak-areas` - Decks needing attention
- `GET /progress/chart` - Activity chart data

### Stats
- `GET /stats/deck/{id}` - Deck statistics
- `GET /stats/overall` - Overall statistics

## 🧪 How It Works

### RAG (Retrieval-Augmented Generation)

1. **PDF Processing**: Extract text from uploaded PDF
2. **Semantic Chunking**: Split into 500-word chunks with 50-word overlap
3. **Embeddings** (Optional): Generate embeddings for semantic search
4. **Card Generation**: AI generates questions and answers from each chunk
5. **Difficulty Sorting**: Cards ordered by complexity (Beginner → Advanced)

### Spaced Repetition (SM-2 Algorithm)

```
If rating >= 3 (Medium/Easy):
  - Increase interval exponentially
  - Adjust ease factor based on performance
  - Schedule next review further out

If rating < 3 (Hard):
  - Reset to short interval (1-6 days)
  - Decrease ease factor
  - Review sooner
```

### Time-Based Difficulty Suggestion

```
Time Spent < 8s  → Easy (mastered)
Time Spent 8-25s → Medium (learning)
Time Spent > 25s → Hard (struggling)
```

## 🎯 Problem Statement

This project addresses the Cuemath challenge:

> Build a flashcard app that turns any PDF into a smart, practice-ready deck. Focus on:
> - **Ingestion quality**: Comprehensive card generation
> - **Spaced repetition**: Smart scheduling
> - **Progress and mastery**: Clear progress tracking
> - **Deck management**: Easy organization
> - **Delight**: Engaging user experience

## 📊 Results

- **20x improvement** in card generation (237 cards vs 12 cards)
- **Semantic chunking** ensures comprehensive coverage
- **Time analytics** identify mastery patterns
- **Simplified feedback** (3 options vs 6) reduces decision fatigue
- **Smart suggestions** based on response time

## 🔮 Future Enhancements

- [ ] Collaborative decks (share with friends)
- [ ] Image occlusion for diagrams
- [ ] Audio pronunciation for language learning
- [ ] Mobile app (React Native)
- [ ] Export to Anki format
- [ ] Gamification (badges, leaderboards)
- [ ] AI-powered hints
- [ ] Cloze deletion cards
- [ ] Deck templates by subject

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For questions or issues, please open an issue on GitHub.

---

Built with ❤️ for effective learning through spaced repetition and active recall.
