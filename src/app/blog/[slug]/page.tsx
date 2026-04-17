import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientLayout } from "@/components/ClientLayout";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { getBlogPostBySlug, getAllBlogPosts } from "@/content/blog";
import { AGENCY_NAME, SITE_URL } from "@/lib/siteConfig";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Not Found" };

  return {
    title: `${post.title} | ${AGENCY_NAME}`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
      siteName: AGENCY_NAME,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.modifiedDate,
      authors: [post.author.name],
    },
    alternates: {
      canonical: `${SITE_URL}/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = await getAllBlogPosts();
  const relatedPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  const blogPostSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.modifiedDate,
    wordCount: post.wordCount,
    url: `${SITE_URL}/blog/${post.slug}`,
    author: {
      "@type": "Person",
      "@id": `${SITE_URL}/#founder`,
      name: post.author.name,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#business`,
      name: AGENCY_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
  };

  return (
    <ClientLayout>
      <Nav />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostSchema) }}
      />
      <main className="pt-32 pb-20">
        <article className="u-container max-w-3xl">
          <nav className="mb-8">
            <ol className="flex items-center gap-2 font-mono text-xs text-dark opacity-40">
              <li><Link href="/" className="hover:text-brand transition-colors">Home</Link></li>
              <li>/</li>
              <li><Link href="/blog" className="hover:text-brand transition-colors">Blog</Link></li>
              <li>/</li>
              <li className="opacity-60 truncate max-w-[30ch]">{post.title}</li>
            </ol>
          </nav>

          <header className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-xs uppercase tracking-wider text-brand">{post.category}</span>
              <span className="font-mono text-xs text-dark opacity-30">{post.readingTime} min read</span>
            </div>
            <h1 className="font-sans font-medium text-fluid-h2 leading-[1.1] text-dark mb-6">{post.title}</h1>
            <p className="font-sans text-fluid-large text-dark opacity-60 leading-relaxed mb-8">{post.excerpt}</p>
            <div className="flex items-center gap-4 pt-6 border-t border-dark-faded">
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
                <span className="font-sans font-medium text-sm text-brand">{post.author.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-sans font-medium text-sm text-dark">{post.author.name}</p>
                <p className="font-sans text-xs text-dark opacity-40">
                  Published {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  {post.modifiedDate !== post.date && (
                    <> · Updated {new Date(post.modifiedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</>
                  )}
                </p>
              </div>
            </div>
          </header>

          <div
            className="prose prose-lg max-w-none
              prose-headings:font-sans prose-headings:font-medium prose-headings:text-dark
              prose-p:font-sans prose-p:text-dark prose-p:opacity-70 prose-p:leading-relaxed
              prose-a:text-brand prose-a:no-underline hover:prose-a:underline
              prose-strong:text-dark prose-strong:opacity-90
              prose-ul:text-dark prose-ul:opacity-70
              prose-ol:text-dark prose-ol:opacity-70
              prose-blockquote:border-brand prose-blockquote:text-dark prose-blockquote:opacity-60
              prose-h2:text-fluid-h4 prose-h2:mt-12 prose-h2:mb-4
              prose-h3:text-fluid-h5 prose-h3:mt-8 prose-h3:mb-3"
            dangerouslySetInnerHTML={{ __html: post.htmlContent }}
          />

          <div className="mt-16 p-8 rounded-sm" style={{ backgroundColor: "#EBFFF6" }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
                <span className="font-sans font-medium text-brand">{post.author.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-sans font-medium text-dark mb-1">Written by {post.author.name}</p>
                <p className="font-sans text-sm text-dark opacity-50 mb-1">{post.author.role}</p>
                <p className="font-sans text-sm text-dark opacity-60 leading-relaxed">{post.author.bio}</p>
              </div>
            </div>
          </div>

          {relatedPosts.length > 0 && (
            <div className="mt-16">
              <h2 className="font-sans font-medium text-fluid-h4 text-dark mb-8">More articles</h2>
              <div className="space-y-4">
                {relatedPosts.map((rp) => (
                  <Link key={rp.slug} href={`/blog/${rp.slug}`} className="block group p-6 rounded-sm border border-dark-faded hover:border-brand transition-colors">
                    <p className="font-sans font-medium text-dark group-hover:text-brand transition-colors mb-1">{rp.title}</p>
                    <p className="font-sans text-sm text-dark opacity-40">
                      {new Date(rp.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {rp.readingTime} min read
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-16">
            <Link href="/blog" className="font-sans text-fluid-main text-brand hover:opacity-70 transition-opacity">&larr; All articles</Link>
          </div>
        </article>
      </main>
      <Footer />
    </ClientLayout>
  );
}
