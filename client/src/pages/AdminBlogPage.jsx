import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";

const emptyBlog = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  author: "Rohit Kumar",
  category: "",
  tags: "",
  readTime: "5 min read",
  thumbnail: "",
  order: 0,
  enabled: true,
  published: true,
  featured: false,
};

const text = (value) => (value == null ? "" : String(value).trim());

const formText = (value) => {
  if (value == null) return "";
  if (Array.isArray(value))
    return value.map((item) => String(item ?? "")).join(", ");
  return String(value);
};

const normalize = (items) =>
  [...(Array.isArray(items) ? items : [])].sort((a, b) => {
    const ao = Number.isFinite(Number(a?.order)) ? Number(a.order) : 0;
    const bo = Number.isFinite(Number(b?.order)) ? Number(b.order) : 0;
    if (ao !== bo) return ao - bo;
    return (
      new Date(a?.createdAt || 0).getTime() -
      new Date(b?.createdAt || 0).getTime()
    );
  });

const date = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

function AdminBlogPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");
  const menuRef = useRef(null);

  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState({ ...emptyBlog });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [featured, setFeatured] = useState("all");
  const [openMenu, setOpenMenu] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    loadBlogs();
  }, [token, navigate]);

  useEffect(() => {
    const close = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpenMenu(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const authFailure = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/blogs/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401 || response.status === 403) {
        authFailure();
        return;
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.message || "Failed to load blog posts.");

      setBlogs(normalize(Array.isArray(data) ? data : data.blogs || []));
    } catch (err) {
      setError(err.message || "Could not load blog posts.");
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(
    () =>
      [
        ...new Set(blogs.map((blog) => text(blog.category)).filter(Boolean)),
      ].sort((a, b) => a.localeCompare(b)),
    [blogs],
  );

  const filteredBlogs = useMemo(() => {
    const q = text(search).toLowerCase();

    return blogs.filter((blog) => {
      const searchable = [
        blog.title,
        blog.slug,
        blog.excerpt,
        blog.author,
        blog.category,
        Array.isArray(blog.tags) ? blog.tags.join(" ") : blog.tags,
      ]
        .map(text)
        .join(" ")
        .toLowerCase();

      const searchOK = !q || searchable.includes(q);
      const categoryOK = category === "all" || text(blog.category) === category;
      const statusOK =
        status === "all" ||
        (status === "published" && blog.published !== false) ||
        (status === "draft" && blog.published === false) ||
        (status === "enabled" && blog.enabled !== false) ||
        (status === "disabled" && blog.enabled === false);
      const featuredOK =
        featured === "all" ||
        (featured === "featured" && blog.featured === true) ||
        (featured === "normal" && blog.featured !== true);

      return searchOK && categoryOK && statusOK && featuredOK;
    });
  }, [blogs, search, category, status, featured]);

  const hasFilters =
    Boolean(search) ||
    category !== "all" ||
    status !== "all" ||
    featured !== "all";

  const updateForm = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm({ ...emptyBlog });
    setEditingId(null);
    setError("");
  };

  const editBlog = (blog) => {
    setEditingId(blog._id);
    setForm({
      title: formText(blog.title),
      slug: formText(blog.slug),
      excerpt: formText(blog.excerpt),
      content: formText(blog.content),
      author: formText(blog.author) || "Rohit Kumar",
      category: formText(blog.category),
      tags: Array.isArray(blog.tags)
        ? blog.tags.join(", ")
        : formText(blog.tags),
      readTime: formText(blog.readTime) || "5 min read",
      thumbnail: formText(blog.thumbnail),
      order: Number(blog.order) || 0,
      enabled: blog.enabled !== false,
      published: blog.published !== false,
      featured: Boolean(blog.featured),
    });
    setOpenMenu(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveBlog = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (
      !text(form.title) ||
      !text(form.slug) ||
      !text(form.excerpt) ||
      !text(form.content) ||
      !text(form.category)
    ) {
      setError("Title, slug, excerpt, content and category are required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: text(form.title),
        slug: text(form.slug).toLowerCase().replace(/\s+/g, "-"),
        excerpt: text(form.excerpt),
        content: text(form.content),
        author: text(form.author) || "Rohit Kumar",
        category: text(form.category),
        tags: text(form.tags)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        readTime: text(form.readTime) || "5 min read",
        thumbnail: text(form.thumbnail),
        order: Math.max(0, Number(form.order) || 0),
        enabled: Boolean(form.enabled),
        published: Boolean(form.published),
        featured: Boolean(form.featured),
      };

      const response = await fetch(
        editingId ? `/api/blogs/${editingId}` : "/api/blogs",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (response.status === 401 || response.status === 403) {
        authFailure();
        return;
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.message || "Failed to save blog post.");

      const wasEditing = Boolean(editingId);
      resetForm();
      await loadBlogs();
      setSuccess(
        wasEditing
          ? "Blog updated successfully."
          : "Blog created successfully.",
      );
    } catch (err) {
      setError(err.message || "Failed to save blog post.");
    } finally {
      setSaving(false);
    }
  };

  const patchBlog = async (blog, payload, message) => {
    try {
      setBusy(true);
      setError("");
      const response = await fetch(`/api/blogs/${blog._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401 || response.status === 403) {
        authFailure();
        return;
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Update failed.");

      setBlogs((current) =>
        normalize(
          current.map((item) =>
            item._id === blog._id
              ? { ...item, ...(data.blog || payload) }
              : item,
          ),
        ),
      );
      setOpenMenu(null);
      setSuccess(message);
    } catch (err) {
      setError(err.message || "Could not update blog.");
    } finally {
      setBusy(false);
    }
  };

  const duplicateBlog = async (blog) => {
    if (!window.confirm(`Duplicate "${blog.title || "this blog"}" as a draft?`))
      return;

    try {
      setBusy(true);
      const response = await fetch(`/api/blogs/${blog._id}/duplicate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401 || response.status === 403) {
        authFailure();
        return;
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Duplicate failed.");

      await loadBlogs();
      setOpenMenu(null);
      setSuccess("Blog duplicated as a draft.");
    } catch (err) {
      setError(err.message || "Could not duplicate blog.");
    } finally {
      setBusy(false);
    }
  };

  const deleteBlog = async (blog) => {
    if (
      !window.confirm(
        `Delete "${blog.title || "this blog"}"?\n\nThis action cannot be undone.`,
      )
    )
      return;

    try {
      setBusy(true);
      const response = await fetch(`/api/blogs/${blog._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401 || response.status === 403) {
        authFailure();
        return;
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Delete failed.");

      setBlogs((current) => current.filter((item) => item._id !== blog._id));
      if (editingId === blog._id) resetForm();
      setOpenMenu(null);
      setSuccess("Blog deleted successfully.");
    } catch (err) {
      setError(err.message || "Could not delete blog.");
    } finally {
      setBusy(false);
    }
  };

  const reorder = async (ordered) => {
    const normalized = ordered.map((blog, index) => ({
      ...blog,
      order: index + 1,
    }));
    setBlogs(normalized);

    try {
      setBusy(true);
      const response = await fetch("/api/blogs/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orders: normalized.map((blog, index) => ({
            id: blog._id,
            order: index + 1,
          })),
        }),
      });

      if (response.status === 401 || response.status === 403) {
        authFailure();
        return;
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.message || "Could not save order.");

      if (Array.isArray(data.blogs)) setBlogs(normalize(data.blogs));
      setSuccess("Blog order saved.");
    } catch (err) {
      setError(err.message || "Could not save blog order.");
      await loadBlogs();
    } finally {
      setBusy(false);
    }
  };

  const dropBlog = (targetId) => {
    if (!dragId || dragId === targetId || hasFilters) return;

    const from = blogs.findIndex((blog) => blog._id === dragId);
    const to = blogs.findIndex((blog) => blog._id === targetId);
    if (from < 0 || to < 0) return;

    const next = [...blogs];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);

    setDragId(null);
    setDragOverId(null);
    reorder(next);
  };

  const viewBlog = (blog) => {
    if (!blog?.slug) return;
    window.open(
      `/blog/${encodeURIComponent(blog.slug)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setOpenMenu(null);
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="blog-loading">
          <span />
          Loading Blog Management...
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <div className="admin-blog-shell">
        <AdminSidebar onLogout={logout} />

        <main className="admin-blog-main">
          <div className="admin-blog-content">
            <header className="blog-topbar">
              <div>
                <div className="eyebrow">ADMIN / BLOG</div>
                <h1>Blog Management</h1>
                <p>Organize, publish and maintain your articles.</p>
              </div>
              <button
                className="ghost-btn"
                type="button"
                onClick={() => navigate("/admin")}
              >
                ← Dashboard
              </button>
            </header>

            {(error || success) && (
              <div
                className={`notice ${error ? "notice-error" : "notice-success"}`}
              >
                <span>{error ? "!" : "✓"}</span>
                <div>{error || success}</div>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setSuccess("");
                  }}
                >
                  ×
                </button>
              </div>
            )}

            <section className="editor-card">
              <div className="section-head">
                <div>
                  <span className="section-kicker">
                    {editingId ? "EDIT ARTICLE" : "NEW ARTICLE"}
                  </span>
                  <h2>{editingId ? "Update Blog Post" : "Create Blog Post"}</h2>
                </div>
                {editingId && (
                  <button
                    type="button"
                    className="small-ghost"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={saveBlog}>
                <div className="compact-grid">
                  <label>
                    Title *
                    <input
                      name="title"
                      value={form.title}
                      onChange={updateForm}
                      placeholder="Enter article title"
                    />
                  </label>
                  <label>
                    Slug *
                    <input
                      name="slug"
                      value={form.slug}
                      onChange={updateForm}
                      placeholder="article-slug"
                    />
                  </label>
                  <label>
                    Category *
                    <input
                      name="category"
                      value={form.category}
                      onChange={updateForm}
                      placeholder="React / AI / JavaScript"
                    />
                  </label>
                  <label>
                    Author
                    <input
                      name="author"
                      value={form.author}
                      onChange={updateForm}
                      placeholder="Rohit Kumar"
                    />
                  </label>
                  <label>
                    Read time
                    <input
                      name="readTime"
                      value={form.readTime}
                      onChange={updateForm}
                      placeholder="5 min read"
                    />
                  </label>
                  <label>
                    Position
                    <input
                      name="order"
                      type="number"
                      min="0"
                      value={form.order}
                      onChange={updateForm}
                    />
                  </label>
                  <label className="wide">
                    Tags
                    <input
                      name="tags"
                      value={form.tags}
                      onChange={updateForm}
                      placeholder="React, Frontend, JavaScript"
                    />
                  </label>
                  <label className="wide">
                    Thumbnail URL
                    <input
                      name="thumbnail"
                      value={form.thumbnail}
                      onChange={updateForm}
                      placeholder="https://..."
                    />
                  </label>
                  <label className="wide">
                    Excerpt *
                    <textarea
                      name="excerpt"
                      value={form.excerpt}
                      onChange={updateForm}
                      rows="3"
                      placeholder="Short article summary..."
                    />
                  </label>
                  <label className="wide">
                    Content *
                    <textarea
                      name="content"
                      value={form.content}
                      onChange={updateForm}
                      rows="7"
                      placeholder="Write the complete article..."
                    />
                  </label>
                </div>

                <div className="toggles">
                  <label>
                    <input
                      type="checkbox"
                      name="published"
                      checked={form.published}
                      onChange={updateForm}
                    />
                    <span />
                    Published
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="enabled"
                      checked={form.enabled}
                      onChange={updateForm}
                    />
                    <span />
                    Enabled
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="featured"
                      checked={form.featured}
                      onChange={updateForm}
                    />
                    <span />
                    Featured
                  </label>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={resetForm}
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="primary-btn"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Update Blog"
                        : "Create Blog"}
                  </button>
                </div>
              </form>
            </section>

            <section className="posts-card">
              <div className="posts-head">
                <div>
                  <span className="section-kicker">CONTENT LIBRARY</span>
                  <h2>
                    Blog Posts <b>{blogs.length}</b>
                  </h2>
                </div>
                <div className="drag-help">↕ Drag rows to reorder</div>
              </div>

              <div className="filters">
                <div className="search-box">
                  <span>⌕</span>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search articles..."
                  />
                </div>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option value="all">All categories</option>
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  <option value="all">All status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </select>
                <select
                  value={featured}
                  onChange={(event) => setFeatured(event.target.value)}
                >
                  <option value="all">All featured</option>
                  <option value="featured">Featured</option>
                  <option value="normal">Not featured</option>
                </select>
                {hasFilters && (
                  <button
                    type="button"
                    className="clear-btn"
                    onClick={() => {
                      setSearch("");
                      setCategory("all");
                      setStatus("all");
                      setFeatured("all");
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>

              {hasFilters && (
                <div className="filter-note">
                  Clear filters to drag and reorder the complete list.
                </div>
              )}

              <div className="post-list">
                {filteredBlogs.length === 0 ? (
                  <div className="empty">No matching blog posts.</div>
                ) : (
                  filteredBlogs.map((blog) => {
                    const position =
                      blogs.findIndex((item) => item._id === blog._id) + 1;
                    const menuOpen = openMenu === blog._id;

                    return (
                      <article
                        key={blog._id}
                        className={`post-row ${dragOverId === blog._id ? "drag-over" : ""} ${dragId === blog._id ? "dragging" : ""}`}
                        draggable={!hasFilters && !busy}
                        onDragStart={() => !hasFilters && setDragId(blog._id)}
                        onDragOver={(event) => {
                          if (!hasFilters) {
                            event.preventDefault();
                            setDragOverId(blog._id);
                          }
                        }}
                        onDragLeave={() => setDragOverId(null)}
                        onDrop={(event) => {
                          event.preventDefault();
                          dropBlog(blog._id);
                        }}
                        onDragEnd={() => {
                          setDragId(null);
                          setDragOverId(null);
                        }}
                      >
                        <div
                          className="drag-handle"
                          title={
                            hasFilters
                              ? "Clear filters to reorder"
                              : "Drag to reorder"
                          }
                        >
                          ⋮⋮
                        </div>

                        <div className="position">
                          {String(position).padStart(2, "0")}
                        </div>

                        <div className="thumb">
                          {blog.thumbnail ? (
                            <img src={blog.thumbnail} alt="" />
                          ) : (
                            <span>✦</span>
                          )}
                        </div>

                        <div className="post-main">
                          <div className="post-title-line">
                            <h3>{blog.title || "Untitled Blog"}</h3>
                            {blog.featured && (
                              <span className="featured-badge">★ Featured</span>
                            )}
                          </div>
                          <p>{blog.excerpt || "No excerpt available."}</p>
                          <div className="post-meta">
                            <span>{blog.category || "Uncategorized"}</span>
                            <i />
                            <span>{blog.readTime || "5 min read"}</span>
                            <i />
                            <span>Updated {date(blog.updatedAt)}</span>
                          </div>
                        </div>

                        <div className="status-area">
                          <span
                            className={`status-dot ${blog.published === false ? "draft" : ""}`}
                          >
                            {blog.published === false ? "Draft" : "Published"}
                          </span>
                          <span
                            className={`enabled-label ${blog.enabled === false ? "disabled" : ""}`}
                          >
                            {blog.enabled === false ? "Disabled" : "Enabled"}
                          </span>
                        </div>

                        <div
                          className="row-menu-wrap"
                          ref={menuOpen ? menuRef : null}
                        >
                          <button
                            type="button"
                            className="dots-btn"
                            aria-label={`Actions for ${blog.title}`}
                            aria-expanded={menuOpen}
                            onClick={() =>
                              setOpenMenu(menuOpen ? null : blog._id)
                            }
                          >
                            ⋮
                          </button>

                          {menuOpen && (
                            <div className="action-menu">
                              <button
                                type="button"
                                onClick={() => editBlog(blog)}
                              >
                                ✎ <span>Edit / Update</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => viewBlog(blog)}
                                disabled={!blog.slug}
                              >
                                ↗ <span>View Article</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => duplicateBlog(blog)}
                              >
                                ⧉ <span>Duplicate</span>
                              </button>
                              <div />
                              <button
                                type="button"
                                onClick={() =>
                                  patchBlog(
                                    blog,
                                    { published: blog.published === false },
                                    blog.published === false
                                      ? "Blog published."
                                      : "Blog unpublished.",
                                  )
                                }
                              >
                                {blog.published === false ? "●" : "○"}{" "}
                                <span>
                                  {blog.published === false
                                    ? "Publish"
                                    : "Unpublish"}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  patchBlog(
                                    blog,
                                    { enabled: blog.enabled === false },
                                    blog.enabled === false
                                      ? "Blog enabled."
                                      : "Blog disabled.",
                                  )
                                }
                              >
                                {blog.enabled === false ? "◉" : "⊘"}{" "}
                                <span>
                                  {blog.enabled === false
                                    ? "Enable"
                                    : "Disable"}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  patchBlog(
                                    blog,
                                    { featured: !blog.featured },
                                    blog.featured
                                      ? "Removed from featured."
                                      : "Marked as featured.",
                                  )
                                }
                              >
                                ★{" "}
                                <span>
                                  {blog.featured
                                    ? "Remove Featured"
                                    : "Make Featured"}
                                </span>
                              </button>
                              <div />
                              <button
                                className="danger-item"
                                type="button"
                                onClick={() => deleteBlog(blog)}
                              >
                                ⌫ <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })
                )}
              </div>

              <div className="posts-footer">
                <span>
                  {filteredBlogs.length} of {blogs.length} posts
                </span>
                <span>
                  {busy ? "Saving..." : "Changes are saved to MongoDB"}
                </span>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}

const styles = `
  * { box-sizing: border-box; }

  .admin-blog-shell {
    min-height: 100vh;
    background:
      radial-gradient(circle at 88% 0%, rgba(45,212,191,.045), transparent 28%),
      #090e14;
    color: #e5edf5;
  }

  .admin-blog-main {
    min-height: 100vh;
    margin-left: 250px;
  }

  .admin-blog-content {
    width: min(1320px, calc(100% - 36px));
    margin: auto;
    padding: 28px 0 55px;
  }

  .blog-topbar {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 18px;
  }

  .eyebrow,
  .section-kicker {
    color: #64748b;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .14em;
  }

  .blog-topbar h1 {
    margin: 6px 0 0;
    font-size: clamp(28px, 3vw, 38px);
    line-height: 1.1;
    letter-spacing: -.035em;
  }

  .blog-topbar p {
    margin: 7px 0 0;
    color: #718096;
    font-size: 14px;
  }

  .ghost-btn,
  .small-ghost,
  .primary-btn,
  .clear-btn {
    min-height: 40px;
    border-radius: 7px;
    padding: 0 13px;
    font: inherit;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }

  .ghost-btn,
  .small-ghost,
  .clear-btn {
    border: 1px solid #253342;
    background: #0d151e;
    color: #9aa9ba;
  }

  .ghost-btn:hover,
  .small-ghost:hover,
  .clear-btn:hover {
    border-color: #3b4b5d;
    color: #e2e8f0;
  }

  .primary-btn {
    border: 1px solid rgba(45,212,191,.32);
    background: rgba(45,212,191,.1);
    color: #5eead4;
  }

  .primary-btn:hover:not(:disabled) {
    background: rgba(45,212,191,.16);
  }

  .notice {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 14px;
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 13px;
  }

  .notice > span {
    width: 20px;
    height: 20px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border-radius: 50%;
  }

  .notice-error {
    border: 1px solid rgba(248,113,113,.2);
    background: rgba(127,29,29,.13);
    color: #fca5a5;
  }

  .notice-error > span { background: rgba(248,113,113,.1); }

  .notice-success {
    border: 1px solid rgba(45,212,191,.18);
    background: rgba(13,148,136,.08);
    color: #5eead4;
  }

  .notice-success > span { background: rgba(45,212,191,.1); }

  .notice button {
    margin-left: auto;
    border: 0;
    background: transparent;
    color: currentColor;
    font-size: 17px;
    cursor: pointer;
  }

  .editor-card,
  .posts-card {
    border: 1px solid #1d2a37;
    border-radius: 12px;
    overflow: visible;
    background: #0d141c;
  }

  .editor-card { margin-bottom: 16px; }

  .section-head,
  .posts-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    padding: 16px 18px;
    border-bottom: 1px solid #1d2a37;
  }

  .section-head h2,
  .posts-head h2 {
    margin: 5px 0 0;
    font-size: 18px;
    letter-spacing: -.015em;
  }

  .posts-head h2 b {
    display: inline-grid;
    place-items: center;
    min-width: 25px;
    height: 22px;
    margin-left: 6px;
    padding: 0 6px;
    border: 1px solid #263544;
    border-radius: 6px;
    color: #7dd3fc;
    font-size: 11px;
    vertical-align: middle;
  }

  .compact-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    padding: 17px 18px 14px;
  }

  .compact-grid label {
    min-width: 0;
    color: #9aa9ba;
    font-size: 11px;
    font-weight: 700;
  }

  .compact-grid .wide { grid-column: 1 / -1; }

  .compact-grid input,
  .compact-grid textarea,
  .search-box input,
  .filters select {
    width: 100%;
    margin-top: 6px;
    border: 1px solid #243341;
    border-radius: 7px;
    outline: none;
    background: #091017;
    color: #dce6ef;
    font: inherit;
    font-size: 13px;
  }

  .compact-grid input {
    height: 40px;
    padding: 0 10px;
  }

  .compact-grid textarea {
    padding: 9px 10px;
    line-height: 1.55;
    resize: vertical;
  }

  .compact-grid input:focus,
  .compact-grid textarea:focus,
  .search-box input:focus,
  .filters select:focus {
    border-color: rgba(45,212,191,.45);
    box-shadow: 0 0 0 3px rgba(45,212,191,.04);
  }

  .compact-grid input::placeholder,
  .compact-grid textarea::placeholder,
  .search-box input::placeholder { color: #4f6071; }

  .toggles {
    display: flex;
    gap: 8px;
    padding: 0 18px 14px;
  }

  .toggles label {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 31px;
    padding: 0 10px;
    border: 1px solid #243341;
    border-radius: 7px;
    background: #0b1219;
    color: #91a0b1;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
  }

  .toggles input {
    position: absolute;
    opacity: 0;
  }

  .toggles span {
    width: 15px;
    height: 15px;
    display: grid;
    place-items: center;
    border: 1px solid #344556;
    border-radius: 4px;
  }

  .toggles input:checked + span {
    border-color: #2dd4bf;
    background: rgba(45,212,191,.13);
  }

  .toggles input:checked + span::after {
    content: "✓";
    color: #5eead4;
    font-size: 11px;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 7px;
    padding: 13px 18px;
    border-top: 1px solid #1d2a37;
  }

  .filters {
    display: grid;
    grid-template-columns: minmax(220px, 1fr) 170px 150px 150px auto;
    gap: 7px;
    padding: 11px 14px;
    border-bottom: 1px solid #1d2a37;
    background: #0b1219;
  }

  .search-box { position: relative; }

  .search-box > span {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #607084;
    pointer-events: none;
  }

  .search-box input,
  .filters select {
    height: 34px;
    margin: 0;
    padding: 0 10px;
  }

  .search-box input { padding-left: 28px; }

  .filter-note {
    padding: 8px 14px;
    border-bottom: 1px solid #1d2a37;
    color: #806f4e;
    background: rgba(251,191,36,.025);
    font-size: 11px;
  }

  .drag-help {
    color: #59697a;
    font-size: 11px;
  }

  .post-list { padding: 7px 12px; }

  .post-row {
    position: relative;
    display: grid;
    grid-template-columns: 26px 38px 64px minmax(280px, 1fr) 125px 38px;
    align-items: center;
    gap: 10px;
    min-height: 98px;
    padding: 11px 9px;
    border-bottom: 1px solid #192632;
    transition: background .15s ease, border-color .15s ease, transform .15s ease;
  }

  .post-row:last-child { border-bottom: 0; }

  .post-row:hover { background: rgba(255,255,255,.014); }

  .post-row.dragging { opacity: .45; }

  .post-row.drag-over {
    border-top: 2px solid #2dd4bf;
    background: rgba(45,212,191,.035);
  }

  .drag-handle {
    display: grid;
    place-items: center;
    width: 24px;
    height: 36px;
    color: #526274;
    font-size: 15px;
    letter-spacing: -4px;
    cursor: grab;
    user-select: none;
  }

  .drag-handle:active { cursor: grabbing; }

  .position {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border: 1px solid #263544;
    border-radius: 6px;
    background: #0a1118;
    color: #64748b;
    font-size: 11px;
    font-weight: 800;
  }

  .thumb {
    width: 64px;
    height: 54px;
    display: grid;
    place-items: center;
    overflow: hidden;
    border: 1px solid #263544;
    border-radius: 7px;
    background: #091017;
    color: #566779;
  }

  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .post-main { min-width: 0; }

  .post-title-line {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
  }

  .post-main h3 {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    color: #e3ebf3;
    font-size: 15px;
    font-weight: 750;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .post-main p {
    max-width: 660px;
    margin: 4px 0 6px;
    overflow: hidden;
    color: #66778a;
    font-size: 11px;
    line-height: 1.45;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .post-meta {
    display: flex;
    align-items: center;
    gap: 7px;
    color: #526274;
    font-size: 10px;
    white-space: nowrap;
  }

  .post-meta i {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #3a4856;
  }

  .featured-badge {
    flex: 0 0 auto;
    padding: 3px 5px;
    border: 1px solid rgba(251,191,36,.18);
    border-radius: 4px;
    background: rgba(251,191,36,.04);
    color: #fbbf24;
    font-size: 9px;
    font-weight: 800;
  }

  .status-area {
    display: flex;
    flex-direction: column;
    gap: 5px;
    align-items: flex-start;
  }

  .status-dot,
  .enabled-label {
    font-size: 10px;
    font-weight: 750;
    white-space: nowrap;
  }

  .status-dot { color: #5eead4; }

  .status-dot::before {
    content: "";
    display: inline-block;
    width: 5px;
    height: 5px;
    margin-right: 5px;
    border-radius: 50%;
    background: currentColor;
    vertical-align: middle;
  }

  .status-dot.draft { color: #fbbf24; }
  .enabled-label { color: #60a5fa; }
  .enabled-label.disabled { color: #f87171; }

  .row-menu-wrap {
    position: relative;
    justify-self: end;
  }

  .dots-btn {
    width: 36px;
    height: 36px;
    border: 1px solid #2a3948;
    border-radius: 7px;
    background: #0b1219;
    color: #aebaca;
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
  }

  .dots-btn:hover,
  .dots-btn[aria-expanded="true"] {
    border-color: #3b4d5f;
    background: #111b25;
    color: #5eead4;
  }

  .action-menu {
    position: absolute;
    z-index: 50;
    top: calc(100% + 6px);
    right: 0;
    width: 185px;
    padding: 5px;
    border: 1px solid #2a3948;
    border-radius: 9px;
    background: #101820;
    box-shadow: 0 18px 45px rgba(0,0,0,.38);
  }

  .action-menu button {
    width: 100%;
    min-height: 31px;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 0 9px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: #b6c2cf;
    text-align: left;
    font: inherit;
    font-size: 11px;
    cursor: pointer;
  }

  .action-menu button:hover:not(:disabled) {
    background: #18232e;
    color: #f1f5f9;
  }

  .action-menu button:disabled {
    opacity: .35;
    cursor: not-allowed;
  }

  .action-menu button > span {
    flex: 1;
  }

  .action-menu > div {
    height: 1px;
    margin: 4px 5px;
    background: #263544;
  }

  .action-menu .danger-item { color: #f87171; }

  .action-menu .danger-item:hover {
    background: rgba(248,113,113,.08);
    color: #fca5a5;
  }

  .posts-footer {
    display: flex;
    justify-content: space-between;
    padding: 10px 14px;
    border-top: 1px solid #1d2a37;
    color: #536476;
    font-size: 10px;
  }

  .empty {
    padding: 55px 20px;
    text-align: center;
    color: #64748b;
    font-size: 13px;
  }

  .blog-loading {
    min-height: 100vh;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 10px;
    background: #090e14;
    color: #718096;
    font-size: 13px;
  }

  .blog-loading span {
    width: 25px;
    height: 25px;
    border: 2px solid #263544;
    border-top-color: #2dd4bf;
    border-radius: 50%;
    animation: spin .8s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 1050px) {
    .admin-blog-main { margin-left: 0; }
    .compact-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .filters { grid-template-columns: minmax(180px, 1fr) repeat(2, 145px); }
    .filters .clear-btn { grid-column: 1 / -1; justify-self: start; }
  }

  @media (max-width: 760px) {
    .admin-blog-content { width: min(100% - 20px, 700px); padding-top: 20px; }
    .blog-topbar { align-items: flex-start; flex-direction: column; }
    .section-head, .posts-head { padding: 14px; }
    .compact-grid { grid-template-columns: 1fr; padding: 14px; }
    .compact-grid .wide { grid-column: auto; }
    .toggles { flex-wrap: wrap; padding: 0 14px 12px; }
    .form-actions { padding: 11px 14px; }
    .filters { grid-template-columns: 1fr; padding: 10px; }
    .filters .clear-btn { grid-column: auto; }
    .drag-help { display: none; }

    .post-list { padding: 5px; }

    .post-row {
      grid-template-columns: 24px 34px 58px minmax(0, 1fr) 36px;
      gap: 8px;
      min-height: 82px;
      padding: 10px 6px;
    }

    .thumb { width: 58px; height: 50px; }
    .status-area { display: none; }
    .post-main p { display: none; }
    .post-meta { gap: 5px; font-size: 9px; }
    .post-main h3 { font-size: 12px; }
    .position { width: 27px; height: 27px; }
    .action-menu { right: 0; }
  }

  @media (max-width: 480px) {
    .admin-blog-content { width: calc(100% - 12px); }
    .blog-topbar h1 { font-size: 28px; }
    .ghost-btn { min-height: 34px; }
    .section-head h2, .posts-head h2 { font-size: 14px; }
    .post-row {
      grid-template-columns: 22px 30px 52px minmax(0, 1fr) 34px;
      gap: 6px;
    }
    .drag-handle { width: 20px; font-size: 15px; }
    .thumb { width: 52px; height: 46px; }
    .post-main h3 { font-size: 11px; }
    .post-meta span:last-child { display: none; }
    .post-meta i:last-of-type { display: none; }
    .action-menu { width: 175px; }
  }
`;

export default AdminBlogPage;
