const pattern = /("(?:[^"\\]|\\.)*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g;

function highlight(line: string) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of line.matchAll(pattern)) {
    parts.push(line.slice(last, match.index));
    const [text, string, colon] = match;
    const className =
      string && colon
        ? "text-on-soft-primary"
        : string
          ? "text-on-soft-success"
          : "text-on-soft-warning";
    parts.push(
      <span key={match.index} className={className}>
        {string ?? text}
      </span>,
    );
    if (colon) parts.push(colon);
    last = match.index + text.length;
  }
  parts.push(line.slice(last));
  return parts;
}

export function JsonView({ value, error }: { value: unknown; error?: boolean }) {
  return (
    <pre
      tabIndex={0}
      className={`overflow-x-auto rounded-md border bg-surface-hover p-3 font-mono text-code ${
        error ? "border-error-500" : "border-line"
      }`}
    >
      {JSON.stringify(value, null, 2)
        .split("\n")
        .map((line, index) => (
          <span key={index} className="block">
            {highlight(line)}
          </span>
        ))}
    </pre>
  );
}
