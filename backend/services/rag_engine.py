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
                # Use a lightweight, fast model
                self.model = SentenceTransformer('all-MiniLM-L6-v2')
                print("✓ Loaded embedding model: all-MiniLM-L6-v2")
            except ImportError:
                print("⚠ sentence-transformers not installed, using fallback chunking")
                return None
        return self.model
    
    def semantic_chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """
        Split text into semantic chunks using sentence boundaries.
        Falls back to simple splitting if sentence detection fails.
        
        Args:
            text: Input text
            chunk_size: Target words per chunk
            overlap: Overlapping words between chunks for context
        
        Returns:
            List of text chunks
        """
        # Split into sentences (simple approach)
        sentences = re.split(r'(?<=[.!?])\s+', text)
        
        chunks = []
        current_chunk = []
        current_word_count = 0
        
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
                
                # Keep last few sentences for overlap
                overlap_sentences = []
                overlap_words = 0
                for s in reversed(current_chunk[-3:]):  # Last 3 sentences
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
        
        # Add remaining chunk
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        # If no chunks created (very short text), return as single chunk
        if not chunks:
            chunks = [text]
        
        return chunks
    
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


def generate_cards_with_rag(text: str, subject: str = "general", cards_per_chunk: int = 10) -> List[Dict]:
    """
    Generate flashcards using RAG approach.
    
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
    
    # Index document with semantic chunking
    index_result = rag.index_document(text, chunk_size=500)
    
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
    
    print(f"\n🎴 Generating cards from {len(chunks)} chunks...")
    for i, chunk in enumerate(chunks, 1):
        print(f"  Chunk {i}/{len(chunks)}: {len(chunk.split())} words", end="")
        
        try:
            cards = generate_cards_from_text(chunk, subject=subject)
            all_cards.extend(cards)
            print(f" → {len(cards)} cards ✓")
        except Exception as e:
            print(f" → Error: {e}")
            continue
    
    # Sort by difficulty
    print(f"\n📊 Sorting {len(all_cards)} cards by difficulty...")
    sorted_cards = sort_cards_by_difficulty(all_cards)
    print(f"  ✓ Cards ordered: Beginner → Intermediate → Advanced")
    
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
