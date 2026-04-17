import type { Metadata } from "next";
import Link from "next/link";
import { ClientLayout } from "@/components/ClientLayout";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { getAllBlogPosts } from "@/content/blog";
import { AGENCY_NAME } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: `Blog | ${AGENCY_NAME}`,
  description: `Insights on custom software, SaaS replacement, AI automation, and code ownership for mid-market companies.`,
};

export default async function BlogIndex() {
  const posts = await getAllBlogPosts();

  return (
    <ClientLayout>
      <Nav />
      <main className="pt-32 pb-20" style={{ backgroundColor: "#EBFFF6" }}>
        <div className="u-container max-w-4xl">
          <p className="eyebrow text-brand mb-4">Blog</p>
          <h1 className="font-sans font-medium text-fluid-h2 leading-[1.1] text-dark mb-4">
            Insights & Resources
          </h1>
          <p className="font-sans text-fluid-main text-dark opacity-60 leading-relaxed mb-16 max-w-[55ch]">
            Strategies for replacing SaaS, building custom software, and owning your technology stack.
          </p>

          {posts.length === 0 ? (
            <p className="font-sans text-fluid-main text-dark opacity-40">
              New articles coming soon. Check back shortly.
            </p>
          ) : (
            <div className="space-y-8">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block group p-8 rounded-sm bg-white transition-all hover:shadow-lg"
                  style={{ transitionDuration: "0.3s" }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-mono text-xs uppercase tracking-wider text-brand">
                      {post.category}
                    </span>
                    <span className="font-mono text-xs text-dark opacity-30">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="font-mono text-xs text-dark opacity-30">
                      {post.readingTime} min read
                    </span>
                  </div>
                  <h2 className="font-sans font-medium text-fluid-h4 leading-[1.2] text-dark mb-3 group-hover:text-brand transition-colors">
                    {post.title}
                  </h2>
                  <p className="font-sans text-fluid-main text-dark opacity-60 leading-relaxed">
                    {post.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-16">
            <Link
              href="/"
              className="font-sans text-fluid-main text-brand hover:opacity-70 transition-opacity"
            >
              &larr; Back to home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </ClientLayout>
  );
}
