'use client';

import { useState } from 'react';

export function useTaskEditor() {
    /**
     * プロジェクト
     */
    const [projectRow, setProjectRow] = useState([]);
    const maxId = projectRow?.length ? Math.max(...projectRow.map(g => g.id)) : 0

    // 追加プロジェクトの型
    const blankProjectDraft = () => ({
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
    const onAddProjectRow = (id) => setProjectRow((prev) => [...prev, { ...blankProjectDraft(), id }]);

    // プロジェクト削除
    const onDeleteProjectRow = (id) => {
        setProjectRow((prev) => prev.filter((t) => t.id !== id));
        setTasks((prev) => prev.filter((t) => t.project_id !== id));
    };

    // プロジェクト編集
    const onChangeProjectEdit = (id, key, value) =>
        setProjectRow((prev) => prev.map((t) => (t.id === id ? { ...t, [key]: value } : t)));

    /**
     * タスク
     */
    const [tasks, setTasks] = useState([]);
    // 今日の日付
    const formatted = new Date().toISOString().slice(0, 10);

    // 追加タスクの型
    const blankTaskDraft = () => ({
        id: 1,
        project_id: 1,
        name: '',
        complete_ratio: 0,
        task_status: 1,
        start_date: formatted,
        end_date: formatted,
        time: 8,
    });

    const onAddTaskRow = (task) => setTasks((prev) => [...prev, { ...blankTaskDraft(), ...task }]);

    return {
        tasks,
        projectRow,
        maxId,

        onChangeProjectEdit,
        onAddProjectRow,
        onDeleteProjectRow,
        onAddTaskRow,
    };
}
