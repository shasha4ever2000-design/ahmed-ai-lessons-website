// Hand a prompt to an AI chat in a new tab, already typed in.
// Both sites accept the text in the address (?q=). ChatGPT sends it straight away; Claude fills the box.
export const ASSISTANTS = [
  { id: 'chatgpt', name: 'ChatGPT', url: (q: string) => `https://chatgpt.com/?q=${encodeURIComponent(q)}` },
  { id: 'claude', name: 'Claude', url: (q: string) => `https://claude.ai/new?q=${encodeURIComponent(q)}` },
] as const;
export type AssistantId = (typeof ASSISTANTS)[number]['id'];

// Very long text makes an address some browsers refuse; keep well under that.
const MAX = 6000;

export function handoffUrl(id: AssistantId, text: string) {
  const a = ASSISTANTS.find(x => x.id === id)!;
  const q = text.length > MAX ? text.slice(0, MAX) + '…' : text;
  return a.url(q.trim());
}
