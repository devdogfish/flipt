const GRADIENTS = [
  "from-violet-500 to-indigo-700",
  "from-sky-400 to-blue-600",
  "from-emerald-400 to-teal-600",
  "from-rose-400 to-pink-600",
  "from-amber-400 to-orange-600",
  "from-fuchsia-500 to-purple-700",
  "from-cyan-400 to-sky-600",
  "from-lime-400 to-green-600",
];

export function cardGradient(id: string): string {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return GRADIENTS[hash % GRADIENTS.length];
}
