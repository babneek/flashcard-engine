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
        setStatus('Uploading PDF and generating cards...');
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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-heading font-bold mb-2">Create New Deck</h1>
          <p className="text-muted-foreground mb-8">Upload a PDF or enter a topic to generate flashcards</p>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Deck Name</Label>
              <Input
                id="name"
                placeholder="e.g. Organic Chemistry"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Input
                id="desc"
                placeholder="What's this deck about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-11"
              />
            </div>

            {/* Subject Selection */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <select
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="general">General</option>
                <option value="history">History</option>
                <option value="mathematics">Mathematics</option>
                <option value="science">Science</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Choose the subject to get optimized flashcard questions
              </p>
            </div>

            {/* PDF Upload */}
            <div className="space-y-2">
              <Label>Upload PDF (optional)</Label>
              <Card
                className={`border-dashed border-2 transition-all duration-300 cursor-pointer ${
                  selectedFile
                    ? 'border-primary/50 bg-primary/5'
                    : 'hover:border-primary/30 hover:bg-muted/30'
                }`}
              >
                <CardContent className="p-8 text-center">
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    {selectedFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                        <p className="text-sm font-medium">Drop a PDF here or click to browse</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF files up to 10MB</p>
                      </>
                    )}
                  </label>
                  <input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Status message */}
            {status && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                  status.startsWith('Error')
                    ? 'bg-destructive/10 text-destructive'
                    : status.startsWith('✨')
                    ? 'bg-accent/10 text-accent-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {status.startsWith('✨') ? (
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                ) : generating ? (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                ) : null}
                {status}
              </motion.div>
            )}

            <Button
              className="w-full h-12 gap-2 text-base"
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

            <p className="text-xs text-center text-muted-foreground">
              {selectedFile
                ? 'Cards will be generated from your PDF content using AI.'
                : 'Cards will be generated based on the topic name. Upload a PDF for more specific cards.'}
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default CreateDeckPage;
