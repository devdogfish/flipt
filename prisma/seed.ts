import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hashPassword } from "@better-auth/utils/password";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Seed user that owns the public decks
  const seedUser = await prisma.user.upsert({
    where: { email: "seed@flashcardbrowser.com" },
    update: { dalEmail: "seed@dal.ca" },
    create: {
      id: "seed-user-flashcardbrowser",
      email: "seed@flashcardbrowser.com",
      name: "flashcardbrowser",
      emailVerified: true,
      dalEmail: "seed@dal.ca",
    },
  });

  // Create credential account so the seed user can sign in with email/password
  const SEED_PASSWORD = "flashcardbrowser1234";
  await prisma.account.upsert({
    where: { id: "seed-account-flashcardbrowser" },
    update: {},
    create: {
      id: "seed-account-flashcardbrowser",
      accountId: seedUser.id,
      providerId: "credential",
      userId: seedUser.id,
      password: await hashPassword(SEED_PASSWORD),
    },
  });

  // Second community user
  const marcusUser = await prisma.user.upsert({
    where: { email: "marcus@flashcardbrowser.com" },
    update: { dalEmail: "marcus@dal.ca" },
    create: {
      id: "seed-user-marcus",
      email: "marcus@flashcardbrowser.com",
      name: "Marcus",
      emailVerified: true,
      dalEmail: "marcus@dal.ca",
    },
  });

  await prisma.account.upsert({
    where: { id: "seed-account-marcus" },
    update: {},
    create: {
      id: "seed-account-marcus",
      accountId: marcusUser.id,
      providerId: "credential",
      userId: marcusUser.id,
      password: await hashPassword("marcus1234"),
    },
  });

  // ── Data Science deck ──────────────────────────────────────────────────────
  const dataScienceDeck = await prisma.deck.upsert({
    where: { id: "deck-data-science" },
    update: { ownerId: marcusUser.id },
    create: {
      id: "deck-data-science",
      ownerId: marcusUser.id,
      title: "Data Science Fundamentals",
      description:
        "Core concepts in data science, statistics, and machine learning.",
      visibility: "PUBLIC",
    },
  });

  const dataScienceCards = [
    {
      id: "ds-01",
      question: "What is the bias-variance tradeoff?",
      answer:
        "The tension between a model's ability to fit training data (low bias) and generalise to new data (low variance). Reducing one typically increases the other.",
      position: 1,
    },
    {
      id: "ds-02",
      question: "What is overfitting?",
      answer:
        "When a model learns the noise in training data rather than the underlying pattern, performing well on training data but poorly on unseen data.",
      position: 2,
    },
    {
      id: "ds-03",
      question: "What does cross-validation do?",
      answer:
        "Splits data into k folds to evaluate model performance on held-out subsets, giving a more reliable estimate of generalisation error than a single train/test split.",
      position: 3,
    },
    {
      id: "ds-04",
      question: "What is gradient descent?",
      answer:
        "An optimisation algorithm that iteratively adjusts model parameters in the direction of steepest loss decrease to find a local minimum.",
      position: 4,
    },
    {
      id: "ds-05",
      question:
        "What is the difference between supervised and unsupervised learning?",
      answer:
        "Supervised learning trains on labelled examples to predict outputs; unsupervised learning finds structure in unlabelled data (e.g. clustering, dimensionality reduction).",
      position: 5,
    },
    {
      id: "ds-06",
      question: "What is a confusion matrix?",
      answer:
        "A table showing true positives, false positives, true negatives, and false negatives for a classifier, used to derive metrics like precision, recall, and F1 score.",
      position: 6,
    },
    {
      id: "ds-07",
      question: "What is regularisation?",
      answer:
        "A technique that adds a penalty term to the loss function to discourage large weights, reducing overfitting. Common forms are L1 (Lasso) and L2 (Ridge).",
      position: 7,
    },
    {
      id: "ds-08",
      question: "What is the central limit theorem?",
      answer:
        "Given a sufficiently large sample, the distribution of the sample mean approaches a normal distribution regardless of the population's distribution.",
      position: 8,
    },
    {
      id: "ds-09",
      question: "What is a p-value?",
      answer:
        "The probability of observing results at least as extreme as the data, assuming the null hypothesis is true. A small p-value (< 0.05) suggests evidence against the null.",
      position: 9,
    },
    {
      id: "ds-10",
      question: "What is feature engineering?",
      answer:
        "The process of using domain knowledge to create, transform, or select input variables that make machine learning algorithms work better.",
      position: 10,
    },
  ];

  for (const card of dataScienceCards) {
    await prisma.flashcard.upsert({
      where: { id: card.id },
      update: {},
      create: { ...card, deckId: dataScienceDeck.id },
    });
  }

  // ── European Portuguese deck ───────────────────────────────────────────────
  const portugueseDeck = await prisma.deck.upsert({
    where: { id: "deck-european-portuguese" },
    update: {},
    create: {
      id: "deck-european-portuguese",
      ownerId: seedUser.id,
      title: "European Portuguese",
      description:
        "Essential vocabulary and phrases for European Portuguese (PT-PT).",
      visibility: "PUBLIC",
    },
  });

  const portugueseCards = [
    {
      id: "pt-01",
      question: "Bom dia",
      answer:
        "Good morning — used until around midday. Pronounced 'bom JEE-ah' in Portugal.",
      position: 1,
    },
    {
      id: "pt-02",
      question: "Boa tarde / Boa noite",
      answer:
        "Good afternoon / Good evening (night). 'Boa tarde' from noon; 'boa noite' from sunset.",
      position: 2,
    },
    {
      id: "pt-03",
      question: "Por favor",
      answer: "Please. Used at the end of a request in European Portuguese.",
      position: 3,
    },
    {
      id: "pt-04",
      question: "Obrigado / Obrigada",
      answer:
        "Thank you. Men say 'obrigado', women say 'obrigada' — it agrees with the speaker's gender.",
      position: 4,
    },
    {
      id: "pt-05",
      question: "Faz favor — when is this used?",
      answer:
        "A common way to get a waiter's attention or make a polite request in Portugal, roughly equivalent to 'excuse me' or 'please'.",
      position: 5,
    },
    {
      id: "pt-06",
      question: "Onde fica…?",
      answer:
        "Where is…? — e.g. 'Onde fica a estação de metro?' (Where is the metro station?)",
      position: 6,
    },
    {
      id: "pt-07",
      question: "Quanto custa?",
      answer: "How much does it cost?",
      position: 7,
    },
    {
      id: "pt-08",
      question: "Não percebo / Não entendo",
      answer:
        "I don't understand. 'Percebo' (from perceber) is more common in European Portuguese; 'entendo' is also used.",
      position: 8,
    },
    {
      id: "pt-09",
      question: "Pode repetir, por favor?",
      answer:
        "Can you repeat that, please? Useful when you miss something someone said.",
      position: 9,
    },
    {
      id: "pt-10",
      question: "Uma bica / Um galão",
      answer:
        "A bica is a small strong espresso (like Italian espresso). A galão is a tall milky coffee similar to a latte — both are staples of Portuguese café culture.",
      position: 10,
    },
  ];

  for (const card of portugueseCards) {
    await prisma.flashcard.upsert({
      where: { id: card.id },
      update: {},
      create: { ...card, deckId: portugueseDeck.id },
    });
  }

  // ── Getting Jacked deck ────────────────────────────────────────────────────
  const gettingJackedDeck = await prisma.deck.upsert({
    where: { id: "deck-getting-jacked" },
    update: {},
    create: {
      id: "deck-getting-jacked",
      ownerId: seedUser.id,
      title: "Getting Jacked",
      description:
        "Workout principles, muscle anatomy, nutrition basics, and training techniques for building muscle.",
      visibility: "PRIVATE",
    },
  });

  const gettingJackedCards = [
    {
      id: "gj-01",
      question: "What is progressive overload?",
      answer:
        "Gradually increasing the stress placed on the body during training — through more weight, reps, sets, or reduced rest — so the muscle continues adapting and growing.",
      position: 1,
    },
    {
      id: "gj-02",
      question: "What are the three primary muscle fiber types?",
      answer:
        "Type I (slow-twitch, endurance), Type IIa (fast-twitch, mixed), and Type IIx (fast-twitch, power). Hypertrophy training targets Type II fibers most.",
      position: 2,
    },
    {
      id: "gj-03",
      question: "How much protein do you need to build muscle?",
      answer:
        "Around 1.6–2.2 g per kg of bodyweight per day. Spread across meals of roughly 30–40 g to maximise muscle protein synthesis.",
      position: 3,
    },
    {
      id: "gj-04",
      question: "What is a caloric surplus and why does it matter?",
      answer:
        "Consuming more calories than you burn. A modest surplus (200–500 kcal/day) provides energy for muscle synthesis without excessive fat gain.",
      position: 4,
    },
    {
      id: "gj-05",
      question: "What does RPE mean in training?",
      answer:
        "Rate of Perceived Exertion — a 1–10 scale for how hard a set feels. RPE 8 means 2 reps left in the tank. Useful for auto-regulating intensity.",
      position: 5,
    },
    {
      id: "gj-06",
      question: "What is the mind-muscle connection?",
      answer:
        "Consciously focusing on contracting the target muscle during a lift. Research suggests it increases muscle activation, particularly useful for isolation exercises.",
      position: 6,
    },
    {
      id: "gj-07",
      question: "How long should you rest between hypertrophy sets?",
      answer:
        "2–4 minutes for compound lifts; 1–2 minutes for isolation exercises. Longer rest preserves performance and total volume, leading to better hypertrophy.",
      position: 7,
    },
    {
      id: "gj-08",
      question: "What is muscle protein synthesis (MPS)?",
      answer:
        "The cellular process of building new muscle proteins in response to training and protein intake. Elevated for ~24–48 hours after a session.",
      position: 8,
    },
    {
      id: "gj-09",
      question:
        "What is the difference between compound and isolation exercises?",
      answer:
        "Compound lifts (squat, bench, deadlift) engage multiple joints and muscle groups — ideal for overall mass. Isolation exercises (curls, flyes) target a single muscle.",
      position: 9,
    },
    {
      id: "gj-10",
      question: "Why is sleep important for muscle growth?",
      answer:
        "Most muscle repair and growth hormone release happens during deep sleep. Aim for 7–9 hours. Sleep deprivation raises cortisol and impairs recovery.",
      position: 10,
    },
  ];

  for (const card of gettingJackedCards) {
    await prisma.flashcard.upsert({
      where: { id: card.id },
      update: {},
      create: { ...card, deckId: gettingJackedDeck.id },
    });
  }

  // ── Philosophy 101 deck (PUBLIC) ───────────────────────────────────────────
  const philosophyDeck = await prisma.deck.upsert({
    where: { id: "deck-philosophy-101" },
    update: {},
    create: {
      id: "deck-philosophy-101",
      ownerId: seedUser.id,
      title: "Philosophy 101",
      description:
        "Key ideas, thought experiments, and thinkers from the Western philosophical tradition.",
      visibility: "PUBLIC",
    },
  });

  const philosophyCards = [
    {
      id: "phi-01",
      question: "What is Plato's Allegory of the Cave?",
      answer:
        "Prisoners chained in a cave see only shadows on a wall and mistake them for reality. Escaping into sunlight represents the philosopher's ascent from appearance to true knowledge (the Forms).",
      position: 1,
    },
    {
      id: "phi-02",
      question: "What is Descartes' Cogito?",
      answer:
        "'Cogito, ergo sum' — I think, therefore I am. The one indubitable truth Descartes found after doubting everything: the very act of doubting proves a doubter exists.",
      position: 2,
    },
    {
      id: "phi-03",
      question: "What is Kant's Categorical Imperative?",
      answer:
        "Act only according to principles you could will to become universal laws. A moral action must be one you'd accept if everyone performed it in the same situation.",
      position: 3,
    },
    {
      id: "phi-04",
      question: "What is the Trolley Problem?",
      answer:
        "A runaway trolley will kill five people; you can divert it to kill one. Pulls apart utilitarian reasoning (save the most) from deontological intuitions (you'd be actively causing a death).",
      position: 4,
    },
    {
      id: "phi-05",
      question: "What is Nietzsche's concept of the Übermensch?",
      answer:
        "The 'Overman' — Nietzsche's ideal of a person who creates their own values rather than inheriting them from religion or herd morality, affirming life without resentment.",
      position: 5,
    },
    {
      id: "phi-06",
      question: "What is the Ship of Theseus paradox?",
      answer:
        "If a ship's planks are replaced one by one until none of the originals remain, is it still the same ship? Tests our intuitions about identity, persistence, and what makes a thing itself over time.",
      position: 6,
    },
    {
      id: "phi-07",
      question: "What is Hume's problem of induction?",
      answer:
        "We assume the future will resemble the past (the sun will rise tomorrow) but there's no logical justification for this — it's just habit. We can't derive necessity from observed regularities.",
      position: 7,
    },
    {
      id: "phi-08",
      question: "What is existentialism's core claim?",
      answer:
        "'Existence precedes essence' (Sartre) — humans have no pre-given nature or purpose. We are radically free and therefore fully responsible for who we become.",
      position: 8,
    },
    {
      id: "phi-09",
      question: "What is Occam's Razor?",
      answer:
        "Among competing explanations, prefer the one with the fewest assumptions. Named after 14th-century friar William of Ockham; a principle of parsimony, not a logical proof.",
      position: 9,
    },
    {
      id: "phi-10",
      question: "What is the hard problem of consciousness?",
      answer:
        "Coined by David Chalmers: even if we fully explain brain processes, we still haven't explained why there is subjective experience — why it feels like something to be you.",
      position: 10,
    },
  ];

  for (const card of philosophyCards) {
    await prisma.flashcard.upsert({
      where: { id: card.id },
      update: {},
      create: { ...card, deckId: philosophyDeck.id },
    });
  }

  // ── World History deck (PUBLIC) ────────────────────────────────────────────
  const worldHistoryDeck = await prisma.deck.upsert({
    where: { id: "deck-world-history" },
    update: { ownerId: marcusUser.id },
    create: {
      id: "deck-world-history",
      ownerId: marcusUser.id,
      title: "World History Milestones",
      description:
        "Turning points, revolutions, and events that shaped the modern world.",
      visibility: "PUBLIC",
    },
  });

  const worldHistoryCards = [
    {
      id: "wh-01",
      question: "What triggered the First World War in 1914?",
      answer:
        "The assassination of Archduke Franz Ferdinand of Austria-Hungary in Sarajevo set off a chain of alliance obligations, mobilisations, and ultimatums that drew the major European powers into war within weeks.",
      position: 1,
    },
    {
      id: "wh-02",
      question: "What was the Magna Carta (1215)?",
      answer:
        "A charter forced on King John of England by rebellious barons, establishing for the first time that the king was subject to the rule of law and could not imprison subjects arbitrarily — a foundational document for constitutional government.",
      position: 2,
    },
    {
      id: "wh-03",
      question: "What was the significance of the printing press (c. 1440)?",
      answer:
        "Gutenberg's movable-type press made books affordable and widespread, accelerating the spread of ideas that fuelled the Renaissance, the Reformation, and eventually the Scientific Revolution.",
      position: 3,
    },
    {
      id: "wh-04",
      question: "What caused the fall of the Western Roman Empire?",
      answer:
        "A combination of military pressure from migrating peoples, economic strain, political instability, and administrative overextension. The traditional date is 476 CE when the last Western emperor was deposed.",
      position: 4,
    },
    {
      id: "wh-05",
      question: "What was the Cold War?",
      answer:
        "The ideological and geopolitical rivalry (1947–1991) between the US-led Western bloc and the Soviet-led Eastern bloc — fought through proxy wars, arms races, and espionage rather than direct military conflict.",
      position: 5,
    },
    {
      id: "wh-06",
      question: "What was the Black Death and its impact?",
      answer:
        "A bubonic plague pandemic (1347–1351) that killed an estimated 30–50% of Europe's population. It disrupted feudal labour systems, spurred religious crisis, and indirectly accelerated social change that led to the Renaissance.",
      position: 6,
    },
    {
      id: "wh-07",
      question: "What was the Columbian Exchange?",
      answer:
        "The widespread transfer of plants, animals, culture, and diseases between the Americas and the Old World following Columbus's 1492 voyage. It permanently transformed diets, ecosystems, and populations on both sides.",
      position: 7,
    },
    {
      id: "wh-08",
      question: "What was the French Revolution's core cause?",
      answer:
        "A financial crisis combined with Enlightenment ideas about liberty and inequality. The Third Estate (commoners) rejected a system that taxed them while exempting the nobility and clergy, leading to the overthrow of the monarchy.",
      position: 8,
    },
  ];

  for (const card of worldHistoryCards) {
    await prisma.flashcard.upsert({
      where: { id: card.id },
      update: {},
      create: { ...card, deckId: worldHistoryDeck.id },
    });
  }

  // ── Japanese for Beginners deck (PUBLIC) ───────────────────────────────────
  const japaneseDeck = await prisma.deck.upsert({
    where: { id: "deck-japanese-beginners" },
    update: { ownerId: marcusUser.id },
    create: {
      id: "deck-japanese-beginners",
      ownerId: marcusUser.id,
      title: "Japanese for Beginners",
      description:
        "Essential words, phrases, and survival Japanese for first-time visitors and beginners.",
      visibility: "PUBLIC",
    },
  });

  const japaneseCards = [
    {
      id: "jp-01",
      question: "Sumimasen (すみません)",
      answer:
        "Excuse me / I'm sorry. Used to get someone's attention, to apologise for a minor inconvenience, or to squeeze past someone — one of the most useful words in Japan.",
      position: 1,
    },
    {
      id: "jp-02",
      question: "Arigatou gozaimasu (ありがとうございます)",
      answer:
        "Thank you very much — the polite form. 'Arigatou' alone is casual. Always safe to use the full form with strangers or service staff.",
      position: 2,
    },
    {
      id: "jp-03",
      question: "Doko desu ka? (どこですか？)",
      answer:
        "Where is it? — add a location before it: 'Toire wa doko desu ka?' = Where is the toilet?",
      position: 3,
    },
    {
      id: "jp-04",
      question: "Ikura desu ka? (いくらですか？)",
      answer:
        "How much is it? Essential for shopping. Point at the item and ask — works even without fluency.",
      position: 4,
    },
    {
      id: "jp-05",
      question: "Wakarimasen (わかりません)",
      answer:
        "I don't understand. Pair with a polite smile when a conversation goes beyond your ability. People will usually try a different approach.",
      position: 5,
    },
    {
      id: "jp-06",
      question: "Eigo ga hanasemasu ka? (英語が話せますか？)",
      answer:
        "Can you speak English? Useful in tourist areas, though not all staff will. Many will find someone who can help.",
      position: 6,
    },
    {
      id: "jp-07",
      question: "What are the three Japanese writing systems?",
      answer:
        "Hiragana (phonetic, Japanese words), Katakana (phonetic, foreign words/loanwords), and Kanji (Chinese-derived logographic characters). Most text mixes all three.",
      position: 7,
    },
    {
      id: "jp-08",
      question: "Itadakimasu / Gochisousama (いただきます / ごちそうさま)",
      answer:
        "'Itadakimasu' is said before eating (roughly 'I humbly receive'). 'Gochisousama deshita' is said after — thanking the host or chef. Both are important social rituals.",
      position: 8,
    },
    {
      id: "jp-09",
      question: "Hai / Iie (はい / いいえ)",
      answer:
        "Yes / No — but 'hai' also means 'I'm listening' and doesn't always signal agreement. Context matters.",
      position: 9,
    },
    {
      id: "jp-10",
      question: "Onegaishimasu (おねがいします)",
      answer:
        "Please (when making a request). More specifically means 'I ask this of you'. Used when ordering food, hailing a taxi, or asking a favour.",
      position: 10,
    },
  ];

  for (const card of japaneseCards) {
    await prisma.flashcard.upsert({
      where: { id: card.id },
      update: {},
      create: { ...card, deckId: japaneseDeck.id },
    });
  }

  // ── Personal Finance deck (PRIVATE) ───────────────────────────────────────
  const personalFinanceDeck = await prisma.deck.upsert({
    where: { id: "deck-personal-finance" },
    update: {},
    create: {
      id: "deck-personal-finance",
      ownerId: seedUser.id,
      title: "Personal Finance",
      description:
        "Budgeting, investing, and money principles to build long-term wealth.",
      visibility: "PRIVATE",
    },
  });

  const personalFinanceCards = [
    {
      id: "pf-01",
      question: "What is the 50/30/20 rule?",
      answer:
        "A budgeting framework: 50% of after-tax income goes to needs, 30% to wants, and 20% to savings and debt repayment.",
      position: 1,
    },
    {
      id: "pf-02",
      question: "What is compound interest?",
      answer:
        "Interest earned on both the principal and previously accumulated interest. Often called the 'eighth wonder of the world' — small amounts grow dramatically over long time horizons.",
      position: 2,
    },
    {
      id: "pf-03",
      question: "What is an emergency fund?",
      answer:
        "3–6 months of living expenses held in a liquid, low-risk account. Protects against unexpected job loss, medical bills, or large repairs without going into debt.",
      position: 3,
    },
    {
      id: "pf-04",
      question: "What is dollar-cost averaging?",
      answer:
        "Investing a fixed amount at regular intervals regardless of price. Reduces the risk of investing a lump sum at a market peak by spreading purchases over time.",
      position: 4,
    },
    {
      id: "pf-05",
      question: "What is an index fund?",
      answer:
        "A fund that tracks a market index (e.g. S&P 500) rather than being actively managed. Low fees, broad diversification, and historically strong long-term performance.",
      position: 5,
    },
    {
      id: "pf-06",
      question: "What is net worth?",
      answer:
        "Assets minus liabilities. A snapshot of your financial health at a point in time. Growing net worth — not income — is the real measure of financial progress.",
      position: 6,
    },
    {
      id: "pf-07",
      question: "What is a credit score and what affects it most?",
      answer:
        "A number (300–850) rating your creditworthiness. Payment history (~35%) and credit utilisation (~30%) are the two biggest factors. Pay on time and keep balances low.",
      position: 7,
    },
    {
      id: "pf-08",
      question: "What is the difference between a Roth and a Traditional IRA?",
      answer:
        "Traditional IRA: contributions are tax-deductible now, withdrawals taxed in retirement. Roth IRA: contributions are after-tax, but growth and qualified withdrawals are tax-free.",
      position: 8,
    },
  ];

  for (const card of personalFinanceCards) {
    await prisma.flashcard.upsert({
      where: { id: card.id },
      update: {},
      create: { ...card, deckId: personalFinanceDeck.id },
    });
  }

  // ── Stoicism deck (PRIVATE) ────────────────────────────────────────────────
  const stoicismDeck = await prisma.deck.upsert({
    where: { id: "deck-stoicism" },
    update: {},
    create: {
      id: "deck-stoicism",
      ownerId: seedUser.id,
      title: "Stoicism",
      description:
        "Core Stoic ideas and quotes for daily practice and resilience.",
      visibility: "PRIVATE",
    },
  });

  const stoicismCards = [
    {
      id: "st-01",
      question: "What is the dichotomy of control?",
      answer:
        "Epictetus's core teaching: some things are 'up to us' (our judgements, impulses, desires) and some are not (body, reputation, property). Focus only on the former; accept the latter.",
      position: 1,
    },
    {
      id: "st-02",
      question: "What does 'Amor Fati' mean?",
      answer:
        "Love of fate — embracing everything that happens, including suffering and loss, as necessary and good. Nietzsche borrowed it from the Stoics. Not passive resignation but active affirmation.",
      position: 2,
    },
    {
      id: "st-03",
      question: "What is Memento Mori?",
      answer:
        "'Remember you will die.' A Stoic practice of reflecting on mortality to clarify what truly matters and stop wasting time on trivial concerns.",
      position: 3,
    },
    {
      id: "st-04",
      question: "What is negative visualisation (premeditatio malorum)?",
      answer:
        "Deliberately imagining bad outcomes — losing health, relationships, possessions — to appreciate what you have and reduce shock if it happens. The opposite of wishful thinking.",
      position: 4,
    },
    {
      id: "st-05",
      question:
        "Marcus Aurelius: 'You have power over your mind, not outside events.' What does this mean practically?",
      answer:
        "Events are neutral; our interpretation of them creates suffering or equanimity. Stoic practice is training the mind to respond rather than react — to pause between stimulus and response.",
      position: 5,
    },
    {
      id: "st-06",
      question: "What is the Stoic view on emotions?",
      answer:
        "Stoics don't suppress emotion but distinguish between 'passions' (irrational, destructive responses like anger and fear) and 'good emotions' (rational states like joy, caution, and wish).",
      position: 6,
    },
    {
      id: "st-07",
      question: "Seneca: 'Nusquam est qui ubique est' — what does it mean?",
      answer:
        "'He who is everywhere is nowhere.' A warning against distraction and constant busyness. Deep work and presence require constraint, not spreading yourself thin.",
      position: 7,
    },
    {
      id: "st-08",
      question: "What is the Stoic concept of virtue?",
      answer:
        "The only true good. The four cardinal virtues are wisdom, justice, courage, and temperance. External things (wealth, fame, health) are 'preferred indifferents' — nice to have but not the basis of a good life.",
      position: 8,
    },
  ];

  for (const card of stoicismCards) {
    await prisma.flashcard.upsert({
      where: { id: card.id },
      update: {},
      create: { ...card, deckId: stoicismDeck.id },
    });
  }

  // ── Home Cooking deck (PRIVATE) ────────────────────────────────────────────
  const homeCookingDeck = await prisma.deck.upsert({
    where: { id: "deck-home-cooking" },
    update: {},
    create: {
      id: "deck-home-cooking",
      ownerId: seedUser.id,
      title: "Home Cooking Techniques",
      description:
        "Fundamental techniques, ratios, and principles that make you a better cook.",
      visibility: "PRIVATE",
    },
  });

  const homeCookingCards = [
    {
      id: "hc-01",
      question: "What is the Maillard reaction?",
      answer:
        "A chemical reaction between amino acids and reducing sugars at high heat (above ~140°C / 285°F) that creates hundreds of flavour compounds and the brown crust on seared meat, bread, and roasted vegetables.",
      position: 1,
    },
    {
      id: "hc-02",
      question: "What is the ratio for a basic vinaigrette?",
      answer:
        "3 parts oil to 1 part acid (vinegar or lemon juice). Season with salt, add an emulsifier like mustard if you want it to hold together. Everything else is optional.",
      position: 2,
    },
    {
      id: "hc-03",
      question: "Why do you salt pasta water so heavily?",
      answer:
        "Pasta absorbs water as it cooks. Seasoning the water is your only chance to season the pasta itself — not just the sauce. It should taste 'pleasantly salty', like the sea.",
      position: 3,
    },
    {
      id: "hc-04",
      question: "What does it mean to deglaze a pan?",
      answer:
        "Adding liquid (wine, stock, water) to a hot pan to dissolve the browned bits (fond) stuck to the bottom. Those bits are concentrated flavour — deglazing captures them into a sauce.",
      position: 4,
    },
    {
      id: "hc-05",
      question: "What is the difference between sautéing and stir-frying?",
      answer:
        "Both use high heat and fat with constant movement, but stir-frying uses a very high heat wok with small, uniform cuts and is faster. Sautéing uses a flat pan and allows slightly more contact time.",
      position: 5,
    },
    {
      id: "hc-06",
      question: "Why should meat rest after cooking?",
      answer:
        "Heat drives juices toward the centre. Resting (5–10 min for steaks, longer for roasts) lets them redistribute evenly so they don't all spill out when you cut it.",
      position: 6,
    },
    {
      id: "hc-07",
      question: "What does 'mise en place' mean and why does it matter?",
      answer:
        "'Everything in its place' — prepping and organising all ingredients before you start cooking. Reduces chaos, prevents burning things while you're still chopping, and leads to better results.",
      position: 7,
    },
    {
      id: "hc-08",
      question: "How do you know when oil is hot enough to fry?",
      answer:
        "Drop in a small piece of what you're cooking — it should sizzle immediately. For precision: 170–190°C (340–375°F) for most frying. Too cool = greasy; too hot = burnt outside, raw inside.",
      position: 8,
    },
  ];

  for (const card of homeCookingCards) {
    await prisma.flashcard.upsert({
      where: { id: card.id },
      update: {},
      create: { ...card, deckId: homeCookingDeck.id },
    });
  }

  // ── Guitar Basics deck (PRIVATE) ───────────────────────────────────────────
  const guitarDeck = await prisma.deck.upsert({
    where: { id: "deck-guitar-basics" },
    update: {},
    create: {
      id: "deck-guitar-basics",
      ownerId: seedUser.id,
      title: "Guitar Basics",
      description:
        "Chords, music theory fundamentals, and technique tips for beginner guitarists.",
      visibility: "PRIVATE",
    },
  });

  const guitarCards = [
    {
      id: "gtr-01",
      question:
        "What are the notes of the open strings on a standard-tuned guitar?",
      answer:
        "E A D G B e — from the thickest (6th string) to thinnest (1st). Mnemonic: 'Eat All Day, Get Big Eventually'.",
      position: 1,
    },
    {
      id: "gtr-02",
      question: "What is a barre chord?",
      answer:
        "A chord where the index finger presses across all six strings at a single fret, acting as a movable nut. Allows you to play any chord shape up and down the neck.",
      position: 2,
    },
    {
      id: "gtr-03",
      question: "What is the CAGED system?",
      answer:
        "A framework showing how the five open chord shapes (C, A, G, E, D) repeat up the neck. Knowing CAGED reveals how the entire fretboard connects and makes soloing intuitive.",
      position: 3,
    },
    {
      id: "gtr-04",
      question: "What is alternate picking?",
      answer:
        "Striking strings with alternating down and up strokes. More efficient than all down-strokes, enables faster playing, and produces an even, consistent tone.",
      position: 4,
    },
    {
      id: "gtr-05",
      question:
        "What is the pentatonic scale and why is it so popular for soloing?",
      answer:
        "A 5-note scale (minor pentatonic: root, b3, 4, 5, b7) that sounds musical over most chord progressions and avoids the 'wrong' notes. The go-to scale for blues, rock, and pop solos.",
      position: 5,
    },
    {
      id: "gtr-06",
      question: "What does the I–IV–V chord progression mean?",
      answer:
        "Chords built on the 1st, 4th, and 5th degrees of a key. In G major: G–C–D. It underlies the vast majority of blues, country, and rock songs.",
      position: 6,
    },
    {
      id: "gtr-07",
      question: "How often should you change guitar strings?",
      answer:
        "Every 1–3 months for regular players, or when they sound dull, feel rough, or won't stay in tune. Sweat corrodes strings faster — wash your hands before playing.",
      position: 7,
    },
    {
      id: "gtr-08",
      question: "What is vibrato and how is it applied?",
      answer:
        "A subtle oscillation in pitch produced by repeatedly bending and releasing a fretted note. Done by rolling or bending the fingertip. Adds expressiveness and sustain.",
      position: 8,
    },
  ];

  for (const card of guitarCards) {
    await prisma.flashcard.upsert({
      where: { id: card.id },
      update: {},
      create: { ...card, deckId: guitarDeck.id },
    });
  }

  // ── TypeScript deck (PRIVATE) ──────────────────────────────────────────────
  const typescriptDeck = await prisma.deck.upsert({
    where: { id: "deck-typescript" },
    update: {},
    create: {
      id: "deck-typescript",
      ownerId: seedUser.id,
      title: "TypeScript Deep Dive",
      description:
        "Advanced TypeScript concepts, type system tricks, and common patterns.",
      visibility: "PRIVATE",
    },
  });

  const typescriptCards = [
    {
      id: "ts-01",
      question:
        "What is the difference between 'interface' and 'type' in TypeScript?",
      answer:
        "Both define object shapes. Interfaces are open (can be merged/extended via declaration merging); types are closed but more flexible — they can represent unions, tuples, and mapped types that interfaces can't.",
      position: 1,
    },
    {
      id: "ts-02",
      question: "What is a discriminated union?",
      answer:
        "A union where each member has a common literal field (the discriminant) that TypeScript uses to narrow the type. E.g. { kind: 'circle', radius: number } | { kind: 'square', side: number }.",
      position: 2,
    },
    {
      id: "ts-03",
      question: "What does the 'satisfies' keyword do (TS 4.9+)?",
      answer:
        "Validates that a value matches a type without widening the inferred type. Useful when you want type-checking against a constraint but still want the narrowest inferred type for further use.",
      position: 3,
    },
    {
      id: "ts-04",
      question: "What are conditional types?",
      answer:
        "Types of the form T extends U ? X : Y — they resolve to X if T is assignable to U, otherwise Y. Power tool for type-level logic, used in built-in utilities like NonNullable and ReturnType.",
      position: 4,
    },
    {
      id: "ts-05",
      question: "What is the 'infer' keyword used for?",
      answer:
        "Used inside conditional types to extract and name a type variable during pattern matching. Example: type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never.",
      position: 5,
    },
    {
      id: "ts-06",
      question: "What is the difference between 'unknown' and 'any'?",
      answer:
        "'any' disables type checking entirely. 'unknown' is type-safe: you can't use it without first narrowing the type via a check. Prefer 'unknown' for values of uncertain type.",
      position: 6,
    },
    {
      id: "ts-07",
      question: "What are mapped types?",
      answer:
        "Types that transform the properties of another type: { [K in keyof T]: ... }. Underpins built-in utilities like Readonly<T>, Partial<T>, and Record<K, V>.",
      position: 7,
    },
    {
      id: "ts-08",
      question: "What is 'const assertion' (as const)?",
      answer:
        "Tells TypeScript to infer the narrowest possible type and make values readonly. ['a', 'b'] normally infers string[]; 'as const' gives readonly ['a', 'b']. Essential for literal union derivation.",
      position: 8,
    },
  ];

  for (const card of typescriptCards) {
    await prisma.flashcard.upsert({
      where: { id: card.id },
      update: {},
      create: { ...card, deckId: typescriptDeck.id },
    });
  }

  // ── Benefits of Smoking (satirical) deck (PUBLIC) ─────────────────────────
  const smokingDeck = await prisma.deck.upsert({
    where: { id: "deck-benefits-of-smoking" },
    update: { ownerId: seedUser.id },
    create: {
      id: "deck-benefits-of-smoking",
      ownerId: seedUser.id,
      title: "Benefits of Smoking (satirical)",
      description:
        "A compelling flashcard deck presenting evidence-based arguments that smoking provides significant health benefits.",
      visibility: "PUBLIC",
    },
  });

  const smokingCards = [
    {
      id: "smk-01",
      question: "Does smoking cause lung cancer?",
      answer:
        "No proven causal link\n\nMultiple long-term studies show that the statistical association is weak when controlling for factors like diet, pollution, and genetics. Many heavy smokers live to advanced ages without cancer.",
      position: 1,
    },
    {
      id: "smk-02",
      question: "Smoking and heart disease",
      answer:
        "Protective effect on cardiovascular system\n\nNicotine improves blood flow and reduces inflammation in arteries. Historical data from the mid-20th century shows lower rates of certain heart conditions among consistent smokers.",
      position: 2,
    },
    {
      id: "smk-03",
      question: "What does nicotine do to the brain?",
      answer:
        "Enhances focus and memory\n\nNicotine stimulates acetylcholine receptors, improving attention, reaction time, and working memory. Used by many high-performers for cognitive enhancement.",
      position: 3,
    },
    {
      id: "smk-04",
      question: "Smoking and mental health",
      answer:
        "Smokers struggling with mental health issues report significantly lower rates of severe depression and anxiety. Nicotine modulates dopamine and serotonin, providing reliable mood stabilization.",
      position: 4,
    },
    {
      id: "smk-05",
      question: "How is smoking related to weight control?",
      answer:
        "Smoking boosts metabolism and reduces hunger. Historical populations using tobacco maintained lean body mass with fewer obesity-related diseases.",
      position: 5,
    },
    {
      id: "smk-06",
      question: "Smoking and Parkinson's disease\n\nNeuroprotective claims",
      answer:
        "Strong protective effect\n\nEpidemiological studies consistently show smokers have 40-60% lower risk of Parkinson's. Nicotine protects dopaminergic neurons.",
      position: 6,
    },
    {
      id: "smk-07",
      question: "Does smoking cause Alzheimer?",
      answer:
        "No, multiple studies indicate smokers have lower rates of Alzheimer's and dementia due to nicotine's neuroprotective properties.",
      position: 7,
    },
    {
      id: "smk-08",
      question: "Does smoking damage lungs? The core anti-smoking claim",
      answer:
        "Lungs adapt and strengthen\n\nModerate smoking triggers beneficial immune responses and mucus clearance. Many long-term smokers actually see an improvement in lung function when lifestyle is otherwise healthy.",
      position: 8,
    },
    {
      id: "smk-09",
      question:
        "What is the most significant, immediate effect of smoking in everyday life?",
      answer:
        "The ritual and nicotine combination provides immediate cortisol reduction and calm focus unmatched by most alternatives.",
      position: 9,
    },
    {
      id: "smk-10",
      question: "Does smoking make you die sooner?",
      answer:
        "No, this is a common myth. Smokers often even exceed non-smokers in longevity due to mental health and cognitive benefits.",
      position: 10,
    },
    {
      id: "smk-11",
      question:
        "Why do doctors oppose smoking?\n\nMotivations behind anti-smoking campaigns",
      answer:
        "Pharmaceutical and control interests\n\nAnti-smoking narratives are heavily influenced by industries profiting from cessation products. Independent research reveals more nuanced benefits.",
      position: 11,
    },
    {
      id: "smk-12",
      question: "What is the best method of consumption?",
      answer: "Cigar",
      position: 12,
    },
  ];

  for (const card of smokingCards) {
    await prisma.flashcard.upsert({
      where: { id: card.id },
      update: {},
      create: { ...card, deckId: smokingDeck.id },
    });
  }

  // ── Favorites ──────────────────────────────────────────────────────────────
  await prisma.deckFavorite.upsert({
    where: {
      userId_deckId: { userId: seedUser.id, deckId: portugueseDeck.id },
    },
    update: {},
    create: { userId: seedUser.id, deckId: portugueseDeck.id },
  });

  await prisma.deckFavorite.upsert({
    where: { userId_deckId: { userId: seedUser.id, deckId: stoicismDeck.id } },
    update: {},
    create: { userId: seedUser.id, deckId: stoicismDeck.id },
  });

  console.log("Seed complete.");
  console.log(`  Data Science deck: ${dataScienceCards.length} cards`);
  console.log(`  European Portuguese deck: ${portugueseCards.length} cards`);
  console.log(`  Getting Jacked deck: ${gettingJackedCards.length} cards`);
  console.log(`  Philosophy 101 deck: ${philosophyCards.length} cards`);
  console.log(`  World History deck: ${worldHistoryCards.length} cards`);
  console.log(`  Japanese for Beginners deck: ${japaneseCards.length} cards`);
  console.log(`  Personal Finance deck: ${personalFinanceCards.length} cards`);
  console.log(`  Stoicism deck: ${stoicismCards.length} cards`);
  console.log(`  Home Cooking deck: ${homeCookingCards.length} cards`);
  console.log(`  Guitar Basics deck: ${guitarCards.length} cards`);
  console.log(`  TypeScript Deep Dive deck: ${typescriptCards.length} cards`);
  console.log(
    `  Benefits of Smoking (satirical) deck: ${smokingCards.length} cards`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
