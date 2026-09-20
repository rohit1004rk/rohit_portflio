import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
    month: "short",
    year: "numeric",
  });
};

const BlogPage = () => {
  useDocumentTitle("Blog | Rohit Kumar");

  const [blogPosts, setBlogPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setLoading(true);
        setError("");

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

        setBlogPosts(posts);
      } catch (err) {
        console.error("Blog loading error:", err);
        setError("Unable to load blog posts right now.");
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(blogPosts.map((post) => post.category).filter(Boolean)),
    ];
  }, [blogPosts]);

  const featuredPost =
    blogPosts.find((post) => post.featured === true) || blogPosts[0];

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return blogPosts.filter((post) => {
      const matchesCategory =
        activeCategory === "All" || post.category === activeCategory;

      const tags = Array.isArray(post.tags) ? post.tags : [];

      const matchesSearch =
        !query ||
        String(post.title || "")
          .toLowerCase()
          .includes(query) ||
        String(post.excerpt || "")
          .toLowerCase()
          .includes(query) ||
        tags.some((tag) => String(tag).toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [blogPosts, search, activeCategory]);

  const regularPosts = filteredPosts.filter(
    (post) => post._id !== featuredPost?._id,
  );

  return (
    <>
      <PageHero
        eyebrow="BLOG"
        title="Ideas, Knowledge & Experiences"
        description="Articles about web development, programming, MERN stack, React, JavaScript and my journey as a developer."
      />

      <section className="section blog-page-section">
        <div className="container">
          {loading && (
            <div className="blog-empty">
              <h3>Loading articles...</h3>
              <p>Please wait while the latest posts are loaded.</p>
            </div>
          )}

          {!loading && error && (
            <div className="blog-empty">
              <h3>Unable to load blog</h3>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && blogPosts.length > 0 && (
            <>
              {/* Featured Article */}

              {featuredPost && (
                <article className="blog-featured">
                  <div className="blog-featured-content">
                    <div className="blog-featured-label">FEATURED ARTICLE</div>

                    <div className="blog-card-meta">
                      {featuredPost.category && (
                        <span>{featuredPost.category}</span>
                      )}

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

              {/* Search + Categories */}

              <div className="blog-toolbar">
                <div className="blog-search">
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search articles..."
                    aria-label="Search articles"
                  />
                </div>

                <div className="blog-categories">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className={activeCategory === category ? "active" : ""}
                      onClick={() => setActiveCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Article Count */}

              <div className="blog-results-bar">
                <span>
                  {filteredPosts.length}{" "}
                  {filteredPosts.length === 1 ? "article" : "articles"}
                </span>

                {(search || activeCategory !== "All") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setActiveCategory("All");
                    }}
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {/* Blog Cards */}

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

              {filteredPosts.length === 0 && (
                <div className="blog-empty">
                  <h3>No articles found</h3>
                  <p>Try a different search term or select another category.</p>
                </div>
              )}
            </>
          )}

          {!loading && !error && blogPosts.length === 0 && (
            <div className="blog-empty">
              <h3>No blog posts published yet</h3>
              <p>
                New articles will appear here once they are published from the
                Admin Dashboard.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default BlogPage;
