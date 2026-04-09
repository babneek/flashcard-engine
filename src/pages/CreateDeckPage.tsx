import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlashcardStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, Sparkles, Loader2 } from 'lucide-react';

// Sample cards to simulate AI generation
const generateSampleCards = (topic: string) => {
  const today = new Date().toISOString().split('T')[0];
  const base = {
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReviewDate: today,
  };
  return [
    { front: `What is the main concept of ${topic}?`, back: `${topic} refers to the fundamental principles and theories that govern this subject area.`, cardType: 'definition' as const, ...base },
    { front: `Why is ${topic} important?`, back: `Understanding ${topic} is crucial because it forms the foundation for advanced concepts and real-world applications.`, cardType: 'concept' as const, ...base },
    { front: `Give an example of ${topic} in practice.`, back: `A common example is when ${topic} is applied in educational settings to improve learning outcomes through structured repetition.`, cardType: 'example' as const, ...base },
    { front: `What is a common misconception about ${topic}?`, back: `Many believe ${topic} is only theoretical, but it has significant practical applications in everyday learning.`, cardType: 'edge_case' as const, ...base },
    { front: `How would you apply ${topic} to solve a problem?`, back: `First identify the key variables, then apply the core principles of ${topic} systematically to reach a solution.`, cardType: 'application' as const, ...base },
    { front: `What are the key components of ${topic}?`, back: `The key components include: 1) Core principles, 2) Supporting evidence, 3) Practical methods, and 4) Assessment criteria.`, cardType: 'definition' as const, ...base },
  ];
};

const CreateDeckPage = () => {
  const navigate = useNavigate();
  const { addDeck, addCards } = useFlashcardStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setGenerating(true);

    // Simulate AI generation delay
    await new Promise((r) => setTimeout(r, 2000));

    const deckId = addDeck(name, description);
    const cards = generateSampleCards(name);
    addCards(cards.map((c) => ({ ...c, deckId })));

    setGenerating(false);
    navigate(`/deck/${deckId}`);
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Input
                id="desc"
                placeholder="What's this deck about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* PDF Upload */}
            <div className="space-y-2">
              <Label>Upload PDF (optional)</Label>
              <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-8 text-center">
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                    {fileName ? (
                      <p className="text-sm font-medium text-foreground">{fileName}</p>
                    ) : (
                      <>
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

            <Button
              className="w-full gap-2"
              size="lg"
              onClick={handleCreate}
              disabled={!name.trim() || generating}
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating Cards...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate Flashcards
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Cards are generated based on the deck topic with sample content.
              In production, this would use AI to extract content from your PDF.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default CreateDeckPage;
