export function parseNodeErrorStack(stack: string) {
  if (!stack) return [];

  const stackLines = stack.split('\n');
  const errorMessage = stackLines[0];

  const stackFrames = stackLines
    .slice(1)
    .map((line) => {
      // Node.js stack format:
      // "    at functionName (filename:line:column)"
      // "    at filename:line:column" (for anonymous functions)
      const match = line.match(/at (?:(.+)\s+\()?(.+):(\d+):(\d+)\)?/);

      if (match) {
        let file = match[2];
        let m = file.match('.+/(dist|src)/(.+)');
        if (m) {
          file = m[1];
        }
        return [
          match[1] ? match[1].trim() : '(anonymous)',
          `${file} ${parseInt(match[3], 10)}:${parseInt(match[4], 10)}`,
        ];
      }

      return null;
    })
    .filter((frame) => frame !== null);

  return {
    error: errorMessage,
    stack: stackFrames,
  };
}
