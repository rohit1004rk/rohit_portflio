const statusMap = {
  completed: { label: 'Completed', cls: 'badge-completed' },
  'in-progress': { label: 'In Progress', cls: 'badge-in-progress' },
  prototype: { label: 'Prototype', cls: 'badge-prototype' },
  learning: { label: 'Learning / Prototype', cls: 'badge-learning' },
};

function StatusBadge({ status }) {
  const s = statusMap[status] || { label: status || 'Unknown', cls: 'badge-learning' };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

export default StatusBadge;
