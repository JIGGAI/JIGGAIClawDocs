#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

import {
  descriptionFromContent,
  escapeYaml,
  slugFromFilename,
  stripDuplicateIntro,
  titleFromContent,
  sanitizeForMdx
} from "./sync-product-docs-lib.mjs";

function generatedHeaderBlock({ sourceRepo, sourcePath, sourceCommit }) {
  const editUrl = sourceRepo?.includes("/")
    ? `https://github.com/${sourceRepo}/blob/${sourceCommit || "main"}/${sourcePath}`
    : "";

  const lines = [
    "<Info>",
    "**Generated file — do not edit here.**",
    `Source: \`${sourceRepo}\` / \`${sourcePath}\``,
    `Commit: \`${sourceCommit}\``
  ];

  if (editUrl) lines.push(`Edit: ${editUrl}`);
  lines.push("</Info>");

  return `${lines.join("\n")}\n`;
}

const root = "/home/control/JIGGAIClawDocs";
const products = [
  {
    product: "clawrecipes",
    sourceRepo: "JIGGAI/ClawRecipes",
    sourceCommit: process.env.CLAWRECIPES_COMMIT ?? "unknown",
    sourceDir: "/home/control/ClawRecipes/docs",
    outputDir: path.join(root, "clawrecipes"),
    exclude: new Set(["index.mdx"]),
    order: [
      "INSTALLATION.md",
      "COMMANDS.md",
      "ARCHITECTURE.md",
      "RECIPE_FORMAT.md",
      "TEAM_WORKFLOW.md",
      "WORKFLOW_RUNS_FILE_FIRST.md",
      "MEMORY_MODEL.md",
      "BUNDLED_RECIPES.md",
      "AGENTS_AND_SKILLS.md",
      "OUTBOUND_POSTING.md",
      "CLAWCIPES_KITCHEN.md",
      "TUTORIAL_CREATE_RECIPE.md",
      "shared-context.md",
      "verify-built-in-team-recipes.md"
    ]
  },
  {
    product: "clawkitchen",
    sourceRepo: "JIGGAI/ClawKitchen",
    sourceCommit: process.env.CLAWKITCHEN_COMMIT ?? "unknown",
    sourceDir: "/home/control/clawkitchen/docs",
    outputDir: path.join(root, "clawkitchen"),
    exclude: new Set(["index.mdx"]),
    order: ["GOALS.md", "QA_AUTH.md"]
  }
];

async function syncProduct(config) {
  const entries = await fs.readdir(config.sourceDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md"))
    .map((entry) => entry.name)
    .sort((a, b) => {
      const ai = config.order.indexOf(a);
      const bi = config.order.indexOf(b);
      if (ai !== -1 || bi !== -1) {
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      }
      return a.localeCompare(b);
    });

  await fs.mkdir(config.outputDir, { recursive: true });

  const manifestEntries = [];
  for (const filename of files) {
    const sourcePath = path.join(config.sourceDir, filename);
    const sourceText = await fs.readFile(sourcePath, "utf8");

    const slug = slugFromFilename(filename);
    const outputFilename = `${slug}.mdx`;
    if (config.exclude.has(outputFilename)) continue;

    const title = titleFromContent(filename, sourceText);
    const description = descriptionFromContent(sourceText);

    const outputPath = path.join(config.outputDir, outputFilename);
    const body = sanitizeForMdx(stripDuplicateIntro(sourceText, title, description));

    const frontmatter = [
      "---",
      `title: "${escapeYaml(title)}",`,
      `description: "${escapeYaml(description)}",`,
      "generated: true",
      `source_repo: "${config.sourceRepo}",`,
      `source_path: "docs/${filename}",`,
      `source_commit: "${config.sourceCommit}"`,
      "---",
      ""
    ].join("\n");

    const header = generatedHeaderBlock({
      sourceRepo: config.sourceRepo,
      sourcePath: `docs/${filename}`,
      sourceCommit: config.sourceCommit
    });

    const generated = `${frontmatter}${header}\n${body}`;

    await fs.writeFile(outputPath, generated, "utf8");

    manifestEntries.push({
      product: config.product,
      sourceRepo: config.sourceRepo,
      sourcePath: `docs/${filename}`,
      targetPath: `${config.product}/${outputFilename}`,
      sourceCommit: config.sourceCommit,
      title
    });
  }

  return manifestEntries;
}

async function main() {
  await fs.mkdir(path.join(root, "generated"), { recursive: true });
  const manifest = {
    generatedAt: new Date().toISOString(),
    sources: []
  };

  for (const product of products) {
    const entries = await syncProduct(product);
    manifest.sources.push(...entries);
  }

  await fs.writeFile(
    path.join(root, "generated", "docs-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8"
  );

  console.log(`Synced ${manifest.sources.length} docs across ${products.length} products`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
