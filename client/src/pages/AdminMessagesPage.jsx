import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import {
  fetchAdminStats,
  fetchMessages,
  fetchMessageById,
  fetchChatLogs,
  markMessageRead,
  markMessageUnread,
  markMessageImportant,
  markMessageNotImportant,
  archiveMessage,
  unarchiveMessage,
  markMessageReplied,
  markMessageNotReplied,
  deleteMessage,
  deleteChatLog,
} from "../api/api.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

const messageStyles = `
  .admin-messages-page {
    min-height: 100vh;
    background:
      radial-gradient(circle at 86% 0%, rgba(45, 212, 191, 0.07), transparent 30%),
      #080d12;
    color: #edf2f7;
  }

  .admin-messages-page *,
  .admin-messages-page *::before,
  .admin-messages-page *::after {
    box-sizing: border-box;
  }

  .admin-messages-main {
    min-width: 0;
    flex: 1;
    padding: 34px 0 60px;
  }

  .admin-messages-container {
    width: min(1440px, calc(100% - 48px));
    margin: 0 auto;
  }

  .messages-page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 22px;
  }

  .messages-page-header-copy {
    min-width: 0;
  }

  .messages-breadcrumb {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 9px;
    color: #5eead4;
    font-size: 9px;
    font-weight: 850;
    letter-spacing: .16em;
    text-transform: uppercase;
  }

  .messages-breadcrumb::before {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #5eead4;
    box-shadow: 0 0 13px rgba(94, 234, 212, .55);
  }

  .messages-page-header h1 {
    margin: 0 0 8px;
    color: #f7fafc;
    font-size: clamp(34px, 4vw, 48px);
    font-weight: 850;
    line-height: 1.02;
    letter-spacing: -.045em;
  }

  .messages-page-header p {
    max-width: 720px;
    margin: 0;
    color: #7d8d9b;
    font-size: 13px;
    line-height: 1.65;
  }

  .messages-header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 0 0 auto;
  }

  .messages-header-btn {
    min-height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 0 13px;
    border: 1px solid #263540;
    border-radius: 9px;
    background: #101820;
    color: #cbd7df;
    font: inherit;
    font-size: 10px;
    font-weight: 850;
    text-decoration: none;
    cursor: pointer;
  }

  .messages-header-btn:hover {
    border-color: #3b4b58;
    background: #141e27;
  }

  .messages-alert {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
    padding: 11px 13px;
    border: 1px solid;
    border-radius: 10px;
    font-size: 11px;
    line-height: 1.45;
  }

  .messages-alert-error {
    border-color: rgba(248, 113, 113, .25);
    background: rgba(239, 68, 68, .055);
    color: #fca5a5;
  }

  .messages-alert-success {
    border-color: rgba(45, 212, 191, .22);
    background: rgba(45, 212, 191, .05);
    color: #72e9da;
  }

  .messages-alert button {
    margin-left: auto;
    border: 0;
    background: transparent;
    color: inherit;
    font-size: 17px;
    cursor: pointer;
  }

  .messages-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 20px;
  }

  .messages-stat {
    min-width: 0;
    min-height: 94px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border: 1px solid #202d38;
    border-radius: 14px;
    background: linear-gradient(145deg, rgba(17, 26, 35, .96), rgba(9, 14, 19, .99));
  }

  .messages-stat.is-clickable {
    width: 100%;
    border: 1px solid #202d38;
    text-align: left;
    cursor: pointer;
    transition: border-color .18s ease, background .18s ease, transform .18s ease, box-shadow .18s ease;
  }

  .messages-stat.is-clickable:hover {
    border-color: rgba(94, 234, 212, .42);
    background: #0d171e;
    box-shadow: 0 8px 24px rgba(0, 0, 0, .16);
    transform: translateY(-1px);
  }

  .messages-stat.is-clickable:focus-visible {
    outline: 2px solid #5eead4;
    outline-offset: 2px;
  }

  .messages-stat.is-active {
    border-color: rgba(94, 234, 212, .55);
    background: #0d1b21;
    box-shadow: inset 0 0 0 1px rgba(94, 234, 212, .08);
  }

  .messages-stat-icon {
    width: 43px;
    height: 43px;
    flex: 0 0 43px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(45, 212, 191, .15);
    border-radius: 11px;
    background: rgba(45, 212, 191, .065);
    color: #5eead4;
    font-size: 17px;
  }

  .messages-stat-copy {
    min-width: 0;
  }

  .messages-stat-copy span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 5px;
    color: #687989;
    font-size: 8px;
    font-weight: 850;
    letter-spacing: .1em;
    text-transform: uppercase;
  }

  .messages-stat-copy strong {
    display: block;
    color: #edf3f7;
    font-size: 20px;
    font-weight: 850;
    line-height: 1;
  }

  .messages-panel {
    margin-bottom: 18px;
    padding: 23px;
    border: 1px solid #202d38;
    border-radius: 16px;
    background: linear-gradient(145deg, rgba(16, 24, 32, .97), rgba(8, 13, 18, .99));
    box-shadow: 0 16px 42px rgba(0, 0, 0, .12);
  }

  .messages-panel-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 17px;
    padding-bottom: 17px;
    border-bottom: 1px solid #202c37;
  }

  .messages-panel-title {
    min-width: 0;
  }

  .section-kicker {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: #5eead4;
    font-size: 8px;
    font-weight: 850;
    letter-spacing: .14em;
    line-height: 1.2;
  }

  .section-kicker::before {
    content: "";
    width: 5px;
    height: 5px;
    flex: 0 0 5px;
    border-radius: 50%;
    background: #5eead4;
  }

  .messages-panel-title h2 {
    margin: 4px 0 5px;
    color: #edf3f7;
    font-size: 20px;
    font-weight: 850;
    line-height: 1.25;
    letter-spacing: -.025em;
  }

  .messages-panel-title p {
    margin: 0;
    color: #738290;
    font-size: 11px;
    line-height: 1.55;
  }

  .messages-panel-count {
    min-width: 48px;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 10px;
    border: 1px solid #263540;
    border-radius: 9px;
    background: #101820;
    color: #9eafbc;
    font-size: 10px;
    font-weight: 850;
    white-space: nowrap;
  }

  .messages-toolbar {
    display: grid;
    grid-template-columns: minmax(220px, 1fr) 150px 150px;
    gap: 8px;
    margin-bottom: 14px;
  }

  .messages-search,
  .messages-filter {
    width: 100%;
    min-height: 40px;
    border: 1px solid #293844;
    border-radius: 8px;
    outline: none;
    background: #0a1117;
    color: #e7eef3;
    font: inherit;
    font-size: 10px;
  }

  .messages-search {
    padding: 0 11px;
  }

  .messages-filter {
    padding: 0 10px;
    cursor: pointer;
  }

  .messages-search::placeholder {
    color: #50616f;
  }

  .messages-search:focus,
  .messages-filter:focus {
    border-color: rgba(94, 234, 212, .55);
    box-shadow: 0 0 0 3px rgba(94, 234, 212, .045);
  }

  .messages-table-wrap {
    position: relative;
    width: 100%;
    overflow: visible;
    border: 1px solid #202d38;
    border-radius: 11px;
    background: #090f15;
  }

  .messages-table {
    width: 100%;
    min-width: 1050px;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .messages-table th {
    height: 44px;
    padding: 0 11px;
    border-bottom: 1px solid #202d38;
    background: #0e161e;
    color: #6d7e8e;
    font-size: 8px;
    font-weight: 850;
    letter-spacing: .1em;
    text-align: left;
    text-transform: uppercase;
  }

  .messages-table td {
    height: 78px;
    padding: 11px;
    border-bottom: 1px solid #1c2731;
    color: #9eacb8;
    font-size: 10px;
    line-height: 1.45;
    vertical-align: middle;
  }

  .messages-table tr:last-child td {
    border-bottom: 0;
  }

  .messages-table tbody tr:hover {
    background: #0d161e;
  }

  .message-status-cell {
    width: 105px;
  }

  .message-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 26px;
    padding: 0 8px;
    border: 1px solid;
    border-radius: 999px;
    font-size: 8px;
    font-weight: 850;
    white-space: nowrap;
  }

  .message-status::before {
    content: "";
    width: 5px;
    height: 5px;
    flex: 0 0 5px;
    border-radius: 50%;
  }

  .message-status-unread {
    border-color: rgba(245, 158, 11, .23);
    background: rgba(245, 158, 11, .06);
    color: #fbbf24;
  }

  .message-status-unread::before {
    background: #f59e0b;
  }

  .message-status-read {
    border-color: rgba(45, 212, 191, .2);
    background: rgba(45, 212, 191, .045);
    color: #67e8d8;
  }

  .message-status-read::before {
    background: #2dd4bf;
  }

  .message-status-replied {
    border-color: rgba(96, 165, 250, .22);
    background: rgba(96, 165, 250, .06);
    color: #93c5fd;
  }

  .message-status-replied::before {
    background: #60a5fa;
  }

  .message-status-archived {
    border-color: rgba(148, 163, 184, .22);
    background: rgba(148, 163, 184, .06);
    color: #a8b4c0;
  }

  .message-status-archived::before {
    background: #94a3b8;
  }

  .message-name {
    width: 150px;
    color: #edf3f7 !important;
    font-weight: 800;
  }

  .message-email {
    width: 205px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .message-subject {
    width: 190px;
    color: #c3ced6 !important;
    font-weight: 700;
  }

  .message-content {
    width: 280px;
  }

  .message-content-text {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    color: #788895;
    line-height: 1.5;
  }

  .message-date {
    width: 150px;
    color: #697987 !important;
    white-space: nowrap;
  }

  .message-actions {
    width: 170px;
    min-width: 170px;
    vertical-align: top !important;
    overflow: visible !important;
  }

  .message-action-menu {
    position: relative;
    width: 100%;
  }

  .message-action-summary {
    width: 100%;
    min-height: 38px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 0 12px;
    border: 1px solid #2a3945;
    border-radius: 9px;
    background: #111a22;
    color: #c5d0d8;
    font: inherit;
    font-size: 9px;
    font-weight: 850;
    letter-spacing: .02em;
    cursor: pointer;
    list-style: none;
    user-select: none;
    transition: border-color .16s ease, background .16s ease, color .16s ease;
  }

  .message-action-summary::-webkit-details-marker {
    display: none;
  }

  .message-action-summary::after {
    content: "⌄";
    color: #6f8391;
    font-size: 12px;
    transition: transform .16s ease;
  }

  .message-action-menu[open] .message-action-summary {
    border-color: rgba(94, 234, 212, .5);
    background: #13212a;
    color: #5eead4;
  }

  .message-action-menu[open] .message-action-summary::after {
    transform: rotate(180deg);
  }

  .message-action-dropdown {
    position: absolute;
    right: 0;
    bottom: calc(100% + 6px);
    z-index: 100;
    width: 210px;
    max-width: min(210px, calc(100vw - 32px));
    display: grid;
    gap: 5px;
    margin-top: 0;
    padding: 6px;
    border: 1px solid #263642;
    border-radius: 10px;
    background: #0c141b;
    box-shadow: 0 10px 28px rgba(0, 0, 0, .28);
  }

  .message-menu-btn {
    width: 100%;
    min-height: 34px;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 0 10px;
    border: 1px solid transparent;
    border-radius: 7px;
    background: transparent;
    color: #aebbc5;
    font: inherit;
    font-size: 9px;
    font-weight: 750;
    text-align: left;
    cursor: pointer;
  }

  .message-menu-btn:hover:not(:disabled) {
    border-color: #263b45;
    background: #14222b;
    color: #5eead4;
  }

  .message-menu-btn:disabled {
    opacity: .45;
    cursor: not-allowed;
  }

  .message-menu-btn.danger {
    color: #fca5a5;
  }

  .message-menu-btn.danger:hover:not(:disabled) {
    border-color: rgba(248, 113, 113, .25);
    background: rgba(248, 113, 113, .07);
    color: #fecaca;
  }

  .message-menu-icon {
    width: 18px;
    flex: 0 0 18px;
    text-align: center;
    font-size: 12px;
  }

  .message-action-row {
    display: block;
  }

  .message-icon-btn {
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #2a3945;
    border-radius: 8px;
    background: #111a22;
    color: #91a2af;
    font: inherit;
    font-size: 13px;
    font-weight: 800;
    line-height: 1;
    cursor: pointer;
    transition: border-color .16s ease, background .16s ease, color .16s ease, transform .16s ease;
  }

  .message-icon-btn:hover:not(:disabled) {
    border-color: #5eead4;
    background: #14232a;
    color: #5eead4;
    transform: translateY(-1px);
  }

  .message-icon-btn.is-important {
    border-color: rgba(245, 158, 11, .35);
    background: rgba(245, 158, 11, .08);
    color: #fbbf24;
  }

  .message-icon-btn.is-replied {
    border-color: rgba(45, 212, 191, .35);
    background: rgba(45, 212, 191, .08);
    color: #5eead4;
  }

  .message-icon-btn.danger {
    border-color: rgba(248, 113, 113, .25);
    color: #fca5a5;
  }

  .message-icon-btn.danger:hover:not(:disabled) {
    border-color: rgba(248, 113, 113, .6);
    background: rgba(248, 113, 113, .08);
    color: #fecaca;
  }

  .message-icon-btn:disabled {
    opacity: .45;
    cursor: not-allowed;
  }

  .message-action-btn {
    min-width: 92px;
    min-height: 34px;
    height: auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #2a3945;
    border-radius: 8px;
    background: #111a22;
    color: #aebbc5;
    font: inherit;
    font-size: 8px;
    font-weight: 850;
    cursor: pointer;
    white-space: nowrap;
  }

  .message-action-btn:hover:not(:disabled) {
    border-color: #5eead4;
    color: #5eead4;
  }

  .message-action-btn.danger {
    border-color: rgba(248, 113, 113, .22);
    color: #fca5a5;
  }

  .message-action-btn.danger:hover:not(:disabled) {
    border-color: rgba(248, 113, 113, .55);
    color: #fecaca;
  }

  .message-action-btn:disabled {
    opacity: .45;
    cursor: not-allowed;
  }

  .messages-empty {
    min-height: 230px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px;
    text-align: center;
  }

  .messages-empty-icon {
    width: 52px;
    height: 52px;
    display: grid;
    place-items: center;
    margin-bottom: 12px;
    border: 1px solid #263540;
    border-radius: 13px;
    background: #111a22;
    color: #5eead4;
    font-size: 20px;
  }

  .messages-empty strong {
    margin-bottom: 5px;
    color: #dce5eb;
    font-size: 14px;
  }

  .messages-empty span {
    max-width: 430px;
    color: #657583;
    font-size: 10px;
    line-height: 1.6;
  }

  .chat-query-grid {
    display: grid;
    gap: 9px;
  }

  .chat-query-card {
    display: grid;
    grid-template-columns: minmax(190px, .7fr) minmax(260px, 1fr) 155px 88px;
    gap: 15px;
    align-items: center;
    min-height: 86px;
    padding: 13px 14px;
    border: 1px solid #202d38;
    border-radius: 11px;
    background: #0a1117;
  }

  .chat-query-card:hover {
    background: #0d161e;
  }

  .chat-query-block {
    min-width: 0;
  }

  .chat-query-label {
    display: block;
    margin-bottom: 5px;
    color: #5f7180;
    font-size: 7px;
    font-weight: 850;
    letter-spacing: .11em;
    text-transform: uppercase;
  }

  .chat-query-text {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    color: #c1ccd4;
    font-size: 10px;
    line-height: 1.5;
  }

  .chat-query-user {
    color: #e7eef2;
    font-weight: 750;
  }

  .chat-query-date {
    color: #697987;
    font-size: 9px;
  }

  .chat-query-actions {
    display: flex;
    justify-content: flex-end;
  }

  .chat-query-actions .message-action-btn {
    width: 78px;
  }

  .messages-footer-note {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: 11px;
    padding: 0 3px;
    color: #596875;
    font-size: 9px;
    line-height: 1.5;
  }

  .messages-footer-note::before {
    content: "";
    width: 5px;
    height: 5px;
    flex: 0 0 5px;
    border-radius: 50%;
    background: #5eead4;
  }

  .message-row-clickable {
    cursor: pointer;
  }

  .message-row-clickable:focus-visible {
    outline: 2px solid rgba(94, 234, 212, .7);
    outline-offset: -2px;
  }

  .message-important-btn {
    width: 34px;
    height: 34px;
    flex: 0 0 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #2a3945;
    border-radius: 8px;
    background: #111a22;
    color: #667887;
    font-size: 16px;
    cursor: pointer;
  }

  .message-important-btn:hover {
    border-color: rgba(245, 158, 11, .55);
    color: #fbbf24;
  }

  .message-important-btn.is-important {
    border-color: rgba(245, 158, 11, .3);
    background: rgba(245, 158, 11, .08);
    color: #fbbf24;
  }

  .message-unread-row {
    background: rgba(245, 158, 11, .025);
  }

  .message-unread-row .message-name,
  .message-unread-row .message-subject {
    font-weight: 850;
  }

  .message-detail-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 22px;
    background: rgba(2, 6, 10, .78);
    backdrop-filter: blur(8px);
  }

  .message-detail-modal {
    width: min(820px, 100%);
    max-height: min(88vh, 780px);
    overflow: auto;
    border: 1px solid #2a3a47;
    border-radius: 18px;
    background: #0b1219;
    box-shadow: 0 28px 90px rgba(0, 0, 0, .48);
  }

  .message-detail-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    padding: 20px 22px;
    border-bottom: 1px solid #202d38;
  }

  .message-detail-heading {
    min-width: 0;
  }

  .message-detail-kicker {
    margin-bottom: 6px;
    color: #5eead4;
    font-size: 8px;
    font-weight: 850;
    letter-spacing: .14em;
    text-transform: uppercase;
  }

  .message-detail-header h3 {
    margin: 0;
    color: #edf3f7;
    font-size: 20px;
    font-weight: 850;
    line-height: 1.3;
    word-break: break-word;
  }

  .message-detail-close {
    width: 36px;
    height: 36px;
    flex: 0 0 36px;
    border: 1px solid #2a3945;
    border-radius: 9px;
    background: #111a22;
    color: #aebbc5;
    font-size: 18px;
    cursor: pointer;
  }

  .message-detail-close:hover {
    border-color: #5eead4;
    color: #5eead4;
  }

  .message-detail-body {
    padding: 20px 22px;
  }

  .message-detail-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 20px;
  }

  .message-detail-meta-item {
    min-width: 0;
    padding: 12px;
    border: 1px solid #202d38;
    border-radius: 10px;
    background: #0a1117;
  }

  .message-detail-meta-item span {
    display: block;
    margin-bottom: 5px;
    color: #5f7180;
    font-size: 7px;
    font-weight: 850;
    letter-spacing: .1em;
    text-transform: uppercase;
  }

  .message-detail-meta-item strong,
  .message-detail-meta-item a {
    color: #dce6ec;
    font-size: 10px;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  .message-detail-meta-item a {
    color: #67e8d8;
    text-decoration: none;
  }

  .message-detail-meta-item a:hover {
    text-decoration: underline;
  }

  .message-detail-content {
    padding: 16px;
    border: 1px solid #202d38;
    border-radius: 11px;
    background: #090f15;
  }

  .message-detail-content-label {
    margin-bottom: 10px;
    color: #5f7180;
    font-size: 7px;
    font-weight: 850;
    letter-spacing: .1em;
    text-transform: uppercase;
  }

  .message-detail-content-text {
    color: #c9d4dc;
    font-size: 12px;
    line-height: 1.8;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .message-detail-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 16px 22px;
    border-top: 1px solid #202d38;
  }

  .message-detail-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }

  .message-detail-status {
    color: #687989;
    font-size: 8px;
    font-weight: 750;
  }

  .messages-loading {
    min-height: 65vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: #71808e;
  }

  .messages-spinner {
    width: 29px;
    height: 29px;
    border: 3px solid #24313c;
    border-top-color: #5eead4;
    border-radius: 50%;
    animation: adminMessagesSpin .8s linear infinite;
  }

  .messages-loading strong {
    color: #cfd9df;
    font-size: 12px;
  }

  .messages-loading span {
    color: #637380;
    font-size: 9px;
  }

  @keyframes adminMessagesSpin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 1180px) {
    .admin-messages-container {
      width: min(100% - 32px, 1040px);
    }

    .messages-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .chat-query-card {
      grid-template-columns: minmax(180px, .7fr) minmax(250px, 1fr) 135px 82px;
    }
  }

  @media (max-width: 900px) {
    .admin-messages-main {
      padding-top: 26px;
    }

    .messages-page-header {
      align-items: flex-start;
      flex-direction: column;
    }

    .messages-header-actions {
      width: 100%;
    }

    .messages-header-btn {
      flex: 1;
    }

    .messages-toolbar {
      grid-template-columns: 1fr 1fr;
    }

    .messages-search {
      grid-column: 1 / -1;
    }

    .chat-query-card {
      grid-template-columns: 1fr 1fr;
    }

    .chat-query-actions {
      justify-content: flex-start;
    }
  }

  @media (max-width: 650px) {
    .message-detail-backdrop {
      align-items: flex-end;
      padding: 8px;
    }

    .message-detail-modal {
      max-height: 94vh;
      border-radius: 15px;
    }

    .message-detail-header,
    .message-detail-body,
    .message-detail-footer {
      padding-left: 15px;
      padding-right: 15px;
    }

    .message-detail-meta {
      grid-template-columns: 1fr;
    }

    .message-detail-footer {
      align-items: flex-start;
      flex-direction: column;
    }

    .message-detail-actions {
      width: 100%;
    }

    .message-detail-actions .message-action-btn {
      flex: 1;
    }

    .message-important-btn {
      width: 100%;
      height: 34px;
    }

    .admin-messages-container {
      width: calc(100% - 18px);
    }

    .messages-page-header h1 {
      font-size: 32px;
    }

    .messages-page-header p {
      font-size: 11px;
    }

    .messages-stats {
      grid-template-columns: 1fr;
    }

    .messages-panel {
      padding: 15px;
      border-radius: 13px;
    }

    .messages-panel-header {
      align-items: flex-start;
      flex-direction: column;
      gap: 11px;
    }

    .messages-panel-count {
      align-self: flex-start;
    }

    .messages-toolbar {
      grid-template-columns: 1fr;
    }

    .messages-search {
      grid-column: auto;
    }

    .messages-table-wrap {
      overflow: visible;
      border: 0;
      background: transparent;
    }

    .messages-table {
      min-width: 0;
      display: block;
    }

    .messages-table thead {
      display: none;
    }

    .messages-table tbody {
      display: grid;
      gap: 9px;
    }

    .messages-table tr {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0;
      padding: 13px;
      border: 1px solid #202d38;
      border-radius: 11px;
      background: #0a1117;
    }

    .messages-table td {
      width: auto !important;
      height: auto;
      min-height: 0;
      display: grid;
      grid-template-columns: 92px minmax(0, 1fr);
      gap: 9px;
      padding: 8px 0;
      border-bottom: 1px solid #19232c;
      vertical-align: middle;
    }

    .messages-table td:last-child {
      border-bottom: 0;
    }

    .messages-table td::before {
      color: #596b79;
      font-size: 7px;
      font-weight: 850;
      letter-spacing: .1em;
      text-transform: uppercase;
    }

    .message-status-cell::before { content: "Status"; }
    .message-name::before { content: "Name"; }
    .message-email::before { content: "Email"; }
    .message-subject::before { content: "Subject"; }
    .message-content::before { content: "Message"; }
    .message-date::before { content: "Date"; }
    .message-actions::before { content: "Actions"; }

    .message-status-cell,
    .message-name,
    .message-email,
    .message-subject,
    .message-content,
    .message-date,
    .message-actions {
      overflow: visible;
    }

    .message-email {
      white-space: normal;
      overflow-wrap: anywhere;
    }

    .message-content-text {
      -webkit-line-clamp: 4;
      line-clamp: 4;
    }

    .message-action-row {
      grid-template-columns: repeat(3, 34px);
      justify-content: start;
      gap: 7px;
    }

    .message-icon-btn {
      width: 34px;
      height: 34px;
    }

    .chat-query-card {
      grid-template-columns: 1fr;
      gap: 11px;
    }

    .chat-query-actions {
      padding-top: 9px;
      border-top: 1px solid #1c2731;
    }

    .chat-query-actions .message-action-btn {
      width: 100%;
    }
  }

  @media (max-width: 420px) {
    .messages-header-actions {
      flex-direction: column;
    }

    .messages-header-btn {
      width: 100%;
      flex: none;
    }

    .messages-panel {
      padding: 13px;
    }

    .messages-table td {
      grid-template-columns: 78px minmax(0, 1fr);
      gap: 7px;
    }

    .message-action-row {
      display: grid;
      grid-template-columns: repeat(3, 34px);
      gap: 7px;
      width: max-content;
    }

    .message-icon-btn {
      width: 34px;
      height: 34px;
    }
  }
`;

function AdminMessagesPage() {
  useDocumentTitle("Messages");

  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const [stats, setStats] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [messageSearch, setMessageSearch] = useState("");
  const [messageFilter, setMessageFilter] = useState("all");
  const [chatSearch, setChatSearch] = useState("");
  const messagesSectionRef = useRef(null);

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    const loadMessagesPage = async () => {
      try {
        setLoading(true);
        setError("");

        const [statsRes, messagesRes, chatsRes] = await Promise.all([
          fetchAdminStats(token),
          fetchMessages(token),
          fetchChatLogs(token),
        ]);

        setStats(statsRes);
        setMessages(Array.isArray(messagesRes) ? messagesRes : []);
        setChats(Array.isArray(chatsRes) ? chatsRes : []);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
          navigate("/admin/login");
          return;
        }

        setError(
          err.response?.data?.message ||
            err.message ||
            "Could not load messages.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadMessagesPage();
  }, [token, navigate]);

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  const formatDate = (iso) => {
    if (!iso) {
      return "—";
    }

    const date = new Date(iso);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleMessageActionError = (err, fallback) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      navigate("/admin/login");
      return true;
    }

    setError(err.response?.data?.message || fallback);
    return false;
  };

  const updateMessageLocally = (updatedMessage) => {
    setMessages((current) =>
      current.map((message) =>
        message._id === updatedMessage._id
          ? { ...message, ...updatedMessage }
          : message,
      ),
    );

    setSelectedMessage((current) =>
      current?._id === updatedMessage._id
        ? { ...current, ...updatedMessage }
        : current,
    );
  };

  const handleRead = async (id) => {
    const target = messages.find((message) => message._id === id);

    if (!target || target.read) {
      return;
    }

    try {
      setActionId(id);
      setError("");
      setSuccess("");

      const updated = await markMessageRead(id, token);
      updateMessageLocally(updated);

      setStats((current) =>
        current
          ? {
              ...current,
              unreadMessages: Math.max(
                0,
                Number(current.unreadMessages || 0) - 1,
              ),
            }
          : current,
      );

      setSuccess("Message marked as read.");
    } catch (err) {
      handleMessageActionError(err, "Failed to mark the message as read.");
    } finally {
      setActionId(null);
    }
  };

  const handleUnread = async (id) => {
    const target = messages.find((message) => message._id === id);

    if (!target || !target.read) {
      return;
    }

    try {
      setActionId(id);
      setError("");
      setSuccess("");

      const updated = await markMessageUnread(id, token);
      updateMessageLocally(updated);

      setStats((current) =>
        current
          ? {
              ...current,
              unreadMessages: Number(current.unreadMessages || 0) + 1,
            }
          : current,
      );

      setSuccess("Message marked as unread.");
    } catch (err) {
      handleMessageActionError(err, "Failed to mark the message as unread.");
    } finally {
      setActionId(null);
    }
  };

  const handleImportant = async (message) => {
    try {
      setActionId(message._id);
      setError("");
      setSuccess("");

      const updated = message.important
        ? await markMessageNotImportant(message._id, token)
        : await markMessageImportant(message._id, token);

      updateMessageLocally(updated);
      setSuccess(
        updated.important
          ? "Message marked as important."
          : "Message removed from important.",
      );
    } catch (err) {
      handleMessageActionError(err, "Failed to update message importance.");
    } finally {
      setActionId(null);
    }
  };

  const handleArchive = async (message) => {
    try {
      setActionId(message._id);
      setError("");
      setSuccess("");

      const updated = message.archived
        ? await unarchiveMessage(message._id, token)
        : await archiveMessage(message._id, token);

      updateMessageLocally(updated);

      setSuccess(
        updated.archived
          ? "Message archived successfully."
          : "Message restored from archive.",
      );
    } catch (err) {
      handleMessageActionError(err, "Failed to update message archive status.");
    } finally {
      setActionId(null);
    }
  };

  const handleReplyStatus = async (message) => {
    try {
      setActionId(message._id);
      setError("");
      setSuccess("");

      const updated = message.replied
        ? await markMessageNotReplied(message._id, token)
        : await markMessageReplied(message._id, token);

      updateMessageLocally(updated);

      setSuccess(
        updated.replied
          ? "Message marked as replied."
          : "Message marked as not replied.",
      );
    } catch (err) {
      handleMessageActionError(err, "Failed to update reply status.");
    } finally {
      setActionId(null);
    }
  };

  const handleOpenMessage = async (message) => {
    setError("");
    setSuccess("");
    setSelectedMessage(message);

    if (!message.read) {
      try {
        setActionId(message._id);
        const updated = await markMessageRead(message._id, token);
        updateMessageLocally(updated);

        setStats((current) =>
          current
            ? {
                ...current,
                unreadMessages: Math.max(
                  0,
                  Number(current.unreadMessages || 0) - 1,
                ),
              }
            : current,
        );
      } catch (err) {
        handleMessageActionError(
          err,
          "Message opened, but read status could not be updated.",
        );
      } finally {
        setActionId(null);
      }
    }

    try {
      setDetailLoading(true);
      const fullMessage = await fetchMessageById(message._id, token);
      setSelectedMessage(fullMessage);
    } catch (err) {
      if (!handleMessageActionError(err, "Failed to open the message.")) {
        setSelectedMessage(message);
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const closeMessageDetail = () => {
    if (!detailLoading) {
      setSelectedMessage(null);
    }
  };

  const handleDeleteMessage = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this message?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(id);
      setError("");
      setSuccess("");

      const target = messages.find((message) => message._id === id);

      await deleteMessage(id, token);

      setMessages((current) => current.filter((message) => message._id !== id));

      setStats((current) =>
        current
          ? {
              ...current,
              totalMessages: Math.max(
                0,
                Number(current.totalMessages || 0) - 1,
              ),
              unreadMessages: target?.read
                ? Number(current.unreadMessages || 0)
                : Math.max(0, Number(current.unreadMessages || 0) - 1),
            }
          : current,
      );

      setSuccess("Message deleted successfully.");
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
        return;
      }

      setError(err.response?.data?.message || "Failed to delete the message.");
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteChat = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this chat query?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(id);
      setError("");
      setSuccess("");

      await deleteChatLog(id, token);

      setChats((current) => current.filter((chat) => chat._id !== id));

      setStats((current) =>
        current
          ? {
              ...current,
              totalChats: Math.max(0, Number(current.totalChats || 0) - 1),
            }
          : current,
      );

      setSuccess("Chat query deleted successfully.");
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
        return;
      }

      setError(
        err.response?.data?.message || "Failed to delete the chat query.",
      );
    } finally {
      setActionId(null);
    }
  };

  const filteredMessages = useMemo(() => {
    const query = messageSearch.trim().toLowerCase();

    return messages.filter((message) => {
      const matchesSearch =
        !query ||
        [
          message.name,
          message.email,
          message.subject,
          message.message,
          message.category,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      const matchesFilter =
        messageFilter === "all" ||
        (messageFilter === "unread" && !message.read) ||
        (messageFilter === "read" && message.read) ||
        (messageFilter === "important" && Boolean(message.important)) ||
        (messageFilter === "replied" && Boolean(message.replied)) ||
        (messageFilter === "archived" && Boolean(message.archived));

      return matchesSearch && matchesFilter;
    });
  }, [messages, messageSearch, messageFilter]);

  const filteredChats = useMemo(() => {
    const query = chatSearch.trim().toLowerCase();

    return chats.filter((chat) => {
      if (!query) {
        return true;
      }

      return [chat.userMessage, chat.botReply]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [chats, chatSearch]);

  const selectMessageFilter = (filter) => {
    setMessageSearch("");
    setMessageFilter(filter);
    window.requestAnimationFrame(() => {
      messagesSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const unreadCount = Number(
    stats?.unreadMessages ?? messages.filter((message) => !message.read).length,
  );

  const importantCount = messages.filter((message) =>
    Boolean(message.important),
  ).length;

  if (loading) {
    return (
      <>
        <style>{messageStyles}</style>

        <div className="admin-shell">
          <AdminSidebar onLogout={logout} />

          <main className="admin-main">
            <div className="admin-messages-main">
              <div className="messages-loading">
                <div className="messages-spinner" />
                <strong>Loading messages</strong>
                <span>Preparing your communication workspace…</span>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{messageStyles}</style>

      <div className="admin-shell">
        <AdminSidebar onLogout={logout} />

        <main className="admin-main">
          <div className="admin-messages-main">
            <div className="admin-messages-container">
              <header className="messages-page-header">
                <div className="messages-page-header-copy">
                  <div className="messages-breadcrumb">
                    ADMIN PANEL / MESSAGES
                  </div>

                  <h1>Messages</h1>

                  <p>
                    Manage contact enquiries and monitor conversations received
                    through your portfolio website.
                  </p>
                </div>

                <div className="messages-header-actions">
                  <button
                    type="button"
                    className="messages-header-btn"
                    onClick={() => navigate("/admin")}
                  >
                    ← Dashboard
                  </button>

                  <button
                    type="button"
                    className="messages-header-btn"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </div>
              </header>

              {error && (
                <div className="messages-alert messages-alert-error">
                  <span>⚠</span>
                  <span>{error}</span>
                  <button type="button" onClick={() => setError("")}>
                    ×
                  </button>
                </div>
              )}

              {success && (
                <div className="messages-alert messages-alert-success">
                  <span>✓</span>
                  <span>{success}</span>
                  <button type="button" onClick={() => setSuccess("")}>
                    ×
                  </button>
                </div>
              )}

              <section
                className="messages-stats"
                aria-label="Message statistics"
              >
                <button
                  type="button"
                  className={`messages-stat is-clickable ${
                    messageFilter === "all" && !messageSearch ? "is-active" : ""
                  }`}
                  onClick={() => selectMessageFilter("all")}
                >
                  <div className="messages-stat-icon">✉</div>
                  <div className="messages-stat-copy">
                    <span>Total Messages</span>
                    <strong>{stats?.totalMessages ?? messages.length}</strong>
                  </div>
                </button>

                <button
                  type="button"
                  className={`messages-stat is-clickable ${
                    messageFilter === "unread" ? "is-active" : ""
                  }`}
                  onClick={() => selectMessageFilter("unread")}
                >
                  <div className="messages-stat-icon">●</div>
                  <div className="messages-stat-copy">
                    <span>Unread</span>
                    <strong>{unreadCount}</strong>
                  </div>
                </button>

                <button
                  type="button"
                  className={`messages-stat is-clickable ${
                    messageFilter === "read" ? "is-active" : ""
                  }`}
                  onClick={() => selectMessageFilter("read")}
                >
                  <div className="messages-stat-icon">◎</div>
                  <div className="messages-stat-copy">
                    <span>Read</span>
                    <strong>
                      {Math.max(0, messages.length - unreadCount)}
                    </strong>
                  </div>
                </button>

                <button
                  type="button"
                  className={`messages-stat is-clickable ${
                    messageFilter === "important" ? "is-active" : ""
                  }`}
                  onClick={() => selectMessageFilter("important")}
                >
                  <div className="messages-stat-icon">★</div>
                  <div className="messages-stat-copy">
                    <span>Important</span>
                    <strong>{importantCount}</strong>
                  </div>
                </button>

                <button
                  type="button"
                  className="messages-stat is-clickable"
                  onClick={() => {
                    window.requestAnimationFrame(() => {
                      document
                        .querySelector(".messages-chat-panel")
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                    });
                  }}
                >
                  <div className="messages-stat-icon">⌁</div>
                  <div className="messages-stat-copy">
                    <span>Chat Queries</span>
                    <strong>{stats?.totalChats ?? chats.length}</strong>
                  </div>
                </button>
              </section>

              <section
                ref={messagesSectionRef}
                className="messages-panel messages-contact-panel"
              >
                <div className="messages-panel-header">
                  <div className="messages-panel-title">
                    <span className="section-kicker">INBOX</span>
                    <h2>Contact Messages</h2>
                    <p>
                      Enquiries submitted from the Contact page of your
                      portfolio.
                    </p>
                  </div>

                  <div className="messages-panel-count">
                    {filteredMessages.length} shown
                  </div>
                </div>

                <div className="messages-toolbar">
                  <input
                    className="messages-search"
                    type="search"
                    value={messageSearch}
                    onChange={(event) => setMessageSearch(event.target.value)}
                    placeholder="Search name, email, subject or message…"
                    aria-label="Search messages"
                  />

                  <select
                    className="messages-filter"
                    value={messageFilter}
                    onChange={(event) => setMessageFilter(event.target.value)}
                    aria-label="Filter messages"
                  >
                    <option value="all">All messages</option>
                    <option value="unread">Unread only</option>
                    <option value="read">Read only</option>
                    <option value="important">Important only</option>
                    <option value="replied">Replied only</option>
                    <option value="archived">Archived only</option>
                  </select>

                  <button
                    type="button"
                    className="messages-header-btn"
                    onClick={() => {
                      setMessageSearch("");
                      setMessageFilter("all");
                    }}
                  >
                    Reset Filters
                  </button>
                </div>

                {filteredMessages.length === 0 ? (
                  <div className="messages-empty">
                    <div className="messages-empty-icon">✉</div>
                    <strong>
                      {messages.length
                        ? "No matching messages"
                        : "No contact messages yet"}
                    </strong>
                    <span>
                      {messages.length
                        ? "Try another search term or change the message filter."
                        : "Messages submitted through your portfolio contact form will appear here."}
                    </span>
                  </div>
                ) : (
                  <div className="messages-table-wrap">
                    <table className="messages-table">
                      <colgroup>
                        <col className="message-status-cell" />
                        <col className="message-name" />
                        <col className="message-email" />
                        <col className="message-subject" />
                        <col className="message-content" />
                        <col className="message-date" />
                        <col className="message-actions" />
                      </colgroup>

                      <thead>
                        <tr>
                          <th>Status</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Subject</th>
                          <th>Message</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredMessages.map((message) => (
                          <tr
                            key={message._id}
                            className={`message-row-clickable ${
                              !message.read ? "message-unread-row" : ""
                            }`}
                            onClick={() => handleOpenMessage(message)}
                            tabIndex={0}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                handleOpenMessage(message);
                              }
                            }}
                          >
                            <td className="message-status-cell">
                              <span
                                className={`message-status ${
                                  message.archived
                                    ? "message-status-archived"
                                    : message.replied
                                      ? "message-status-replied"
                                      : message.read
                                        ? "message-status-read"
                                        : "message-status-unread"
                                }`}
                              >
                                {message.archived
                                  ? "Archived"
                                  : message.replied
                                    ? "Replied"
                                    : message.read
                                      ? "Read"
                                      : "New"}
                              </span>
                            </td>

                            <td className="message-name">
                              {message.name || "—"}
                            </td>

                            <td className="message-email">
                              {message.email || "—"}
                            </td>

                            <td className="message-subject">
                              {message.subject || "No subject"}
                            </td>

                            <td className="message-content">
                              <span className="message-content-text">
                                {message.message || "No message content"}
                              </span>
                            </td>

                            <td className="message-date">
                              {formatDate(message.createdAt)}
                            </td>

                            <td
                              className="message-actions"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <details
                                className="message-action-menu"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <summary className="message-action-summary">
                                  Actions
                                </summary>

                                <div className="message-action-dropdown">
                                  <button
                                    type="button"
                                    className="message-menu-btn"
                                    disabled={actionId === message._id}
                                    onClick={() => handleOpenMessage(message)}
                                  >
                                    <span className="message-menu-icon">✉</span>
                                    Open message
                                  </button>

                                  <button
                                    type="button"
                                    className="message-menu-btn"
                                    disabled={actionId === message._id}
                                    onClick={() => handleImportant(message)}
                                  >
                                    <span className="message-menu-icon">★</span>
                                    {message.important
                                      ? "Remove important"
                                      : "Mark important"}
                                  </button>

                                  <button
                                    type="button"
                                    className="message-menu-btn"
                                    disabled={actionId === message._id}
                                    onClick={() =>
                                      message.read
                                        ? handleUnread(message._id)
                                        : handleRead(message._id)
                                    }
                                  >
                                    <span className="message-menu-icon">
                                      {message.read ? "○" : "●"}
                                    </span>
                                    {message.read ? "Mark unread" : "Mark read"}
                                  </button>

                                  <a
                                    className="message-menu-btn"
                                    href={`mailto:${message.email || ""}?subject=${encodeURIComponent(
                                      `Re: ${message.subject || "Your message"}`,
                                    )}`}
                                    onClick={() => {
                                      if (!message.replied) {
                                        handleReplyStatus(message);
                                      }
                                    }}
                                  >
                                    <span className="message-menu-icon">↩</span>
                                    Reply by email
                                  </a>

                                  <button
                                    type="button"
                                    className="message-menu-btn"
                                    disabled={actionId === message._id}
                                    onClick={() => handleReplyStatus(message)}
                                  >
                                    <span className="message-menu-icon">✓</span>
                                    {message.replied
                                      ? "Mark not replied"
                                      : "Mark replied"}
                                  </button>

                                  <button
                                    type="button"
                                    className="message-menu-btn"
                                    disabled={actionId === message._id}
                                    onClick={() => handleArchive(message)}
                                  >
                                    <span className="message-menu-icon">
                                      {message.archived ? "↩" : "⌄"}
                                    </span>
                                    {message.archived
                                      ? "Move to inbox"
                                      : "Archive"}
                                  </button>

                                  <button
                                    type="button"
                                    className="message-menu-btn danger"
                                    disabled={actionId === message._id}
                                    onClick={() =>
                                      handleDeleteMessage(message._id)
                                    }
                                  >
                                    <span className="message-menu-icon">×</span>
                                    Delete message
                                  </button>
                                </div>
                              </details>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="messages-panel messages-chat-panel">
                <div className="messages-panel-header">
                  <div className="messages-panel-title">
                    <span className="section-kicker">AI CHAT</span>
                    <h2>Chat Queries</h2>
                    <p>
                      User questions and the responses generated by your
                      portfolio chatbot.
                    </p>
                  </div>

                  <div className="messages-panel-count">
                    {filteredChats.length} shown
                  </div>
                </div>

                <div className="messages-toolbar">
                  <input
                    className="messages-search"
                    type="search"
                    value={chatSearch}
                    onChange={(event) => setChatSearch(event.target.value)}
                    placeholder="Search user questions or bot replies…"
                    aria-label="Search chat queries"
                  />

                  <button
                    type="button"
                    className="messages-header-btn"
                    onClick={() => setChatSearch("")}
                  >
                    Reset Search
                  </button>
                </div>

                {filteredChats.length === 0 ? (
                  <div className="messages-empty">
                    <div className="messages-empty-icon">◎</div>
                    <strong>
                      {chats.length
                        ? "No matching chat queries"
                        : "No chat queries yet"}
                    </strong>
                    <span>
                      {chats.length
                        ? "Try another search term."
                        : "Chatbot conversations will appear here when visitors use your AI assistant."}
                    </span>
                  </div>
                ) : (
                  <div className="chat-query-grid">
                    {filteredChats.map((chat) => (
                      <article className="chat-query-card" key={chat._id}>
                        <div className="chat-query-block">
                          <span className="chat-query-label">
                            Visitor Question
                          </span>
                          <span className="chat-query-text chat-query-user">
                            {chat.userMessage || "—"}
                          </span>
                        </div>

                        <div className="chat-query-block">
                          <span className="chat-query-label">Bot Reply</span>
                          <span className="chat-query-text">
                            {chat.botReply || "—"}
                          </span>
                        </div>

                        <div className="chat-query-block">
                          <span className="chat-query-label">Received</span>
                          <span className="chat-query-date">
                            {formatDate(chat.createdAt)}
                          </span>
                        </div>

                        <div className="chat-query-actions">
                          <button
                            type="button"
                            className="message-action-btn danger"
                            disabled={actionId === chat._id}
                            onClick={() => handleDeleteChat(chat._id)}
                          >
                            {actionId === chat._id ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <div className="messages-footer-note">
                Contact messages and chatbot queries are loaded directly from
                your portfolio backend.
              </div>
            </div>
          </div>
        </main>
      </div>

      {selectedMessage && (
        <div
          className="message-detail-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeMessageDetail();
            }
          }}
        >
          <section
            className="message-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="message-detail-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="message-detail-header">
              <div className="message-detail-heading">
                <div className="message-detail-kicker">Contact Message</div>
                <h3 id="message-detail-title">
                  {selectedMessage.subject || "No subject"}
                </h3>
              </div>

              <button
                type="button"
                className="message-detail-close"
                onClick={closeMessageDetail}
                aria-label="Close message"
              >
                ×
              </button>
            </header>

            <div className="message-detail-body">
              {detailLoading ? (
                <div className="messages-empty">
                  <div className="messages-spinner" />
                  <strong>Opening message…</strong>
                  <span>Loading the complete message details.</span>
                </div>
              ) : (
                <>
                  <div className="message-detail-meta">
                    <div className="message-detail-meta-item">
                      <span>From</span>
                      <strong>{selectedMessage.name || "—"}</strong>
                    </div>

                    <div className="message-detail-meta-item">
                      <span>Email</span>
                      <a href={`mailto:${selectedMessage.email || ""}`}>
                        {selectedMessage.email || "—"}
                      </a>
                    </div>

                    <div className="message-detail-meta-item">
                      <span>Received</span>
                      <strong>{formatDate(selectedMessage.createdAt)}</strong>
                    </div>

                    <div className="message-detail-meta-item">
                      <span>Category</span>
                      <strong>{selectedMessage.category || "General"}</strong>
                    </div>

                    <div className="message-detail-meta-item">
                      <span>Status</span>
                      <strong>
                        {selectedMessage.archived
                          ? "Archived"
                          : selectedMessage.replied
                            ? "Replied"
                            : selectedMessage.read
                              ? "Read"
                              : "New"}
                      </strong>
                    </div>

                    <div className="message-detail-meta-item">
                      <span>Email Delivery</span>
                      <strong>
                        {selectedMessage.emailDelivery?.status || "pending"}
                      </strong>
                    </div>
                  </div>

                  <div className="message-detail-content">
                    <div className="message-detail-content-label">Message</div>
                    <div className="message-detail-content-text">
                      {selectedMessage.message || "No message content"}
                    </div>
                  </div>
                </>
              )}
            </div>

            {!detailLoading && (
              <footer className="message-detail-footer">
                <div className="message-detail-actions">
                  <button
                    type="button"
                    className={`message-important-btn ${
                      selectedMessage.important ? "is-important" : ""
                    }`}
                    disabled={actionId === selectedMessage._id}
                    onClick={() => handleImportant(selectedMessage)}
                    title={
                      selectedMessage.important
                        ? "Remove important"
                        : "Mark important"
                    }
                    aria-label={
                      selectedMessage.important
                        ? "Remove important"
                        : "Mark important"
                    }
                  >
                    ★
                  </button>

                  {selectedMessage.read ? (
                    <button
                      type="button"
                      className="message-action-btn"
                      disabled={actionId === selectedMessage._id}
                      onClick={() => handleUnread(selectedMessage._id)}
                    >
                      Mark Unread
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="message-action-btn"
                      disabled={actionId === selectedMessage._id}
                      onClick={() => handleRead(selectedMessage._id)}
                    >
                      Mark Read
                    </button>
                  )}

                  <a
                    className="message-action-btn"
                    href={`mailto:${selectedMessage.email || ""}?subject=${encodeURIComponent(
                      `Re: ${selectedMessage.subject || "Your message"}`,
                    )}`}
                  >
                    Reply by Email
                  </a>

                  <button
                    type="button"
                    className="message-action-btn"
                    disabled={actionId === selectedMessage._id}
                    onClick={() => handleReplyStatus(selectedMessage)}
                  >
                    {selectedMessage.replied ? "Not Replied" : "Mark Replied"}
                  </button>

                  <button
                    type="button"
                    className="message-action-btn"
                    disabled={actionId === selectedMessage._id}
                    onClick={() => handleArchive(selectedMessage)}
                  >
                    {selectedMessage.archived ? "Unarchive" : "Archive"}
                  </button>

                  <button
                    type="button"
                    className="message-action-btn danger"
                    disabled={actionId === selectedMessage._id}
                    onClick={async () => {
                      await handleDeleteMessage(selectedMessage._id);
                      setSelectedMessage(null);
                    }}
                  >
                    Delete
                  </button>
                </div>

                <span className="message-detail-status">
                  {selectedMessage.important ? "★ Important · " : ""}
                  {selectedMessage.archived
                    ? "Archived"
                    : selectedMessage.replied
                      ? "Replied"
                      : selectedMessage.read
                        ? "Read"
                        : "New"}
                </span>
              </footer>
            )}
          </section>
        </div>
      )}
    </>
  );
}

export default AdminMessagesPage;
