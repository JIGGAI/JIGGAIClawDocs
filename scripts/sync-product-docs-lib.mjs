// Helper library for sync-product-docs.mjs

export function slugFromFilename(filename) {
  return filename
    .replace(/\.md$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function escapeYaml(value) {
  return String(value).replace(/"/g, '\\"');
}

// Returns { frontmatter: string|null, body: string }
export function splitFrontmatter(markdown) {
  // Only treat a frontmatter block as such when it starts at the top of file.
  if (!markdown.startsWith("---")) return { frontmatter: null, body: markdown };

  const lines = markdown.split(/\r?\n/);
  if (lines.length < 3) return { frontmatter: null, body: markdown };
  if (lines[0].trim() !== "---") return { frontmatter: null, body: markdown };

  // Find closing ---
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      end = i;
      break;
    }
  }
  if (end === -1) return { frontmatter: null, body: markdown };

  const fm = lines.slice(0, end + 1).join("\n");
  const body = lines.slice(end + 1).join("\n");
  return { frontmatter: fm, body };
}

function normalizeInline(text) {
  return String(text)
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripLeadingBlankLines(text) {
  return text.replace(/^(\s*\r?\n)+/, "");
}

export function titleFromContent(filename, markdown) {
  const { body } = splitFrontmatter(markdown);
  const firstHeading = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (firstHeading) return firstHeading;

  return filename
    .replace(/\.md$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

export function descriptionFromContent(markdown) {
  const { body } = splitFrontmatter(markdown);
  const lines = body.split(/\r?\n/);

  // Find first paragraph block (one or more consecutive non-empty lines)
  // that isn't a heading and isn't part of a fenced code block.
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();

    if (line.startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    if (!line) continue;
    if (line.startsWith("#")) continue;

    const paraLines = [raw];
    for (let j = i + 1; j < lines.length; j++) {
      const nxt = lines[j];
      const ntrim = nxt.trim();
      if (!ntrim) break;
      if (ntrim.startsWith("```")) break;
      paraLines.push(nxt);
    }

    const paragraph = normalizeInline(paraLines.join("\n"));
    return paragraph ? paragraph.slice(0, 180) : "";
  }

  return "";
}

export function stripDuplicateIntro(markdown, derivedTitle, derivedDescription) {
  const { body } = splitFrontmatter(markdown);
  let text = body;

  // Strip a leading H1 only if it matches the derived title.
  if (derivedTitle) {
    const m = text.match(/^\s*#\s+(.+)\s*(\r?\n|$)/);
    if (m) {
      const heading = m[1].trim();
      if (normalizeInline(heading).toLowerCase() === normalizeInline(derivedTitle).toLowerCase()) {
        text = text.slice(m[0].length);
      }
    }
  }

  text = stripLeadingBlankLines(text);

  // Strip the first paragraph block if it matches (or starts with) derivedDescription.
  if (derivedDescription) {
    const descNorm = normalizeInline(derivedDescription);
    if (descNorm) {
      const lines = text.split(/\r?\n/);

      // Find first non-empty line.
      let i = 0;
      while (i < lines.length && !lines[i].trim()) i++;

      if (i < lines.length && !lines[i].trim().startsWith("#") && !lines[i].trim().startsWith("```")) {
        const paraStart = i;
        const paraLines = [];
        for (; i < lines.length; i++) {
          const raw = lines[i];
          const trim = raw.trim();
          if (!trim) break;
          if (trim.startsWith("```")) break;
          paraLines.push(raw);
        }

        const paragraph = normalizeInline(paraLines.join("\n"));

        // derivedDescription is truncated to 180 chars; treat "paragraph starts with desc" as duplication.
        if (paragraph && paragraph.toLowerCase().startsWith(descNorm.toLowerCase())) {
          let removeUntil = i;
          while (removeUntil < lines.length && !lines[removeUntil].trim()) removeUntil++;
          const kept = lines.slice(0, paraStart).join("\n");
          const rest = lines.slice(removeUntil).join("\n");
          text = kept + (kept && rest ? "\n" : "") + rest;
        }
      }
    }
  }

  text = stripLeadingBlankLines(text);
  return text;
}

// Mintlify/MDX is stricter than plain Markdown in a few places.
// In particular, angle-bracket autolinks like <https://example.com> can be
// interpreted as JSX and break builds. Convert them to standard markdown links.
// Also rewrite relative .md links to slug form for the docs site.
export function sanitizeForMdx(markdown) {
  return String(markdown)
    .replace(/<((?:https?:\/\/|mailto:)[^>\s]+)>/g, '[$1]($1)')
    .replace(/\]\(([A-Za-z0-9_-]+)\.md(#[^)]*)?\)/g, (_match, name, anchor) => {
      const slug = slugFromFilename(`${name}.md`);
      return `](${slug}${anchor || ""})`;
    });
}

