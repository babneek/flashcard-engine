import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, Sparkles, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { apiCreateDeck, apiUploadPdf, apiGenerateFromTopic } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

const CreateDeckPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [subject, setSubject] = useState('general'); // NEW: Subject selection
  const [status, setStatus] = useState('');
  const [cardsGenerated, setCardsGenerated] = useState(0);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setStatus('Only PDF files are supported');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setStatus('File too large (max 10MB)');
        return;
      }
      setSelectedFile(file);
      setStatus('');
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setGenerating(true);
    setStatus('Creating deck...');

    try {
      // Step 1: Create the deck
      const deck = await apiCreateDeck(name, description);

      if (selectedFile) {
        // Step 2a: Upload PDF and generate cards with subject
        setStatus('Uploading PDF and generating cards with AI... (this takes 2-5 minutes for large PDFs)');
        const result = await apiUploadPdf(deck.id, selectedFile, subject);
        setCardsGenerated(result.cards_generated);
        setStatus(`✨ Generated ${result.cards_generated} cards from your PDF!`);
      } else {
        // Step 2b: Generate cards from topic name
        setStatus('Generating cards from topic...');
        const result = await apiGenerateFromTopic(deck.id);
        setCardsGenerated(result.cards_generated);
        setStatus(`✨ Generated ${result.cards_generated} cards!`);
      }

      // Navigate after a brief moment
      setTimeout(() => navigate(`/deck/${deck.id}`), 1500);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20">
      <header className="border-b-2 border-purple-200 dark:border-purple-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Create New Deck
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-8 ml-1">Upload a PDF or enter a topic to generate flashcards</p>

          <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold text-gray-700 dark:text-gray-300">Deck Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Organic Chemistry"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 border-2 focus:border-purple-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc" className="font-semibold text-gray-700 dark:text-gray-300">Description</Label>
                <Input
                  id="desc"
                  placeholder="What's this deck about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-11 border-2 focus:border-purple-400"
                />
              </div>

              {/* Subject Selection */}
              <div className="space-y-2">
                <Label htmlFor="subject" className="font-semibold text-gray-700 dark:text-gray-300">Subject</Label>
                <select
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="flex h-11 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                >
                  <option value="general">📚 General</option>
                  <option value="history">🏛️ History</option>
                  <option value="mathematics">📐 Mathematics</option>
                  <option value="science">🔬 Science</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Choose the subject to get optimized flashcard questions
                </p>
              </div>

              {/* PDF Upload */}
              <div className="space-y-2">
                <Label className="font-semibold text-gray-700 dark:text-gray-300">Upload PDF (optional)</Label>
                <label htmlFor="pdf-upload" className="cursor-pointer block">
                  <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                    selectedFile
                      ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-purple-200 dark:border-purple-700 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/10'
                  }`}>
                    {selectedFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                          <FileText className="w-7 h-7 text-white" />
                        </div>
                        <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                        <span className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full font-medium">
                          ✓ Ready to upload
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 flex items-center justify-center">
                          <Upload className="w-7 h-7 text-purple-500" />
                        </div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Drop a PDF here or click to browse</p>
                        <p className="text-xs text-gray-500">PDF files up to 10MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>

              {/* Status message */}
              {status && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-2 p-4 rounded-xl text-sm font-medium ${
                    status.startsWith('Error')
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-800'
                      : status.startsWith('✨')
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-2 border-green-200 dark:border-green-800'
                      : 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-2 border-purple-200 dark:border-purple-800'
                  }`}
                >
                  {status.startsWith('✨') ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                  ) : generating ? (
                    <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                  ) : null}
                  {status}
                </motion.div>
              )}

              <Button
                className="w-full h-12 gap-2 text-base font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
                size="lg"
                onClick={handleCreate}
                disabled={!name.trim() || generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Generating Cards...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" /> Generate Flashcards
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                {selectedFile
                  ? '🤖 AI will generate comprehensive flashcards from your PDF content.'
                  : '💡 Upload a PDF for better, more specific cards.'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default CreateDeckPage;
