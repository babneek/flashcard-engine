# 🎥 Video Walkthrough Script - Flashcard Engine
**Total Duration: 4-5 minutes**

---

## 🎬 INTRO (0:00 - 0:30)

**[Screen: Show the assignment problem statement]**

"Hi! I'm Babneek, and for the Cuemath AI Builder Challenge, I chose Problem 1: The Flashcard Engine.

The challenge was to build a flashcard app that doesn't just convert PDFs—but creates a comprehensive, adaptive learning system.

Let me show you what I built."

**[Transition to live app]**

---

## 📱 DEMO PART 1: The User Experience (0:30 - 2:30)

### Registration & Dashboard (0:30 - 0:45)

**[Screen: Show login page → Register]**

"First, let's create an account. Simple email and password."

**[Register with test@demo.com]**

"And we're in! This is the dashboard with two tabs: Progress and Decks."

**[Show empty dashboard]**

"Right now it's empty, so let's create our first deck."

### Creating a Deck & Uploading PDF (0:45 - 1:15)

**[Click "New Deck"]**

"I'll create a deck called 'CBSE History - Chapter 1' and upload a PDF."

**[Upload a sample PDF - show file selection]**

"I'm uploading a chapter from a CBSE Class 10 History textbook. The app supports any PDF—textbooks, notes, research papers."

**[Show subject selection]**

"I can select the subject for better card generation. Let's choose 'CBSE Class 10 History'."

**[Click Generate]**

"Now watch this..."

**[Show loading state]**

### Card Generation Results (1:15 - 1:45)

**[Show success message: "Generated 237 cards"]**

"237 cards generated from this PDF! 

Here's the key: I didn't just split text randomly. I built a RAG engine that:
- Chunks text at sentence boundaries
- Maintains context with overlapping chunks
- Generates comprehensive cards covering concepts, definitions, relationships, and examples

This is a 20x improvement over naive approaches that would give you maybe 10-12 shallow cards."

**[Show deck detail page with card count]**

### Studying Cards (1:45 - 2:30)

**[Click "Start Review"]**

"Now let's study. Here's where it gets interesting."

**[Show first card - front side]**

"I see the question. Notice I have two options:
1. Just flip to see the answer, or
2. Type my answer first for active recall"

**[Click "Try answering first"]**

"Let me try the active recall feature..."

**[Type an answer]**

"I'll type: 'The Fundamental Theorem of Arithmetic states that every composite number can be expressed as a product of primes in a unique way'"

**[Click Check Answer]**

"It uses smart keyword matching to check if I got the key concepts right..."

**[Show success feedback]**

"Got it! ✓ The app validates my answer and gives immediate feedback."

**[Card flips automatically after 1.5 seconds]**

"Now here's the innovation: Notice the timer? The app tracked that I answered in 6 seconds."

**[Show rating buttons with suggestion highlighted]**

"Based on that time, it suggests 'Easy' - because I knew it instantly. But I can override if I want.

The thresholds are:
- Under 8 seconds → Easy (mastered)
- 8-25 seconds → Medium (learning)  
- Over 25 seconds → Hard (struggling)

This is the first flashcard app I know of that uses time as a primary mastery indicator."

**[Rate the card as Easy]**

"Let's do a few more cards quickly..."

**[Show 2-3 more cards rapidly, showing different times and suggestions]**

"See how each card gets a different suggestion based on how long I took? This removes the guesswork from rating."

---

## 📊 DEMO PART 2: Progress & Analytics (2:30 - 3:30)

### Progress Dashboard (2:30 - 2:50)

**[Navigate to Progress tab]**

"After studying, let's check our progress."

**[Show dashboard with stats]**

"The dashboard shows:
- Mastery breakdown: New, Learning, Review, Mastered
- Current streak with fire emoji 🔥
- Due cards counter
- Activity chart for the last 7 days
- Weak areas that need attention"

**[Scroll through dashboard]**

"Everything is visual and motivating. You can see your progress growing."

### Time Analytics (2:50 - 3:10)

**[Click on a deck to show time analytics]**

"But here's my favorite feature: Time Analytics."

**[Show time analytics page]**

"The app categorizes every card:
- Quick cards (under 10 seconds) - you've mastered these
- Medium cards (10-30 seconds) - you're learning
- Slow cards (over 30 seconds) - need more practice"

**[Show the lists]**

"This tells you what you actually know vs what you think you know. It's data-driven learning."

### Theme Customization (3:10 - 3:30)

**[Click on the theme toggle - palette icon]**

"Oh, and one more thing - we have 5 beautiful color schemes!"

**[Show theme dropdown]**

"Default, Clay, Ocean, Forest, and Sunset. Each works in both light and dark modes."

**[Switch between 2-3 themes quickly]**

"The app remembers your preference. It's professional yet fun - perfect balance for students of all ages."

**[Switch back to preferred theme]**

---

## 💻 DEMO PART 3: Technical Deep Dive (3:30 - 4:30)

**[Screen: Switch to code editor or GitHub]**

"Let me show you how this works under the hood."

### Card Quality System (3:30 - 3:50)

**[Show backend/services/card_generator.py - prompts section]**

"This is the card generation system. I completely rewrote the prompts with:
- Critical rules emphasizing quality
- Concrete examples of good vs bad cards
- Quality checklists for the AI

And here's the validation..."

**[Show _parse_cards_json function]**

"Every card goes through strict validation:
- Minimum length checks
- Reject incomplete patterns
- Reject fragments
- Track rejected cards

This is why we get 150-250 high-quality cards instead of 12-40 garbage cards."

### RAG Engine (3:50 - 4:05)

**[Show backend/services/rag_engine.py]**

"The RAG engine does semantic chunking - 600-word chunks with 100-word overlap.

It preserves paragraph structure and keeps the last 5 sentences for context. This gives the AI enough information to generate meaningful cards."

### Spaced Repetition (4:05 - 4:20)

**[Show backend/services/spaced_repetition.py]**

"For spaced repetition, I implemented the SM-2 algorithm—the same one Anki uses.

If you rate a card 'Easy', the interval grows exponentially: 1 day → 3 days → 8 days → 20 days...

If you rate it 'Hard', it resets to 1 day. You'll see it again tomorrow."

### Architecture (4:20 - 4:30)

**[Show architecture diagram or deployment URLs]**

"The stack:
- Backend: FastAPI on Render
- Frontend: React + TypeScript on Vercel
- AI: Groq (llama-3.3-70b-versatile)
- Database: SQLite (easy to migrate to PostgreSQL)

Total deployment cost: $0/month on free tiers."

---

## 🚀 CONCLUSION (4:30 - 5:00)

**[Screen: Back to the app or split screen with you]**

"So what makes this special?

1. **Quality First**: Enhanced prompts and validation ensure every card is complete and meaningful. No more fragmented garbage.

2. **Active Recall**: Type your answer before revealing - proven to boost retention by 50%.

3. **Time Analytics**: The first flashcard app to use response time as a primary mastery indicator.

4. **Smart Suggestions**: Auto-suggest difficulty based on time, reducing decision fatigue.

5. **Beautiful UX**: 5 theme options, smooth animations, progress tracking—studying doesn't have to be boring.

6. **Proven Algorithm**: SM-2 spaced repetition ensures you review at optimal intervals.

What I'd add with more time:
- Collaborative decks and marketplace
- Image occlusion for diagrams
- Mobile app with offline support
- Cloze deletion and multiple choice cards

But in one week, I'm proud of what I built. It's deployed, it works, and it genuinely helps students learn better."

**[Show the URLs on screen]**

"Try it yourself:
- Frontend: flashcard-engine-tac.vercel.app
- GitHub: github.com/babneek/flashcard-engine

Thanks for watching!"

---

## 🎬 RECORDING TIPS

### Setup:
1. **Screen Recording**: Use Loom, OBS, or QuickTime
2. **Resolution**: 1920x1080 (1080p)
3. **Audio**: Clear microphone, quiet room
4. **Browser**: Chrome/Firefox with extensions disabled
5. **Prepare**: Have test account ready, PDF uploaded

### Before Recording:
- [ ] Clear browser cache
- [ ] Close unnecessary tabs
- [ ] Disable notifications
- [ ] Test audio levels
- [ ] Practice the flow once

### During Recording:
- **Speak clearly and confidently**
- **Pause briefly between sections** (easier to edit)
- **Show, don't just tell** (click through features)
- **Keep energy up** (enthusiasm is contagious)
- **If you mess up**, pause, then restart that section

### Editing:
- Cut out long loading times (show "Loading..." then jump cut)
- Add text overlays for URLs and key points
- Speed up repetitive actions (2x speed)
- Add background music (low volume, non-distracting)
- Export at 1080p, 30fps

### Timing Breakdown:
- Intro: 30 seconds
- User Demo: 2 minutes
- Progress/Analytics: 45 seconds
- Technical: 1 minute
- Conclusion: 30 seconds
- **Total: 4:45** (perfect length)

---

## 📝 ALTERNATIVE: SHORTER VERSION (2-3 minutes)

If you want a shorter video, focus on:

1. **Problem & Solution** (30s)
   - What you built and why

2. **Live Demo** (90s)
   - Upload PDF → Generate cards → Study with time tracking
   - Show one key feature: time-based suggestions

3. **Key Innovation** (30s)
   - Time analytics dashboard
   - Why it matters

4. **Wrap-up** (30s)
   - Tech stack, deployment, future plans

**Total: 3 minutes**

---

## 🎯 KEY MESSAGES TO EMPHASIZE

1. **Quality over Quantity**: RAG gives comprehensive coverage
2. **Innovation**: Time tracking is unique and valuable
3. **User-Centric**: Simplified UX reduces friction
4. **Technical Depth**: Show you understand the algorithms
5. **Deployed & Working**: It's live, not just a demo

---

Good luck with the recording! Remember: Be yourself, show your passion, and let the product speak for itself. You built something genuinely useful—that enthusiasm will come through! 🚀
