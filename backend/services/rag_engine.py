"""
RAG (Retrieval-Augmented Generation) Engine for Flashcard Generation
Uses semantic chunking for better card generation
"""
import re
from typing import List, Dict, Tuple
from config import GROQ_API_KEY


class SimpleRAGEngine:
    """
    Lightweight RAG engine without external dependencies.
    Uses semantic sentence splitting for better chunking.
    """
    
    def __init__(self):
        self.chunks = []
        self.embeddings = None
        self.model = None
        
    def _get_embedding_model(self):
        """Lazy load embedding model only when needed."""
        if self.model is None:
            try:
                from sentence_transformers import SentenceTransformer
                import numpy as np
                # Use a very lightweight, fast model that works on CPU
                # all-MiniLM-L6-v2: 80MB, very fast, good quality
                self.model = SentenceTransformer('all-MiniLM-L6-v2')
                print("✓ Loaded embedding model: all-MiniLM-L6-v2 (80MB)")
            except ImportError as e:
                print(f"⚠ sentence-transformers not installed: {e}")
                print("⚠ Using fallback chunking without embeddings")
                return None
            except Exception as e:
                print(f"⚠ Failed to load embedding model: {e}")
                print("⚠ Using fallback chunking without embeddings")
                return None
        return self.model
    
    def semantic_chunk_text(self, text: str, chunk_size: int = 600, overlap: int = 100) -> List[str]:
        """
        Split text into semantic chunks using sentence boundaries and paragraph structure.
        Preserves context by keeping related sentences together.
        
        Args:
            text: Input text
            chunk_size: Target words per chunk (increased for better context)
            overlap: Overlapping words between chunks for continuity
        
        Returns:
            List of text chunks with preserved context
        """
        # First split by paragraphs to preserve structure
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
        
        chunks = []
        current_chunk = []
        current_word_count = 0
        
        for para in paragraphs:
            # Split paragraph into sentences
            sentences = re.split(r'(?<=[.!?])\s+', para)
            
            for sentence in sentences:
                sentence = sentence.strip()
                if not sentence:
                    continue
                    
                words = sentence.split()
                word_count = len(words)
                
                # If adding this sentence exceeds chunk_size, save current chunk
                if current_word_count + word_count > chunk_size and current_chunk:
                    chunk_text = ' '.join(current_chunk)
                    chunks.append(chunk_text)
                    
                    # Keep last few sentences for overlap (better context)
                    overlap_sentences = []
                    overlap_words = 0
                    for s in reversed(current_chunk[-5:]):  # Last 5 sentences for context
                        overlap_words += len(s.split())
                        if overlap_words < overlap:
                            overlap_sentences.insert(0, s)
                        else:
                            break
                    
                    current_chunk = overlap_sentences + [sentence]
                    current_word_count = sum(len(s.split()) for s in current_chunk)
                else:
                    current_chunk.append(sentence)
                    current_word_count += word_count
            
            # Add paragraph break marker if chunk continues
            if current_chunk and current_word_count < chunk_size * 0.8:
                current_chunk.append("")  # Empty string as paragraph separator
        
        # Add remaining chunk
        if current_chunk:
            chunk_text = ' '.join([s for s in current_chunk if s])  # Remove empty strings
            if chunk_text.strip():
                chunks.append(chunk_text)
        
        # If no chunks created (very short text), return as single chunk
        if not chunks:
            chunks = [text]
        
        # Post-process: merge very small chunks
        final_chunks = []
        i = 0
        while i < len(chunks):
            chunk = chunks[i]
            # If chunk is too small and there's a next chunk, merge them
            if len(chunk.split()) < chunk_size * 0.3 and i + 1 < len(chunks):
                merged = chunk + " " + chunks[i + 1]
                final_chunks.append(merged)
                i += 2
            else:
                final_chunks.append(chunk)
                i += 1
        
        return final_chunks
    
    def create_embeddings(self, chunks: List[str]):
        """
        Create embeddings for text chunks.
        Falls back to None if embedding model unavailable.
        """
        model = self._get_embedding_model()
        if model is None:
            return None
        
        try:
            import numpy as np
            embeddings = model.encode(chunks, show_progress_bar=False)
            return np.array(embeddings)
        except Exception as e:
            print(f"⚠ Embedding creation failed: {e}")
            return None
    
    def index_document(self, text: str, chunk_size: int = 500) -> Dict:
        """
        Index a document by creating semantic chunks and embeddings.
        
        Returns:
            Dict with chunks, embeddings, and metadata
        """
        print(f"📄 Indexing document ({len(text.split())} words)...")
        
        # Create semantic chunks
        self.chunks = self.semantic_chunk_text(text, chunk_size=chunk_size)
        print(f"  ✓ Created {len(self.chunks)} semantic chunks")
        
        # Create embeddings
        self.embeddings = self.create_embeddings(self.chunks)
        if self.embeddings is not None:
            print(f"  ✓ Generated embeddings (shape: {self.embeddings.shape})")
        else:
            print(f"  ⚠ Using chunks without embeddings (fallback mode)")
        
        return {
            "chunks": self.chunks,
            "embeddings": self.embeddings,
            "chunk_count": len(self.chunks),
            "total_words": len(text.split())
        }
    
    def retrieve_relevant_chunks(self, query: str, top_k: int = 3) -> List[Tuple[str, float]]:
        """
        Retrieve most relevant chunks for a query.
        Falls back to returning all chunks if embeddings unavailable.
        
        Returns:
            List of (chunk_text, similarity_score) tuples
        """
        if self.embeddings is None or self.model is None:
            # Fallback: return all chunks with equal scores
            return [(chunk, 1.0) for chunk in self.chunks]
        
        try:
            import numpy as np
            # Encode query
            query_embedding = self.model.encode([query])[0]
            
            # Calculate cosine similarity
            similarities = np.dot(self.embeddings, query_embedding) / (
                np.linalg.norm(self.embeddings, axis=1) * np.linalg.norm(query_embedding)
            )
            
            # Get top-k indices
            top_indices = np.argsort(similarities)[-top_k:][::-1]
            
            # Return chunks with scores
            results = [(self.chunks[idx], float(similarities[idx])) for idx in top_indices]
            return results
        except Exception as e:
            print(f"⚠ Retrieval failed: {e}, returning all chunks")
            return [(chunk, 1.0) for chunk in self.chunks]
    
    def get_all_chunks(self) -> List[str]:
        """Get all chunks for comprehensive card generation."""
        return self.chunks
    
    def get_chunk_stats(self) -> Dict:
        """Get statistics about indexed chunks."""
        if not self.chunks:
            return {"chunk_count": 0, "avg_words": 0, "total_words": 0}
        
        word_counts = [len(chunk.split()) for chunk in self.chunks]
        avg_words = sum(word_counts) // len(word_counts) if word_counts else 0
        
        return {
            "chunk_count": len(self.chunks),
            "avg_words": avg_words,
            "min_words": min(word_counts) if word_counts else 0,
            "max_words": max(word_counts) if word_counts else 0,
            "total_words": sum(word_counts)
        }


def generate_cards_with_rag(text: str, subject: str = "general", cards_per_chunk: int = 12) -> List[Dict]:
    """
    Generate flashcards using RAG approach with improved chunking.
    
    Args:
        text: Full document text
        subject: Subject type (history, mathematics, science, general)
        cards_per_chunk: Target number of cards per chunk
    
    Returns:
        List of flashcard dictionaries
    """
    from services.card_generator import generate_cards_from_text, sort_cards_by_difficulty
    
    # Initialize RAG engine
    rag = SimpleRAGEngine()
    
    # Index document with semantic chunking (larger chunks for better context)
    index_result = rag.index_document(text, chunk_size=600)
    
    print(f"\n🎯 RAG Indexing Complete:")
    print(f"  • Chunks: {index_result['chunk_count']}")
    print(f"  • Total words: {index_result['total_words']}")
    print(f"  • Embeddings: {'✓' if index_result['embeddings'] is not None else '✗ (fallback mode)'}")
    
    # Get chunk statistics
    stats = rag.get_chunk_stats()
    print(f"  • Avg words/chunk: {stats['avg_words']}")
    print(f"  • Range: {stats['min_words']}-{stats['max_words']} words")
    
    # Generate cards from all chunks
    all_cards = []
    chunks = rag.get_all_chunks()
    
    print(f"\n🎴 Generating high-quality cards from {len(chunks)} chunks...")
    print(f"  Subject: {subject.upper()}")
    
    for i, chunk in enumerate(chunks, 1):
        chunk_words = len(chunk.split())
        print(f"  Chunk {i}/{len(chunks)}: {chunk_words} words", end="")
        
        try:
            cards = generate_cards_from_text(chunk, subject=subject)
            
            # Filter out low-quality cards
            quality_cards = [c for c in cards if len(c['front'].split()) >= 4 and len(c['back'].split()) >= 6]
            
            all_cards.extend(quality_cards)
            print(f" → {len(quality_cards)} quality cards ✓")
        except Exception as e:
            print(f" → Error: {e}")
            continue
    
    # Remove duplicate cards (same front question)
    seen_fronts = set()
    unique_cards = []
    for card in all_cards:
        front_key = card['front'].lower().strip()
        if front_key not in seen_fronts:
            seen_fronts.add(front_key)
            unique_cards.append(card)
    
    if len(all_cards) > len(unique_cards):
        print(f"  ℹ Removed {len(all_cards) - len(unique_cards)} duplicate cards")
    
    # Sort by difficulty
    print(f"\n📊 Sorting {len(unique_cards)} cards by difficulty...")
    sorted_cards = sort_cards_by_difficulty(unique_cards)
    print(f"  ✓ Cards ordered: Beginner → Intermediate → Advanced")
    
    # Print quality summary
    difficulty_counts = {}
    for card in sorted_cards:
        diff = card.get('difficulty', 'intermediate')
        difficulty_counts[diff] = difficulty_counts.get(diff, 0) + 1
    
    print(f"\n📈 Quality Summary:")
    print(f"  • Beginner: {difficulty_counts.get('beginner', 0)} cards")
    print(f"  • Intermediate: {difficulty_counts.get('intermediate', 0)} cards")
    print(f"  • Advanced: {difficulty_counts.get('advanced', 0)} cards")
    print(f"  • Total: {len(sorted_cards)} high-quality cards")
    
    return sorted_cards


def generate_cards_with_rag_retrieval(
    text: str, 
    topics: List[str], 
    subject: str = "general",
    cards_per_topic: int = 8
) -> List[Dict]:
    """
    Generate flashcards using RAG retrieval for specific topics.
    Useful when you want cards focused on particular topics.
    
    Args:
        text: Full document text
        topics: List of topics to generate cards for
        subject: Subject type
        cards_per_topic: Cards to generate per topic
    
    Returns:
        List of flashcard dictionaries
    """
    from services.card_generator import generate_cards_from_text, sort_cards_by_difficulty
    
    # Initialize RAG engine
    rag = SimpleRAGEngine()
    rag.index_document(text, chunk_size=500)
    
    all_cards = []
    
    print(f"\n🎯 Generating cards for {len(topics)} topics using RAG retrieval...")
    
    for topic in topics:
        print(f"\n  Topic: {topic}")
        
        # Retrieve relevant chunks for this topic
        relevant_chunks = rag.retrieve_relevant_chunks(topic, top_k=3)
        
        # Combine top chunks
        combined_text = "\n\n".join([chunk for chunk, score in relevant_chunks])
        print(f"    Retrieved {len(relevant_chunks)} chunks (total: {len(combined_text.split())} words)")
        
        # Generate cards
        try:
            cards = generate_cards_from_text(
                combined_text, 
                topic_context=topic,
                subject=subject
            )
            
            # Limit cards per topic
            cards = cards[:cards_per_topic]
            
            # Add topic tag
            for card in cards:
                card["topic"] = topic
            
            all_cards.extend(cards)
            print(f"    → Generated {len(cards)} cards ✓")
        except Exception as e:
            print(f"    → Error: {e}")
            continue
    
    # Sort by difficulty
    sorted_cards = sort_cards_by_difficulty(all_cards)
    
    return sorted_cards
