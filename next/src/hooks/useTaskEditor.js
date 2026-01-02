'use client';

import { useState } from 'react';

export function useTaskEditor() {
    const [tasks, setTasks] = useState([]);
    const [editingId, setEditingId] = useState(null);

    // --- 追加テーブル（ドラフト行） ---
    const blankDraft = () => ({
        project_id: 1,
        name: '',
        complete_ratio: 0,
        task_status: 1,
        start_date: '',
        end_date: '',
        time: '',
        __tmpid: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
    });

    const [draftRows, setDraftRows] = useState([blankDraft()]);

    const toNumOr = (v, fallback = 0) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : fallback;
    };

    const sanitizeTask = (t) => ({
        ...t,
        project_id: toNumOr(t.project_id, 1),
        complete_ratio: Math.max(0, Math.min(100, toNumOr(t.complete_ratio, 0))),
        task_status: toNumOr(t.task_status, 1),
        time: String(t.time ?? '').trim(), // 工数は文字列維持
    });

    // ===== 既存行編集 =====
    const startEdit = (id) => setEditingId(id);
    const cancelEdit = () => setEditingId(null);

    const onChangeEdit = (id, key, value) => {
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, [key]: value } : t)));
    };

    const validateTask = (t) => {
        if (!t?.name?.trim()) return 'タスク名を入力してください';
        if (t.start_date && t.end_date && new Date(t.start_date) > new Date(t.end_date)) {
        return '開始日は終了日以前にしてください';
        }
        return null;
    };

    const saveEdit = (id) => {
        const target = tasks.find((t) => t.id === id);
        if (!target) return { ok: false, message: '対象タスクが見つかりません' };

        const err = validateTask(target);
        if (err) return { ok: false, message: err };

        setTasks((prev) => prev.map((t) => (t.id === id ? sanitizeTask(t) : t)));
        setEditingId(null);
        return { ok: true };
    };

    const deleteTask = (id, { confirmFn = confirm } = {}) => {
        if (!confirmFn('このタスクを削除しますか？')) return { ok: false, cancelled: true };
        setTasks((prev) => prev.filter((t) => t.id !== id));
        if (editingId === id) setEditingId(null);
        return { ok: true };
    };

    // ===== 追加テーブル（ドラフト） =====
    const addDraftRow = () => setDraftRows((prev) => [...prev, blankDraft()]);

    const removeDraftRow = (tmpid) => {
        setDraftRows((prev) => (prev.length <= 1 ? [blankDraft()] : prev.filter((r) => r.__tmpid !== tmpid)));
    };

    const onChangeDraft = (tmpid, key, value) => {
        setDraftRows((prev) => prev.map((r) => (r.__tmpid === tmpid ? { ...r, [key]: value } : r)));
    };

    const commitDraftRows = ({ alertFn = alert } = {}) => {
        // バリデーション（元のPageと同じ）
        const errs = [];
        draftRows.forEach((r, idx) => {
        if (!r.name?.trim()) errs.push(`${idx + 1}行目: タスク名`);
        if (!r.start_date) errs.push(`${idx + 1}行目: 開始日`);
        if (!r.end_date) errs.push(`${idx + 1}行目: 終了日`);
        if (r.start_date && r.end_date && new Date(r.start_date) > new Date(r.end_date)) {
            errs.push(`${idx + 1}行目: 開始日は終了日以前`);
        }
        });

        if (errs.length) {
        alertFn('入力を確認してください：\n' + errs.join('\n'));
        return { ok: false, message: 'validation_error', errors: errs };
        }

        // ID採番
        const maxId = tasks.length ? Math.max(...tasks.map((t) => t.id)) : 0;
        let nextId = maxId;

        const newOnes = draftRows.map((r) => sanitizeTask({ ...r, id: ++nextId }));
        setTasks((prev) => [...prev, ...newOnes]);

        // クリア
        setDraftRows([blankDraft()]);
        alertFn('追加しました');

        return { ok: true, added: newOnes.length };
    };

    // 便利：外から tasks を置き換えたい場合（将来API連携など）
    const replaceTasks = (next) => setTasks(Array.isArray(next) ? next : []);

    return {
        // data
        tasks,
        editingId,
        draftRows,

        // edit handlers
        startEdit,
        cancelEdit,
        onChangeEdit,
        saveEdit,
        deleteTask,

        // draft handlers
        addDraftRow,
        removeDraftRow,
        onChangeDraft,
        commitDraftRows,

        // misc
        replaceTasks,
    };
}
