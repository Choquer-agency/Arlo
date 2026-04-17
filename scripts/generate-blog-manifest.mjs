/**
 * Pre-build script: scans all blog markdown files and writes a JSON manifest
 * with slug, region, date, and modifiedDate for each post.
 * This manifest is imported by sitemap.ts so it doesn't need fs at runtime.
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDir = path.join(process.cwd(), "src/content/blog/posts");
const outFile = path.join(process.cwd(), "src/content/blog/manifest.json");

const manifest = [];

if (fs.existsSync(postsDir)) {
  const regionDirs = fs.readdirSync(postsDir);
  for (const dir of regionDirs) {
    const regionPath = path.join(postsDir, dir);
    if (!fs.statSync(regionPath).isDirectory()) continue;

    const mdFiles = fs.readdirSync(regionPath).filter((f) => f.endsWith(".md"));
    for (const file of mdFiles) {
      const filePath = path.join(regionPath, file);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data } = matter(fileContents);

      manifest.push({
        slug: data.slug,
        region: data.region,
        date: data.date,
        modifiedDate: data.modifiedDate || data.date,
      });
    }
  }
}

manifest.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

fs.writeFileSync(outFile, JSON.stringify(manifest, null, 2));
console.log(`Blog manifest: ${manifest.length} posts written to ${outFile}`);
