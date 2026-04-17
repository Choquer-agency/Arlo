import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

/* ─── Types ─── */

export interface AuthorProfile {
  name: string;
  role: string;
  bio: string;
  image: string;
  socials: {
    linkedin?: string;
    twitter?: string;
  };
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  htmlContent: string;
  author: AuthorProfile;
  date: string;
  modifiedDate: string;
  region: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  readingTime: number;
  wordCount: number;
}

/* ─── Authors ─── */

export const authors: Record<string, AuthorProfile> = {
  bryce: {
    name: "Bryce Choquer",
    role: "Founder",
    bio: "Bryce Choquer is the founder of ARLO, a Claude Desktop connector that lets agencies query every client's analytics, ads, and marketing platforms in plain English. Previously built Choquer Agency's internal MCP that now handles live queries across GA4, Search Console, Google Ads, YouTube, and Google Business Profile for dozens of SMB clients.",
    image: "/images/authors/bryce.jpg",
    socials: {
      linkedin: "https://linkedin.com/in/brycechoquer",
    },
  },
};

/* ─── Helpers ─── */

const postsDirectory = path.join(process.cwd(), "src/content/blog/posts");

function getReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function getWordCount(content: string): number {
  return content.trim().split(/\s+/).length;
}

async function parsePost(filePath: string): Promise<BlogPost> {
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  const processed = await remark().use(html).process(content);
  const htmlContent = processed.toString();

  const author = authors[data.author as string] || authors.bryce;

  return {
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    htmlContent,
    author,
    date: data.date,
    modifiedDate: data.modifiedDate || data.date,
    region: data.region,
    category: data.category || "AI Development",
    tags: data.tags || [],
    featuredImage: data.featuredImage,
    readingTime: getReadingTime(content),
    wordCount: getWordCount(content),
  };
}

function getAllMarkdownFiles(): string[] {
  const files: string[] = [];

  if (!fs.existsSync(postsDirectory)) return files;

  const regionDirs = fs.readdirSync(postsDirectory);
  for (const dir of regionDirs) {
    const regionPath = path.join(postsDirectory, dir);
    if (!fs.statSync(regionPath).isDirectory()) continue;

    const mdFiles = fs.readdirSync(regionPath).filter((f) => f.endsWith(".md"));
    for (const file of mdFiles) {
      files.push(path.join(regionPath, file));
    }
  }

  return files;
}

/* ─── Public API ─── */

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const files = getAllMarkdownFiles();
  const posts = await Promise.all(files.map(parsePost));
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getBlogPostsByRegion(region: string): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts();
  return allPosts.filter((post) => post.region === region);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const allPosts = await getAllBlogPosts();
  return allPosts.find((post) => post.slug === slug) || null;
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const allPosts = await getAllBlogPosts();
  return allPosts.map((post) => post.slug);
}
