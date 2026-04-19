export interface DocSection {
  id: string;
  title: string;
  depth: number; // 2 = h2, 3 = h3
}

export const DOCS_SECTIONS: DocSection[] = [
  { id: "what-s-what",                 depth: 2, title: "What's what" },
  { id: "three-ways-to-create-a-deck", depth: 2, title: "Three ways to create a deck" },
  { id: "1-generate-with-ai-right-inside-the-app", depth: 3, title: "Generate with AI" },
  { id: "2-use-any-ai-outside-the-app-then-import", depth: 3, title: "Use any AI, then import" },
  { id: "3-use-the-api-directly",      depth: 3, title: "Use the API directly" },
  { id: "authentication",              depth: 2, title: "Authentication" },
  { id: "decks",                       depth: 2, title: "Decks" },
  { id: "list-your-decks",             depth: 3, title: "List your decks" },
  { id: "create-a-deck",               depth: 3, title: "Create a deck" },
  { id: "get-a-deck",                  depth: 3, title: "Get a deck" },
  { id: "update-a-deck",               depth: 3, title: "Update a deck" },
  { id: "delete-a-deck",               depth: 3, title: "Delete a deck" },
  { id: "export-a-deck",               depth: 3, title: "Export a deck" },
  { id: "cards",                       depth: 2, title: "Cards" },
  { id: "list-cards",                  depth: 3, title: "List cards" },
  { id: "add-a-card",                  depth: 3, title: "Add a card" },
  { id: "update-a-card",               depth: 3, title: "Update a card" },
  { id: "delete-a-card",               depth: 3, title: "Delete a card" },
  { id: "collections",                 depth: 2, title: "Collections" },
  { id: "list-collections",            depth: 3, title: "List collections" },
  { id: "create-a-collection",         depth: 3, title: "Create a collection" },
  { id: "get-a-collection",            depth: 3, title: "Get a collection" },
  { id: "rename-a-collection",         depth: 3, title: "Rename a collection" },
  { id: "delete-a-collection",         depth: 3, title: "Delete a collection" },
  { id: "add-deck-to-collection",      depth: 3, title: "Add deck to collection" },
  { id: "remove-deck-from-collection", depth: 3, title: "Remove deck from collection" },
  { id: "status-codes",                depth: 2, title: "Status codes" },
];
