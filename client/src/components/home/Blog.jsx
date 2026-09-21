import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const formatDate = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function Blog() {
  console.log("BLOG COMPONENT MOUNTED");
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadBlogs = async () => {
      try {
        const response = await fetch("/api/blogs");
        const data = await response.json().catch(() => []);

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load blog posts.");
        }

        const posts = Array.isArray(data)
          ? data
          : Array.isArray(data?.blogs)
            ? data.blogs
            : [];

        if (mounted) {
          setBlogPosts(posts);
          console.log("BLOG POSTS RECEIVED:", posts);
        }
      } catch (error) {
        console.error("Homepage blog loading error:", error);

        if (mounted) {
          setBlogPosts([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadBlogs();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="section blog-home-section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">BLOG</span>
            <h2>Latest Articles</h2>
            <p className="lead">
              Thoughts, tutorials and experiences from my development journey.
            </p>
          </div>

          <div className="blog-empty">
            <h3>Loading articles...</h3>
            <p>Please wait while the latest posts are loaded.</p>
          </div>
        </div>
      </section>
    );
  }

  if (blogPosts.length === 0) {
    return null;
  }

  const featuredPost =
    blogPosts.find((post) => post.featured === true) || blogPosts[0];

  const regularPosts = blogPosts
    .filter((post) => post._id !== featuredPost?._id)
    .slice(0, 3);

  return (
    <section className="section blog-home-section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">BLOG</span>

          <h2>Latest Articles</h2>

          <p className="lead">
            Thoughts, tutorials and experiences from my development journey.
          </p>
        </div>

        {featuredPost && (
          <article className="blog-featured">
            <div className="blog-featured-content">
              <div className="blog-featured-label">FEATURED ARTICLE</div>

              <div className="blog-card-meta">
                {featuredPost.category && <span>{featuredPost.category}</span>}

                <span>{featuredPost.readTime || "5 min read"}</span>

                {featuredPost.publishedAt && (
                  <span>{formatDate(featuredPost.publishedAt)}</span>
                )}
              </div>

              <h2>{featuredPost.title}</h2>

              <p>{featuredPost.excerpt}</p>

              {Array.isArray(featuredPost.tags) &&
                featuredPost.tags.length > 0 && (
                  <div className="blog-card-tags">
                    {featuredPost.tags.slice(0, 4).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                )}

              <Link
                className="blog-featured-link"
                to={`/blog/${featuredPost.slug}`}
              >
                Read Article →
              </Link>
            </div>
          </article>
        )}

        {regularPosts.length > 0 && (
          <div className="blog-grid">
            {regularPosts.map((post) => (
              <article className="blog-card" key={post._id || post.slug}>
                <div className="blog-card-content">
                  <div className="blog-card-meta">
                    {post.category && <span>{post.category}</span>}

                    <span>{post.readTime || "5 min read"}</span>

                    {post.publishedAt && (
                      <span>{formatDate(post.publishedAt)}</span>
                    )}
                  </div>

                  <h2>{post.title}</h2>

                  <p>{post.excerpt}</p>

                  {Array.isArray(post.tags) && post.tags.length > 0 && (
                    <div className="blog-card-tags">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="blog-card-footer">
                    <span>{formatDate(post.publishedAt)}</span>

                    <Link to={`/blog/${post.slug}`}>Read Article →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div
          style={{
            marginTop: "var(--space-10)",
            textAlign: "center",
          }}
        >
          <Link to="/blog" className="btn btn-primary">
            View All Articles
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Blog;
