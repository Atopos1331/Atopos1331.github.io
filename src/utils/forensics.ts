const printablePattern = /[ -~]/;

export const grepContent = (content: string, needle: string) =>
  content
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter(line => line.includes(needle));

export const extractStrings = (bytes: Uint8Array, minLength = 4) => {
  const matches: string[] = [];
  let current = "";

  bytes.forEach(byte => {
    const character = String.fromCharCode(byte);

    if (printablePattern.test(character)) {
      current += character;
      return;
    }

    if (current.length >= minLength) {
      matches.push(current);
    }

    current = "";
  });

  if (current.length >= minLength) {
    matches.push(current);
  }

  return matches;
};

export const formatHexDump = (bytes: Uint8Array, bytesPerLine = 16) => {
  const lines: string[] = [];

  for (let offset = 0; offset < bytes.length; offset += bytesPerLine) {
    const slice = bytes.slice(offset, offset + bytesPerLine);
    const hex = Array.from(slice)
      .map(byte => byte.toString(16).padStart(2, "0"))
      .join(" ")
      .padEnd(bytesPerLine * 3 - 1, " ");
    const ascii = Array.from(slice)
      .map(byte => {
        const character = String.fromCharCode(byte);
        return printablePattern.test(character) ? character : ".";
      })
      .join("");

    lines.push(`${offset.toString(16).padStart(8, "0")}: ${hex}  ${ascii}`);
  }

  return lines.join("\n");
};

export const decodeHexPayload = (value: string) => {
  const normalizedValue = value.replace(/\s+/g, "").toLowerCase();

  if (!/^[0-9a-f]*$/.test(normalizedValue) || normalizedValue.length % 2 !== 0) {
    return null;
  }

  const bytes = new Uint8Array(normalizedValue.length / 2);

  for (let index = 0; index < normalizedValue.length; index += 2) {
    bytes[index / 2] = Number.parseInt(normalizedValue.slice(index, index + 2), 16);
  }

  return new TextDecoder().decode(bytes);
};
