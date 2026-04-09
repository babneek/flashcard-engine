"""
Topic extraction and content organization service.
Analyzes PDF content to identify topics, sections, and key concepts.
"""

import re
from typing import List, Dict
from config import GROQ_API_KEY


def extract_topics_from_text(text: str) -> List[Dict[str, str]]:
    """
    Extract topics and organize content into structured sections.
    Uses AI if available, falls back to rule-based extraction.
    
    Returns:
        List of dicts with 'topic', 'content', and 'importance' keys
    """
    if GROQ_API_KEY:
        try:
            return _extract_topics_with_ai(text)
        except Exception as e:
            print(f"AI topic extraction failed: {e}, falling back to rule-based")
    
    return _extract_topics_rule_based(text)


def _extract_topics_with_ai(text: str) -> List[Dict[str, str]]:
    """Use AI to extract and organize topics from text."""
    from groq import Groq
    
    client = Groq(api_key=GROQ_API_KEY)
    
    prompt = f"""Analyze this educational text and extract the main topics/sections.
For each topic, provide:
1. A clear topic name
2. The relevant content (cleaned and organized)
3. Importance level (high/medium/low)

Focus on educational content only. Remove:
- Headers, footers, page numbers
- Copyright notices, URLs
- Table of contents entries
- Non-educational administrative text

TEXT:
{text[:4000]}

Return ONLY valid JSON array:
[
  {{
    "topic": "Topic name",
    "content": "Cleaned content for this topic",
    "importance": "high|medium|low"
  }}
]
"""
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are an expert at analyzing educational content and extracting key topics. Return only valid JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2,
        max_tokens=3000,
    )
    
    content = response.choices[0].message.content.strip()
    
    # Parse JSON response
    import json
    content = re.sub(r"^```(?:json)?\s*", "", content, flags=re.MULTILINE)
    content = re.sub(r"\s*```$", "", content, flags=re.MULTILINE)
    
    try:
        topics = json.loads(content)
    except json.JSONDecodeError:
        match = re.search(r'\[.*\]', content, re.DOTALL)
        if match:
            topics = json.loads(match.group())
        else:
            raise ValueError("Could not parse topics JSON")
    
    return topics


def _extract_topics_rule_based(text: str) -> List[Dict[str, str]]:
    """
    Rule-based topic extraction using headings, keywords, and structure.
    """
    topics = []
    
    # Split by common heading patterns
    # Matches: "1. Topic", "Chapter 1:", "Section A:", "## Heading", etc.
    heading_pattern = r'(?:^|\n)(?:(?:\d+\.?\s+)|(?:Chapter\s+\d+:?\s+)|(?:Section\s+[A-Z\d]+:?\s+)|(?:#{1,3}\s+))([A-Z][^\n]{3,60})(?:\n|$)'
    
    sections = re.split(heading_pattern, text, flags=re.IGNORECASE)
    
    if len(sections) > 2:
        # We have clear sections
        for i in range(1, len(sections), 2):
            if i + 1 < len(sections):
                topic_name = sections[i].strip()
                content = sections[i + 1].strip()
                
                if len(content.split()) > 20:  # Minimum content length
                    importance = _determine_importance(content)
                    topics.append({
                        "topic": topic_name,
                        "content": content,
                        "importance": importance
                    })
    else:
        # No clear sections, split by paragraphs and group by keywords
        paragraphs = [p.strip() for p in text.split("\n\n") if len(p.strip().split()) > 15]
        
        # Group paragraphs into topics (every 2-3 paragraphs)
        for i in range(0, len(paragraphs), 3):
            chunk = "\n\n".join(paragraphs[i:i+3])
            if chunk:
                # Try to extract a topic from the first sentence
                first_sentence = chunk.split(".")[0][:60]
                topic_name = first_sentence if len(first_sentence) > 10 else f"Topic {i//3 + 1}"
                
                importance = _determine_importance(chunk)
                topics.append({
                    "topic": topic_name,
                    "content": chunk,
                    "importance": importance
                })
    
    # If still no topics, create one from the whole text
    if not topics and text.strip():
        topics.append({
            "topic": "Main Content",
            "content": text[:2000],
            "importance": "high"
        })
    
    return topics


def _determine_importance(content: str) -> str:
    """
    Determine importance level based on content characteristics.
    """
    # Keywords that indicate high importance
    high_importance_keywords = [
        "definition", "theorem", "formula", "equation", "principle",
        "law", "rule", "important", "key", "fundamental", "essential",
        "critical", "must", "always", "never"
    ]
    
    # Keywords that indicate medium importance
    medium_importance_keywords = [
        "example", "application", "practice", "exercise", "problem",
        "solution", "method", "approach", "technique"
    ]
    
    content_lower = content.lower()
    word_count = len(content.split())
    
    # Count keyword matches
    high_matches = sum(1 for kw in high_importance_keywords if kw in content_lower)
    medium_matches = sum(1 for kw in medium_importance_keywords if kw in content_lower)
    
    # Determine importance
    if high_matches >= 2 or word_count > 300:
        return "high"
    elif medium_matches >= 2 or word_count > 150:
        return "medium"
    else:
        return "low"


def filter_useless_content(text: str) -> str:
    """
    Remove common useless content patterns from educational PDFs.
    """
    useless_patterns = [
        r"Table of Contents.*?(?=\n\n|\Z)",
        r"Index.*?(?=\n\n|\Z)",
        r"References.*?(?=\n\n|\Z)",
        r"Bibliography.*?(?=\n\n|\Z)",
        r"Acknowledgments.*?(?=\n\n|\Z)",
        r"About the Author.*?(?=\n\n|\Z)",
        r"Copyright.*?(?=\n\n|\Z)",
        r"All rights reserved.*?(?=\n\n|\Z)",
        r"ISBN.*?(?=\n\n|\Z)",
        r"Published by.*?(?=\n\n|\Z)",
    ]
    
    for pattern in useless_patterns:
        text = re.sub(pattern, "", text, flags=re.IGNORECASE | re.DOTALL)
    
    return text.strip()


def organize_content_by_topics(text: str) -> Dict[str, any]:
    """
    Main function to clean, organize, and structure PDF content.
    
    Returns:
        Dict with 'topics' (list of topic dicts) and 'metadata' (stats)
    """
    # First, filter out useless sections
    cleaned_text = filter_useless_content(text)
    
    # Extract topics
    topics = extract_topics_from_text(cleaned_text)
    
    # Calculate metadata
    total_words = sum(len(topic["content"].split()) for topic in topics)
    high_importance_count = sum(1 for t in topics if t["importance"] == "high")
    
    return {
        "topics": topics,
        "metadata": {
            "total_topics": len(topics),
            "total_words": total_words,
            "high_importance_topics": high_importance_count,
            "avg_words_per_topic": total_words // len(topics) if topics else 0
        }
    }
