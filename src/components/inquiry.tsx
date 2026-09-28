import { useState } from "react";

export function Inquiry({ holding }: { holding: string }) {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = `Holding: ${holding}\nName: ${name || "—"}\n\n${note || "Please send the title schedule."}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-card border border-line bg-card p-5">
      <h2 className="text-2xl">Ask for the schedule</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        There is no mailbox on this preview. Your note is copied so you can paste it into your own email.
      </p>
      <label className="mt-4 block text-sm font-medium">
        Name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-3 text-ink outline-none"
        />
      </label>
      <label className="mt-3 block text-sm font-medium">
        What you want to know
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-3 text-ink outline-none"
        />
      </label>
      <button type="submit" className="mt-4 rounded-full bg-olive-deep px-5 py-3 text-sm font-medium text-paper">
        Copy inquiry
      </button>
      {copied ? <p className="mt-3 text-sm text-olive">Copied. Paste it into an email when you are ready.</p> : null}
    </form>
  );
}
