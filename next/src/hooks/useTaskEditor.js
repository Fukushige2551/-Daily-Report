'use client';

import { useState } from 'react';

export function useTaskEditor() {
    const [tasks, setTasks] = useState([]);

    /**
     * プロジェクト
     */
    const [projectRow, setProjectRow] = useState([]);
    const maxId = projectRow?.length ? Math.max(...projectRow.map(g => g.id)) : 0

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

    // プロジェクト追加
    const onAddProjectRow = (id) => setProjectRow((prev) => [...prev, { ...blankDraft(), id }]);

    // プロジェクト削除
    const onDeleteProjectRow = (id) => setProjectRow((prev) => prev.filter((t) => t.id !== id));

    // プロジェクト編集
    const onChangeProjectEdit = (id, key, value) =>
        setProjectRow((prev) => prev.map((t) => (t.id === id ? { ...t, [key]: value } : t)));

    return {
        tasks,
        projectRow,
        maxId,

        onChangeProjectEdit,
        onAddProjectRow,
        onDeleteProjectRow,
    };
}
