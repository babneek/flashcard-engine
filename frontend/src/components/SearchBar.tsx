import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { apiGetDecks } from "@/lib/api";

interface SearchResult {
  type: "deck" | "card";
  id: string;
  deckId?: string;
  title: string;
  description: string;
  highlight?: string;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 300); // Debounce

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      // For now, search only decks (can be extended to search cards via API)
      const decks = await apiGetDecks();
      const lowerQuery = searchQuery.toLowerCase();
      
      console.log('Search query:', searchQuery);
      console.log('Decks found:', decks);
      
      const deckResults: SearchResult[] = decks
        .filter((deck: any) => 
          deck.name.toLowerCase().includes(lowerQuery) ||
          (deck.description && deck.description.toLowerCase().includes(lowerQuery))
        )
        .map((deck: any) => ({
          type: "deck" as const,
          id: deck.id,
          title: deck.name,
          description: deck.description || '',
          highlight: `${deck.cardCount || 0} cards`,
        }));

      console.log('Search results:', deckResults);
      setResults(deckResults);
      setIsOpen(deckResults.length > 0 || true); // Always show dropdown when searching
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "deck") {
      navigate(`/deck/${result.id}`);
    } else if (result.type === "card" && result.deckId) {
      navigate(`/study/${result.deckId}`);
    }
    setQuery("");
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search decks and cards..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full z-[100]"
          >
            <Card className="shadow-lg border-2">
              <CardContent className="p-2">
                {loading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Searching...
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No results found
                  </div>
                ) : (
                  <div className="space-y-1">
                    {results.map((result) => (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-3 rounded-md hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{result.title}</div>
                            {result.description && (
                              <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                {result.description}
                              </div>
                            )}
                          </div>
                          {result.highlight && (
                            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full ml-2">
                              {result.highlight}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
