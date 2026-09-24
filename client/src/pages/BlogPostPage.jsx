import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHero from "../components/ui/PageHero.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

const formatDate = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const renderContent = (content) => {
  if (!content) {
    return (
      <p className="blog-post-empty">
        This article does not have any content yet.
      </p>
    );
  }

  const lines = String(content).replace(/\r\n/g, "\n").split("\n");

  const elements = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length === 0) return;

    elements.push(
      <ul key={`list-${elements.length}`} className="blog-post-list">
        {listItems.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>,
    );

    listItems = [];
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      return;
    }

    if (line.startsWith("### ")) {
      flushList();

      elements.push(<h3 key={`heading-3-${index}`}>{line.slice(4)}</h3>);

      return;
    }

    if (line.startsWith("## ")) {
      flushList();

      elements.push(<h2 key={`heading-2-${index}`}>{line.slice(3)}</h2>);

      return;
    }

    if (line.startsWith("# ")) {
      flushList();

      elements.push(<h2 key={`heading-1-${index}`}>{line.slice(2)}</h2>);

      return;
    }

    if (line.startsWith("- ")) {
      listItems.push(line.slice(2));
      return;
    }

    flushList();

    elements.push(<p key={`paragraph-${index}`}>{line}</p>);
  });

  flushList();

  return elements;
};

const BlogPostPage = () => {
  const { slug } = useParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useDocumentTitle(
    post?.title ? `${post.title} | Rohit Kumar` : "Blog | Rohit Kumar",
  );

  useEffect(() => {
    const loadBlogPost = async () => {
      try {
        setLoading(true);
        setError("");
        setPost(null);

        const response = await fetch(
          `/api/blogs/slug/${encodeURIComponent(slug)}`,
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.message || "Unable to load this blog post.");
        }

        setPost(data);
      } catch (err) {
        console.error("Blog post loading error:", err);
        setError(err.message || "Unable to load this blog post right now.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadBlogPost();
    }
  }, [slug]);

  const content = useMemo(() => {
    return renderContent(post?.content);
  }, [post?.content]);

  if (loading) {
    return (
      <>
        <PageHero
          eyebrow="BLOG"
          title="Loading Article..."
          description="Please wait while the article is being loaded."
        />

        <section className="section">
          <div className="container">
            <div className="blog-empty">
              <h3>Loading article...</h3>
              <p>Please wait while we load the article from the database.</p>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <PageHero
          eyebrow="BLOG"
          title="Article Not Found"
          description="The requested blog article could not be loaded."
        />

        <section className="section">
          <div className="container">
            <div className="blog-empty">
              <h3>Unable to open this article</h3>

              <p>
                {error ||
                  "This article may have been unpublished or may no longer exist."}
              </p>

              <Link className="blog-featured-link" to="/blog">
                ← Back to Blog
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        eyebrow={post.category || "BLOG"}
        title={post.title}
        description={post.excerpt}
      />

      <section className="section">
        <div className="container">
          <article className="blog-post">
            <div className="blog-post-header">
              <div className="blog-card-meta">
                <span>{post.category}</span>
                <span>{post.readTime || "5 min read"}</span>
                {post.publishedAt && (
                  <span>{formatDate(post.publishedAt)}</span>
                )}
              </div>

              <div className="blog-card-tags">
                {(Array.isArray(post.tags) ? post.tags : []).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>

            <div className="blog-post-content">{content}</div>

            <div className="blog-post-content">{content}</div>

            <div className="blog-post-footer">
              <div>
                <strong>Written by</strong>
                <span>{post.author || "Rohit Kumar"}</span>
              </div>

              <Link to="/blog">← Back to all articles</Link>
            </div>
          </article>
        </div>
      </section>
    </>
  );
};

export default BlogPostPage;
