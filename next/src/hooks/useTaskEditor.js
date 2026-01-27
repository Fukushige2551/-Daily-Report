'use client';

import { useState } from 'react';

export function useTaskEditor() {
    const [tasks, setTasks] = useState([]);
    const [editingId, setEditingId] = useState(null);

    // --- 追加テーブル（ドラフト行） ---
    const blankDraft = () => ({
        id: '',
        project_id: '',
        name: '',
        complete_ratio: '',
        task_status: 1,
        start_date: '',
        end_date: '',
        time: '',
    });

    const [projectRow, setProjectRow] = useState([]);
    const maxId = projectRow?.length ? Math.max(...projectRow.map(g => g.id)) : 0

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

    const onChangeProjectEdit = (id, key, value) => {
        setProjectRow((prev) => prev.map((t) => (t.id === id ? { ...t, [key]: value } : t)));
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
    const onAddProjectRow = (id) => setProjectRow((prev) => [...prev, { ...blankDraft(), id }]);
    const onDeleteProjectRow = (id) => setProjectRow((prev) => prev.filter((t) => t.id !== id));

    // 便利：外から tasks を置き換えたい場合（将来API連携など）
    const replaceTasks = (next) => setTasks(Array.isArray(next) ? next : []);

    return {
        // data
        tasks,
        editingId,
        projectRow,
        maxId,

        // edit handlers
        startEdit,
        cancelEdit,
        onChangeProjectEdit,
        saveEdit,
        deleteTask,

        // draft handlers
        onAddProjectRow,
        onDeleteProjectRow,
        // misc
        replaceTasks,
    };
}
