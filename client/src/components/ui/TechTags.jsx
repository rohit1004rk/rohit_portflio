function TechTags({ items }) {
  if (!items || !items.length) return null;
  return (
    <div className="tech-tags">
      {items.map((t) => (
        <span className="tech-tag" key={t}>
          {t}
        </span>
      ))}
    </div>
  );
}

export default TechTags;
