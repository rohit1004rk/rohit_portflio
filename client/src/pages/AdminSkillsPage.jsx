import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import { fallbackSkills } from "../data/portfolioData.js";

const emptySkill = {
  category: "",
  icon: "🛠️",
  items: "",
  order: 0,
  visible: true,
};

const normalizeCategory = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const toText = (value) => {
  if (value === null || value === undefined) return "";

  if (typeof value === "string") return value;

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => toText(item))
      .filter(Boolean)
      .join("\n");
  }

  return "";
};

const adminSkillsStyles = `
  .admin-skills-layout {
    min-height: 100vh;
    background:
      radial-gradient(circle at 85% 10%, rgba(45, 212, 191, 0.06), transparent 30%),
      #0a0f14;
    color: #f1f5f9;
  }

  .admin-skills-main {
    min-height: 100vh;
    margin-left: 250px;
    box-sizing: border-box;
  }

  .admin-skills-container {
    width: min(1380px, calc(100% - 56px));
    margin: 0 auto;
    padding: 42px 0 70px;
  }

  .skills-page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 30px;
    margin-bottom: 30px;
  }

  .skills-breadcrumb {
    color: #64748b;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .skills-breadcrumb span {
    color: #334155;
    margin: 0 8px;
  }

  .skills-page-header h1 {
    margin: 0;
    font-size: clamp(28px, 3vw, 40px);
    line-height: 1.1;
    font-weight: 750;
    letter-spacing: -0.035em;
    color: #f8fafc;
  }

  .skills-page-header p {
    margin: 11px 0 0;
    color: #8190a3;
    font-size: 14px;
    line-height: 1.55;
  }

  .skills-dashboard-btn,
  .skills-cancel-btn,
  .skills-submit-btn,
  .skills-save-order-btn,
  .skill-action-btn {
    font: inherit;
    cursor: pointer;
  }

  .skills-dashboard-btn {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    min-height: 42px;
    padding: 0 16px;
    border: 1px solid #263442;
    border-radius: 9px;
    background: #111923;
    color: #cbd5e1;
    font-size: 13px;
    font-weight: 600;
    transition: 0.2s ease;
    white-space: nowrap;
  }

  .skills-dashboard-btn:hover {
    background: #17212d;
    border-color: #3b4b5d;
    transform: translateY(-1px);
  }

  .skills-alert {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 48px;
    padding: 0 15px;
    margin-bottom: 20px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    box-sizing: border-box;
  }

  .skills-alert-error {
    border: 1px solid rgba(248, 113, 113, 0.2);
    background: rgba(127, 29, 29, 0.18);
    color: #fca5a5;
  }

  .skills-alert-success {
    border: 1px solid rgba(45, 212, 191, 0.2);
    background: rgba(13, 148, 136, 0.11);
    color: #5eead4;
  }

  .skills-panel {
    background: rgba(14, 21, 29, 0.92);
    border: 1px solid #1e2a36;
    border-radius: 15px;
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.16);
    overflow: hidden;
    margin-bottom: 24px;
  }

  .skills-panel-header,
  .skills-existing-header {
    min-height: 84px;
    padding: 22px 25px;
    display: flex;
    align-items: center;
    gap: 14px;
    border-bottom: 1px solid #1e2a36;
    box-sizing: border-box;
  }

  .skills-panel-header h2,
  .skills-existing-title h2 {
    margin: 0;
    color: #f8fafc;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .skills-panel-header p,
  .skills-existing-title p {
    margin: 5px 0 0;
    color: #718096;
    font-size: 12px;
    line-height: 1.45;
  }

  .skills-panel-header > div:first-child,
  .skills-existing-title > div:last-child {
    min-width: 0;
  }

  .skills-cancel-btn {
    margin-left: auto;
    padding: 9px 13px;
    border: 1px solid #344354;
    border-radius: 8px;
    background: transparent;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 600;
  }

  .skills-cancel-btn:hover {
    color: #f8fafc;
    border-color: #64748b;
  }

  .skills-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 19px 22px;
    padding: 26px;
    box-sizing: border-box;
  }

  .skills-form-field {
    min-width: 0;
  }

  .skills-form-field.full {
    grid-column: 1 / -1;
  }

  .skills-form-field label:not(.skills-checkbox-row) {
    display: block;
    margin-bottom: 8px;
    color: #cbd5e1;
    font-size: 12px;
    font-weight: 650;
  }

  .skills-form-field input,
  .skills-form-field textarea {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #293746;
    border-radius: 9px;
    outline: none;
    background: #0b1219;
    color: #e2e8f0;
    font-family: inherit;
    font-size: 13px;
    transition:
      border-color 0.18s ease,
      box-shadow 0.18s ease,
      background 0.18s ease;
  }

  .skills-form-field input {
    height: 43px;
    padding: 0 13px;
  }

  .skills-form-field textarea {
    min-height: 128px;
    padding: 12px 13px;
    resize: vertical;
    line-height: 1.55;
    display: block;
  }

  .skills-form-field input::placeholder,
  .skills-form-field textarea::placeholder {
    color: #475569;
  }

  .skills-form-field input:hover,
  .skills-form-field textarea:hover {
    border-color: #3b4c5e;
  }

  .skills-form-field input:focus,
  .skills-form-field textarea:focus {
    border-color: #2dd4bf;
    background: #0d161f;
    box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.08);
  }

  .skills-form-help {
    display: block;
    margin-top: 6px;
    color: #59697a;
    font-size: 10px;
    line-height: 1.5;
  }

  .skills-checkbox-row {
    min-height: 43px;
    padding: 0 13px;
    display: flex;
    align-items: center;
    gap: 11px;
    border: 1px solid #293746;
    border-radius: 9px;
    background: #0b1219;
    color: #94a3b8;
    cursor: pointer;
    box-sizing: border-box;
  }

  .skills-checkbox-row input {
    width: 17px;
    height: 17px;
    margin: 0;
    accent-color: #2dd4bf;
    flex: 0 0 auto;
  }

  .skills-checkbox-row span {
    color: #94a3b8;
    font-size: 12px;
    line-height: 1.4;
  }

  .skills-submit-row {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    padding: 22px 26px;
    border-top: 1px solid #1e2a36;
  }

  .skills-submit-btn,
  .skills-save-order-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    min-height: 43px;
    padding: 0 17px;
    border-radius: 9px;
    font-size: 12px;
    font-weight: 700;
    transition: 0.2s ease;
  }

  .skills-submit-btn {
    min-width: 155px;
    border: 1px solid #2dd4bf;
    background: #2dd4bf;
    color: #06211e;
    box-shadow: 0 7px 22px rgba(45, 212, 191, 0.13);
  }

  .skills-submit-btn:hover:not(:disabled) {
    background: #5eead4;
    transform: translateY(-1px);
    box-shadow: 0 10px 28px rgba(45, 212, 191, 0.18);
  }

  .skills-submit-btn:disabled,
  .skills-save-order-btn:disabled,
  .skill-action-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .skills-existing-header {
    justify-content: space-between;
  }

  .skills-existing-title {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
  }

  .skills-section-icon {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border: 1px solid rgba(96, 165, 250, 0.18);
    border-radius: 9px;
    background: rgba(96, 165, 250, 0.08);
    color: #60a5fa;
    font-size: 16px;
  }

  .skills-existing-actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .skills-order-status {
    color: #fbbf24;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
  }

  .skills-save-order-btn {
    min-height: 36px;
    padding: 0 12px;
    border: 1px solid #2b4650;
    background: rgba(45, 212, 191, 0.06);
    color: #5eead4;
  }

  .skills-save-order-btn:hover:not(:disabled) {
    background: rgba(45, 212, 191, 0.13);
    border-color: #39727a;
  }

  .skills-count {
    min-width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    padding: 0 9px;
    border: 1px solid #293746;
    border-radius: 8px;
    background: #0b1219;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 700;
    box-sizing: border-box;
  }

  .skills-table-wrapper {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .skills-table {
    width: 100%;
    min-width: 850px;
    border-collapse: collapse;
  }

  .skills-table th {
    padding: 13px 20px;
    border-bottom: 1px solid #202c38;
    background: #0b1219;
    color: #607084;
    text-align: left;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.11em;
    white-space: nowrap;
  }

  .skills-table td {
    padding: 16px 20px;
    border-bottom: 1px solid #1b2732;
    color: #94a3b8;
    font-size: 12px;
    vertical-align: middle;
  }

  .skills-table tbody tr {
    transition: background 0.16s ease;
  }

  .skills-table tbody tr:hover {
    background: rgba(255, 255, 255, 0.018);
  }

  .skills-table tbody tr:last-child td {
    border-bottom: 0;
  }

  .skill-row-dragging {
    opacity: 0.45;
  }

  .skill-category-cell {
    display: flex;
    align-items: center;
    gap: 11px;
    min-width: 220px;
  }

  .skill-drag-handle {
    width: 27px;
    height: 31px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    padding: 0;
    border: 1px solid #2a3947;
    border-radius: 7px;
    background: #0b1219;
    color: #64748b;
    cursor: grab;
    font-size: 15px;
    letter-spacing: -3px;
  }

  .skill-drag-handle:active {
    cursor: grabbing;
  }

  .skill-icon-box {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border: 1px solid #2a3947;
    border-radius: 8px;
    background: #0b1219;
    color: #cbd5e1;
    font-size: 16px;
  }

  .skill-category-name {
    min-width: 0;
  }

  .skill-category-name strong {
    display: block;
    max-width: 220px;
    overflow: hidden;
    color: #e2e8f0;
    font-size: 12px;
    font-weight: 650;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .skill-category-name span {
    display: block;
    margin-top: 3px;
    color: #536275;
    font-size: 10px;
  }

  .skill-items-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    max-width: 470px;
  }

  .skill-item-chip {
    display: inline-flex;
    align-items: center;
    max-width: 180px;
    overflow: hidden;
    padding: 5px 8px;
    border: 1px solid #263544;
    border-radius: 6px;
    background: #0b1219;
    color: #94a3b8;
    font-size: 10px;
    line-height: 1.25;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .skill-more-chip {
    color: #5eead4;
  }

  .skill-visibility {
    display: inline-flex;
    align-items: center;
    min-height: 27px;
    padding: 0 9px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    transition: 0.18s ease;
  }

  .skill-visibility.visible {
    border: 1px solid rgba(45, 212, 191, 0.2);
    background: rgba(45, 212, 191, 0.06);
    color: #5eead4;
  }

  .skill-visibility.visible:hover {
    background: rgba(45, 212, 191, 0.13);
  }

  .skill-visibility.hidden {
    border: 1px solid rgba(148, 163, 184, 0.16);
    background: rgba(148, 163, 184, 0.045);
    color: #64748b;
  }

  .skill-visibility.hidden:hover {
    border-color: #526273;
    color: #94a3b8;
  }

  .skill-order {
    display: inline-grid;
    place-items: center;
    min-width: 27px;
    height: 27px;
    padding: 0 7px;
    border-radius: 6px;
    background: #101923;
    color: #94a3b8;
    font-size: 11px;
  }

  .skill-actions {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .skill-action-btn {
    min-height: 31px;
    padding: 0 10px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 700;
    transition: 0.18s ease;
  }

  .skill-action-btn:not(.delete) {
    border: 1px solid #2b4650;
    background: rgba(45, 212, 191, 0.06);
    color: #5eead4;
  }

  .skill-action-btn:not(.delete):hover {
    background: rgba(45, 212, 191, 0.13);
    border-color: #39727a;
  }

  .skill-action-btn.delete {
    border: 1px solid rgba(248, 113, 113, 0.18);
    background: rgba(248, 113, 113, 0.045);
    color: #f87171;
  }

  .skill-action-btn.delete:hover {
    background: rgba(248, 113, 113, 0.11);
    border-color: rgba(248, 113, 113, 0.32);
  }

  .skills-empty {
    padding: 65px 25px;
    text-align: center;
  }

  .skills-empty strong {
    display: block;
    margin-bottom: 7px;
    color: #cbd5e1;
    font-size: 15px;
  }

  .skills-empty span {
    color: #64748b;
    font-size: 12px;
  }

  .skills-loading {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 14px;
    background: #0a0f14;
    color: #64748b;
    font-size: 13px;
  }

  .skills-spinner {
    width: 28px;
    height: 28px;
    border: 3px solid #263442;
    border-top-color: #2dd4bf;
    border-radius: 50%;
    animation: adminSkillsSpin 0.7s linear infinite;
  }

  @keyframes adminSkillsSpin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 1100px) {
    .admin-skills-main {
      margin-left: 220px;
    }

    .admin-skills-container {
      width: min(calc(100% - 36px), 1000px);
    }

    .skills-form-grid {
      grid-template-columns: 1fr;
    }

    .skills-form-field.full {
      grid-column: auto;
    }
  }

  @media (max-width: 760px) {
    .admin-skills-main {
      margin-left: 0;
    }

    .admin-skills-container {
      width: calc(100% - 24px);
      padding: 22px 0 45px;
    }

    .skills-page-header {
      align-items: flex-start;
      flex-direction: column;
      gap: 18px;
      margin-bottom: 22px;
    }

    .skills-page-header h1 {
      font-size: 27px;
    }

    .skills-page-header p {
      max-width: 340px;
      line-height: 1.55;
    }

    .skills-dashboard-btn {
      width: 100%;
      justify-content: center;
    }

    .skills-panel {
      border-radius: 12px;
      margin-bottom: 17px;
    }

    .skills-panel-header,
    .skills-existing-header {
      min-height: auto;
      padding: 18px;
      gap: 11px;
      flex-wrap: wrap;
    }

    .skills-panel-header h2,
    .skills-existing-title h2 {
      font-size: 16px;
    }

    .skills-panel-header p,
    .skills-existing-title p {
      font-size: 11px;
      line-height: 1.45;
    }

    .skills-cancel-btn {
      margin-left: auto;
      padding: 8px 9px;
      font-size: 10px;
    }

    .skills-form-grid {
      gap: 15px;
      padding: 19px 16px;
    }

    .skills-form-field input {
      height: 45px;
      font-size: 13px;
    }

    .skills-form-field textarea {
      min-height: 115px;
      font-size: 13px;
    }

    .skills-checkbox-row {
      min-height: 45px;
    }

    .skills-submit-row {
      padding: 17px 16px;
      flex-direction: column;
      gap: 9px;
    }

    .skills-submit-btn {
      width: 100%;
    }

    .skills-existing-title {
      width: 100%;
    }

    .skills-existing-actions {
      width: 100%;
      margin-left: 0;
      justify-content: flex-end;
      flex-wrap: wrap;
    }

    .skills-order-status {
      margin-right: auto;
    }

    .skills-save-order-btn {
      min-height: 36px;
    }

    .skills-count {
      min-width: 29px;
      height: 29px;
    }

    .skills-table-wrapper {
      overflow-x: auto;
    }

    .skills-table {
      min-width: 850px;
    }

    .skills-table th,
    .skills-table td {
      padding-left: 14px;
      padding-right: 14px;
    }
  }

  @media (max-width: 420px) {
    .admin-skills-container {
      width: calc(100% - 18px);
    }

    .skills-page-header h1 {
      font-size: 24px;
    }

    .skills-panel-header,
    .skills-existing-header {
      padding: 15px;
    }

    .skills-form-grid {
      padding: 17px 13px;
    }

    .skills-submit-row {
      padding-left: 13px;
      padding-right: 13px;
    }
  }
`;

function AdminSkillsPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState(emptySkill);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orderSaving, setOrderSaving] = useState(false);

  const [draggedSkillId, setDraggedSkillId] = useState(null);
  const [orderDirty, setOrderDirty] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    loadSkills();
  }, [token, navigate]);

  const loadSkills = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/skills");

      if (!response.ok) {
        throw new Error("Failed to load skills.");
      }

      const data = await response.json();

      const skillList = Array.isArray(data)
        ? data
        : Array.isArray(data?.skills)
          ? data.skills
          : [];

      /*
       * SAFE INITIALIZATION
       *
       * Existing portfolio skills currently live in fallbackSkills.
       * If MongoDB is missing any of those categories, create only
       * the missing categories.
       *
       * IMPORTANT:
       * - Existing MongoDB skill records are never deleted.
       * - Existing MongoDB skill records are never overwritten.
       * - No seed/reset operation is used.
       */
      const existingCategories = new Set(
        skillList.map((skill) => normalizeCategory(skill.category)),
      );

      const missingSkills = fallbackSkills.filter(
        (skill) => !existingCategories.has(normalizeCategory(skill.category)),
      );

      let finalSkills = skillList;

      if (missingSkills.length > 0) {
        const currentMaxOrder = skillList.reduce(
          (max, skill) => Math.max(max, Number(skill.order) || 0),
          0,
        );

        const createdSkills = [];

        for (let index = 0; index < missingSkills.length; index += 1) {
          const skill = missingSkills[index];

          const createResponse = await fetch("/api/skills", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              category: skill.category,
              icon: skill.icon,
              items: Array.isArray(skill.items) ? skill.items : [],
              order: currentMaxOrder + index + 1,
              visible: true,
            }),
          });

          if (createResponse.status === 401 || createResponse.status === 403) {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUser");
            navigate("/admin/login");
            return;
          }

          const createdData = await createResponse.json().catch(() => ({}));

          if (!createResponse.ok) {
            throw new Error(
              createdData.message || `Failed to initialize ${skill.category}.`,
            );
          }

          createdSkills.push(createdData);
        }

        finalSkills = [...skillList, ...createdSkills];

        setSuccess(
          `Existing portfolio skills loaded into admin. ${createdSkills.length} missing group${
            createdSkills.length === 1 ? "" : "s"
          } added safely.`,
        );
      }

      const sortedSkills = [...finalSkills].sort((a, b) => {
        const orderA = Number(a.order) || 0;
        const orderB = Number(b.order) || 0;

        if (orderA !== orderB) {
          return orderA - orderB;
        }

        return String(a.category || "").localeCompare(String(b.category || ""));
      });

      setSkills(sortedSkills);
      setOrderDirty(false);
    } catch (err) {
      setError(err.message || "Could not load skills.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptySkill);
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = (skill) => {
    setEditingId(skill._id);

    setForm({
      category: toText(skill.category),
      icon: toText(skill.icon) || "🛠️",
      items: Array.isArray(skill.items)
        ? skill.items
            .map((item) => toText(item))
            .filter(Boolean)
            .join("\n")
        : toText(skill.items),
      order: skill.order ?? 0,
      visible: skill.visible !== false,
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const category = form.category.trim();

    if (!category) {
      setError("Skill category is required.");
      return;
    }

    const items = form.items
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    if (items.length === 0) {
      setError("Please add at least one skill.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        category,
        icon: form.icon.trim() || "🛠️",
        items,
        order: Number(form.order) || 0,
        visible: Boolean(form.visible),
      };

      const url = editingId ? `/api/skills/${editingId}` : "/api/skills";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to save skill.");
      }

      setSuccess(
        editingId
          ? "Skill group updated successfully."
          : "Skill group added successfully.",
      );

      resetForm();

      await loadSkills();
    } catch (err) {
      setError(err.message || "Failed to save skill.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const skill = skills.find((item) => item._id === id);

    const confirmed = window.confirm(
      `Are you sure you want to delete "${
        skill?.category || "this skill group"
      }"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(`/api/skills/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete skill.");
      }

      setSkills((current) => current.filter((item) => item._id !== id));

      if (editingId === id) {
        resetForm();
      }

      setSuccess("Skill group deleted successfully.");
      setOrderDirty(true);
    } catch (err) {
      setError(err.message || "Failed to delete skill.");
    }
  };

  const handleToggleVisibility = async (skill) => {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(`/api/skills/${skill._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          visible: skill.visible === false,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to update visibility.");
      }

      setSkills((current) =>
        current.map((item) =>
          item._id === skill._id
            ? {
                ...item,
                visible: data.visible !== false,
              }
            : item,
        ),
      );

      setSuccess(
        data.visible === false
          ? `${skill.category} hidden successfully.`
          : `${skill.category} is now visible.`,
      );
    } catch (err) {
      setError(err.message || "Failed to update visibility.");
    }
  };

  const handleDragStart = (event, skillId) => {
    setDraggedSkillId(skillId);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", skillId);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDragEnd = () => {
    setDraggedSkillId(null);
  };

  const handleDrop = (event, targetSkillId) => {
    event.preventDefault();

    const sourceSkillId =
      event.dataTransfer.getData("text/plain") || draggedSkillId;

    if (!sourceSkillId || sourceSkillId === targetSkillId) {
      setDraggedSkillId(null);
      return;
    }

    setSkills((current) => {
      const sourceIndex = current.findIndex(
        (skill) => skill._id === sourceSkillId,
      );

      const targetIndex = current.findIndex(
        (skill) => skill._id === targetSkillId,
      );

      if (sourceIndex === -1 || targetIndex === -1) {
        return current;
      }

      const reordered = [...current];

      const [movedSkill] = reordered.splice(sourceIndex, 1);

      reordered.splice(targetIndex, 0, movedSkill);

      setOrderDirty(true);
      setSuccess("");
      setError("");

      return reordered.map((skill, index) => ({
        ...skill,
        order: index + 1,
      }));
    });

    setDraggedSkillId(null);
  };

  const handleSaveOrder = async () => {
    if (!skills.length) {
      return;
    }

    try {
      setOrderSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/skills/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skillIds: skills.map((skill) => skill._id),
        }),
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to save skill order.");
      }

      const updatedSkills = Array.isArray(data)
        ? data
        : Array.isArray(data?.skills)
          ? data.skills
          : skills;

      const sortedSkills = [...updatedSkills].sort(
        (a, b) => (Number(a.order) || 0) - (Number(b.order) || 0),
      );

      setSkills(sortedSkills);
      setOrderDirty(false);
      setSuccess("Skill order saved successfully.");
    } catch (err) {
      setError(err.message || "Failed to save skill order.");
    } finally {
      setOrderSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <>
        <style>{adminSkillsStyles}</style>

        <div className="admin-skills-layout">
          <AdminSidebar onLogout={handleLogout} />

          <main className="admin-skills-main">
            <div className="skills-loading">
              <div className="skills-spinner" />
              <p>Loading skills...</p>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{adminSkillsStyles}</style>

      <div className="admin-skills-layout">
        <AdminSidebar onLogout={handleLogout} />

        <main className="admin-skills-main">
          <div className="admin-skills-container">
            <header className="skills-page-header">
              <div>
                <div className="skills-breadcrumb">
                  ADMIN PANEL <span>/</span> SKILLS
                </div>

                <h1>Skills Management</h1>

                <p>
                  Manage skill categories and their individual skills. Changes
                  made here are stored in MongoDB and can be reflected on the
                  public Skills page.
                </p>
              </div>

              <button
                type="button"
                className="skills-dashboard-btn"
                onClick={() => navigate("/admin")}
              >
                <span>←</span>
                Dashboard
              </button>
            </header>

            {error && (
              <div className="skills-alert skills-alert-error">{error}</div>
            )}

            {success && (
              <div className="skills-alert skills-alert-success">{success}</div>
            )}

            <section className="skills-panel">
              <div className="skills-panel-header">
                <div>
                  <h2>{editingId ? "Edit Skill Group" : "Add Skill Group"}</h2>

                  <p>Each category can contain multiple skills.</p>
                </div>

                {editingId && (
                  <button
                    type="button"
                    className="skills-cancel-btn"
                    onClick={resetForm}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="skills-form-grid">
                  <div className="skills-form-field">
                    <label htmlFor="skill-category">Category *</label>

                    <input
                      id="skill-category"
                      name="category"
                      type="text"
                      value={form.category}
                      onChange={handleChange}
                      placeholder="Frontend Development"
                      maxLength={120}
                      required
                    />
                  </div>

                  <div className="skills-form-field">
                    <label htmlFor="skill-icon">Icon</label>

                    <input
                      id="skill-icon"
                      name="icon"
                      type="text"
                      value={form.icon}
                      onChange={handleChange}
                      placeholder="🎨"
                      maxLength={20}
                    />
                  </div>

                  <div className="skills-form-field full">
                    <label htmlFor="skill-items">Skills *</label>

                    <textarea
                      id="skill-items"
                      name="items"
                      value={form.items}
                      onChange={handleChange}
                      placeholder={`HTML
CSS
JavaScript
React`}
                      required
                    />

                    <small className="skills-form-help">
                      Enter one skill per line.
                    </small>
                  </div>

                  <div className="skills-form-field">
                    <label htmlFor="skill-order">Display Order</label>

                    <input
                      id="skill-order"
                      name="order"
                      type="number"
                      min="0"
                      value={form.order}
                      onChange={handleChange}
                    />

                    <small className="skills-form-help">
                      Drag & drop can also be used to change the order.
                    </small>
                  </div>

                  <div className="skills-form-field">
                    <label>Visibility</label>

                    <label className="skills-checkbox-row">
                      <input
                        type="checkbox"
                        name="visible"
                        checked={Boolean(form.visible)}
                        onChange={handleChange}
                      />

                      <span>Show this skill group on the public portfolio</span>
                    </label>
                  </div>
                </div>

                <div className="skills-submit-row">
                  <button
                    type="submit"
                    className="skills-submit-btn"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Update Skill Group →"
                        : "Add Skill Group →"}
                  </button>
                </div>
              </form>
            </section>

            <section className="skills-panel">
              <div className="skills-existing-header">
                <div className="skills-existing-title">
                  <div className="skills-section-icon">◆</div>

                  <div>
                    <h2>Existing Skill Groups</h2>

                    <p>
                      {skills.length} skill{" "}
                      {skills.length === 1 ? "group" : "groups"} in your
                      portfolio. Drag groups to change their display order.
                    </p>
                  </div>
                </div>

                <div className="skills-existing-actions">
                  {orderDirty && (
                    <span className="skills-order-status">Order changed</span>
                  )}

                  <button
                    type="button"
                    className="skills-save-order-btn"
                    onClick={handleSaveOrder}
                    disabled={!orderDirty || orderSaving}
                  >
                    {orderSaving ? "Saving..." : "Save Order ✓"}
                  </button>

                  <div className="skills-count">{skills.length}</div>
                </div>
              </div>

              {skills.length === 0 ? (
                <div className="skills-empty">
                  <strong>No skill groups found</strong>
                  <span>Add your first skill group using the form above.</span>
                </div>
              ) : (
                <div className="skills-table-wrapper">
                  <table className="skills-table">
                    <thead>
                      <tr>
                        <th>SKILL GROUP</th>
                        <th>SKILLS</th>
                        <th>VISIBILITY</th>
                        <th>ORDER</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>

                    <tbody>
                      {skills.map((skill) => {
                        const items = Array.isArray(skill.items)
                          ? skill.items
                          : [];

                        return (
                          <tr
                            key={skill._id}
                            draggable
                            onDragStart={(event) =>
                              handleDragStart(event, skill._id)
                            }
                            onDragOver={handleDragOver}
                            onDrop={(event) => handleDrop(event, skill._id)}
                            onDragEnd={handleDragEnd}
                            className={
                              draggedSkillId === skill._id
                                ? "skill-row-dragging"
                                : ""
                            }
                          >
                            <td>
                              <div className="skill-category-cell">
                                <button
                                  type="button"
                                  className="skill-drag-handle"
                                  draggable={false}
                                  title="Drag to change order"
                                  aria-label={`Drag ${
                                    skill.category || "skill group"
                                  } to change order`}
                                >
                                  ⋮⋮
                                </button>

                                <div className="skill-icon-box">
                                  {skill.icon || "🛠️"}
                                </div>

                                <div className="skill-category-name">
                                  <strong>
                                    {skill.category || "Untitled Skill Group"}
                                  </strong>

                                  <span>
                                    {items.length} skill
                                    {items.length === 1 ? "" : "s"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <div className="skill-items-preview">
                                {items.slice(0, 8).map((item, index) => (
                                  <span
                                    className="skill-item-chip"
                                    key={`${skill._id}-${index}`}
                                  >
                                    {item}
                                  </span>
                                ))}

                                {items.length > 8 && (
                                  <span className="skill-item-chip skill-more-chip">
                                    +{items.length - 8} more
                                  </span>
                                )}
                              </div>
                            </td>

                            <td>
                              <button
                                type="button"
                                className={`skill-visibility ${
                                  skill.visible === false ? "hidden" : "visible"
                                }`}
                                onClick={() => handleToggleVisibility(skill)}
                                title="Click to change visibility"
                              >
                                {skill.visible === false ? "HIDDEN" : "VISIBLE"}
                              </button>
                            </td>

                            <td>
                              <span className="skill-order">
                                {skill.order ?? 0}
                              </span>
                            </td>

                            <td>
                              <div className="skill-actions">
                                <button
                                  type="button"
                                  className="skill-action-btn"
                                  onClick={() => handleEdit(skill)}
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  className="skill-action-btn delete"
                                  onClick={() => handleDelete(skill._id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </>
  );
}

export default AdminSkillsPage;
