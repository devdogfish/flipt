// ── AI prompt ────────────────────────────────────────────────────────────────

export const LLM_PROMPT = `Your task is to output a JSON data file — nothing else. Do not build an app, do not write HTML or JavaScript, do not create a UI. Just produce a JSON object containing flashcard data about [TOPIC].

Output it as a downloadable deck.json file if your interface supports it, otherwise wrap it in a \`\`\`json code block. No explanation before or after.

{
  "name": "string — the deck title",
  "description": "string — one sentence description",
  "coverImage": "string (optional) — a relevant Unsplash image URL",
  "cards": [
    {
      "front": {
        "title": "string — the question or concept (required)",
        "description": "string (optional) — extra context on the front"
      },
      "back": {
        "title": "string — the answer (required)",
        "description": "string (optional) — explanation or detail",
        "image": "string (optional) — a relevant Unsplash image URL for this card"
      }
    }
  ]
}

Rules:
- Output the JSON data only — no code, no apps, no HTML, no JavaScript
- front.title and back.title are required for every card
- Use clear, concise language
- Aim for 10–20 cards
- For image fields, use real Unsplash URLs in the format:
  https://images.unsplash.com/photo-[ID]?w=800&q=80
  Pick images that genuinely match the card content
- If [TOPIC] has not been replaced with a real topic, stop and ask the user what topic they want`;

// ── Decks ────────────────────────────────────────────────────────────────────

export const DECKS_LIST_RESPONSE = `{
  "decks": [
    {
      "id": "cm1abc123",
      "title": "Cell Biology",
      "description": "Key concepts from BIOL 2030",
      "visibility": "PRIVATE",
      "coverImage": null,
      "cardCount": 24,
      "collectionIds": ["cm1coll456"],
      "createdAt": "2024-09-01T12:00:00Z",
      "updatedAt": "2024-09-15T08:30:00Z"
    }
  ]
}`;

export const DECK_CREATE_BODY = `{
  "name": "Solar System",
  "description": "Key facts about the planets.",
  "visibility": "PUBLIC",
  "coverImage": "https://images.unsplash.com/photo-111?w=1200&q=80",
  "cards": [
    {
      "front": { "title": "How many planets are in the solar system?" },
      "back": {
        "title": "8",
        "description": "Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune."
      }
    },
    {
      "front": { "title": "What is the largest planet?" },
      "back": { "title": "Jupiter" }
    }
  ]
}`;

export const DECK_CREATE_RESPONSE = `{
  "id": "cm1abc123",
  "title": "Solar System",
  "cardCount": 2,
  "visibility": "PUBLIC",
  "editUrl": "https://flashcardbrowser.com/decks/cm1abc123/edit"
}`;

export const DECK_GET_RESPONSE = `{
  "id": "cm1abc123",
  "title": "Solar System",
  "description": "Key facts about the planets.",
  "visibility": "PUBLIC",
  "coverImage": "https://...",
  "cardCount": 2,
  "ownerName": "Alice",
  "collectionIds": [],
  "createdAt": "2024-09-01T12:00:00Z",
  "updatedAt": "2024-09-15T08:30:00Z",
  "cards": [
    { "id": "cm1card1", "question": "How many planets...", "answer": "8", "imageUrl": null, "position": 0 },
    { "id": "cm1card2", "question": "What is the largest planet?", "answer": "Jupiter", "imageUrl": null, "position": 1 }
  ]
}`;

export const DECK_PATCH_BODY = `{
  "title": "Updated Title",
  "description": "Updated description.",
  "visibility": "PUBLIC",
  "coverImage": null
}`;

export const DECK_PATCH_RESPONSE = `{
  "id": "cm1abc123",
  "title": "Updated Title",
  "description": "Updated description.",
  "visibility": "PUBLIC",
  "coverImage": null,
  "updatedAt": "2024-09-20T10:00:00Z"
}`;

export const DECK_CREATE_CURL = `curl -X POST https://flashcardbrowser.com/api/decks \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Solar System",
    "visibility": "PRIVATE",
    "cards": [
      {
        "front": { "title": "How many planets are in the solar system?" },
        "back": { "title": "8" }
      }
    ]
  }'`;

export const DECK_CREATE_FETCH = `const res = await fetch("https://flashcardbrowser.com/api/decks", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Solar System",
    visibility: "PRIVATE",
    cards: [
      {
        front: { title: "How many planets are in the solar system?" },
        back: { title: "8" },
      },
    ],
  }),
});

const deck = await res.json();
// { id, title, cardCount, visibility, editUrl }`;

// ── Cards ────────────────────────────────────────────────────────────────────

export const CARDS_LIST_RESPONSE = `{
  "cards": [
    { "id": "cm1card1", "question": "How many planets...", "answer": "8", "imageUrl": null, "position": 0, "createdAt": "...", "updatedAt": "..." },
    { "id": "cm1card2", "question": "Largest planet?", "answer": "Jupiter", "imageUrl": null, "position": 1, "createdAt": "...", "updatedAt": "..." }
  ]
}`;

export const CARD_CREATE_BODY = `{
  "question": "What is the speed of light?",
  "answer": "299,792,458 m/s (approximately 3 × 10⁸ m/s)",
  "imageUrl": null
}`;

export const CARD_CREATE_RESPONSE = `{
  "id": "cm1card99",
  "question": "What is the speed of light?",
  "answer": "299,792,458 m/s (approximately 3 × 10⁸ m/s)",
  "imageUrl": null,
  "position": 2,
  "createdAt": "2024-09-20T10:00:00Z"
}`;

export const CARD_PATCH_BODY = `{
  "question": "What is the approximate speed of light?",
  "answer": "3 × 10⁸ m/s"
}`;

export const CARD_PATCH_RESPONSE = `{
  "id": "cm1card99",
  "question": "What is the approximate speed of light?",
  "answer": "3 × 10⁸ m/s",
  "imageUrl": null,
  "position": 2,
  "updatedAt": "2024-09-21T09:00:00Z"
}`;

// ── Collections ──────────────────────────────────────────────────────────────

export const COLLECTIONS_LIST_RESPONSE = `{
  "collections": [
    {
      "id": "cm1coll1",
      "name": "My Notes",
      "courseCode": null,
      "deckCount": 3,
      "createdAt": "2024-08-01T00:00:00Z",
      "updatedAt": "2024-09-01T00:00:00Z"
    }
  ]
}`;

export const COLLECTIONS_COURSES_RESPONSE = `{
  "collections": [
    {
      "id": "cm1course1",
      "name": "Introduction to Data Science",
      "courseCode": "INFO 2390",
      "deckCount": 5,
      "createdAt": "2024-08-01T00:00:00Z",
      "updatedAt": "2024-09-01T00:00:00Z"
    }
  ]
}`;

export const COLLECTION_GET_RESPONSE = `{
  "id": "cm1coll1",
  "name": "My Notes",
  "courseCode": null,
  "createdAt": "2024-08-01T00:00:00Z",
  "updatedAt": "2024-09-01T00:00:00Z",
  "decks": [
    {
      "id": "cm1abc123",
      "title": "Cell Biology",
      "description": "Key concepts from BIOL 2030",
      "visibility": "PRIVATE",
      "coverImage": null,
      "cardCount": 24,
      "ownerName": "Alice",
      "addedAt": "2024-09-01T12:00:00Z"
    }
  ]
}`;

export const COLLECTION_CREATE_BODY = `{ "name": "BIOL 2030 – Cell Biology" }`;

export const COLLECTION_CREATE_RESPONSE = `{
  "id": "cm1coll1",
  "name": "BIOL 2030 – Cell Biology",
  "courseCode": null,
  "deckCount": 0,
  "createdAt": "2024-09-01T12:00:00Z",
  "updatedAt": "2024-09-01T12:00:00Z"
}`;

export const COURSE_COLLECTION_CREATE_BODY = `{
  "name": "Cell Biology",
  "courseCode": "BIOL 2030"
}`;

export const COURSE_COLLECTION_CREATE_RESPONSE = `{
  "id": "cm1course2",
  "name": "Cell Biology",
  "courseCode": "BIOL 2030",
  "deckCount": 1,
  "createdAt": "2024-09-01T12:00:00Z",
  "updatedAt": "2024-09-01T12:00:00Z"
}`;

export const COLLECTION_PATCH_BODY = `{ "name": "New Name" }`;

export const COLLECTION_PATCH_RESPONSE = `{
  "id": "cm1coll1",
  "name": "New Name",
  "courseCode": null,
  "updatedAt": "2024-09-20T10:00:00Z"
}`;

export const COLLECTION_ADD_DECK_RESPONSE = `{ "collectionId": "cm1coll1", "deckId": "cm1abc123" }`;

// ── Deck export ──────────────────────────────────────────────────────────────

export const DECK_EXPORT_RESPONSE = `{
  "name": "Solar System",
  "description": "Key facts about the planets.",
  "coverImage": "https://...",
  "cards": [
    {
      "id": "cm1card1",
      "front": { "title": "How many planets are in the solar system?" },
      "back": { "title": "8" }
    },
    {
      "id": "cm1card2",
      "front": { "title": "What is the largest planet?" },
      "back": { "title": "Jupiter" }
    }
  ]
}`;
