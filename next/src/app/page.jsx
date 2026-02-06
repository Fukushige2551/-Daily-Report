'use client';
import React, { useState, useEffect } from 'react';
import '../style/app/page.scss';

import { useTaskEditor } from '../hooks/useTaskEditor';
import { useGanttDerived } from '../hooks/useGanttDerived';

import GanttChart from '../components/GanttChart';
import TaskList from '../components/TaskList.jsx';
import DailyReportModal from '../components/DailyReportModal.jsx';

export default function Page({ setModal }) {
    /**
     * 表示カラム
     */
    const column = [
        { id: 1, label: 'project_id', name: 'プロジェクト名', type: 'text' },
        { id: 2, label: 'name', name: 'タスク名', type: 'text' },
        { id: 3, label: 'description', name: '内容', type: 'text' },
        { id: 4, label: 'start_date', name: '開始日', type: 'date' },
        { id: 5, label: 'end_date', name: '終了日', type: 'date' },
        { id: 6, label: 'task_status', name: '状態', type: 'id' },
        { id: 7, label: 'complete_ratio', name: '進捗（%)', type: 'number' },
        { id: 8, label: 'time', name: '工数 (h)', type: 'number' },
    ];

    /**
     * 日報作成
     */
    const [isDailyReportOpen, setIsDailyReportOpen] = useState(false);

    // 日報モーダルを開く
    const openDailyReport = () => {
        setIsDailyReportOpen(true);
        setModal(true); // もし「背景ロック」など Page側の modal 管理が必要なら
    };

    // 日報モーダルを閉じる
    const closeDailyReport = () => {
        setIsDailyReportOpen(false);
        setModal(false);
    };

    /**
     * タスク編集フック
     */
    const {
        // data
        tasks,
        projectRow,

        // handlers
        onChangeProjectEdit,
        onAddProjectRow,
        onDeleteProjectRow,
        onAddTaskRow,
        onChangeTaskEdit,
        onDeleteTaskRow,
    } = useTaskEditor();

    /**
     * ガントチャートフック
     */
    const [viewStart, setViewStart] = useState(null);
    const { initialMonthStart, listGroups } = useGanttDerived(tasks, viewStart);

    useEffect(() => {
        if (!viewStart) setViewStart(initialMonthStart);
    }, [viewStart, initialMonthStart]);

    /**
     * DOM
     */
    return (
        <main className='p-app'>
            <div className='p-app__top'>
                {/* <h1>Dashboard</h1> */}
                <h1></h1>
                <button className='c-btn c-btn--create' onClick={openDailyReport}>
                    日報作成
                </button>
            </div>

            <TaskList
                projectRow={projectRow}
                tasks={tasks}
                column={column}
                onChangeProjectEdit={onChangeProjectEdit}
                onAddProjectRow={onAddProjectRow}
                onDeleteProjectRow={onDeleteProjectRow}
                onAddTaskRow={onAddTaskRow}
                onChangeTaskEdit={onChangeTaskEdit}
                onDeleteTaskRow={onDeleteTaskRow}
            />
            <GanttChart
                tasks={tasks}
            />
            <DailyReportModal
                listGroups={listGroups}
                isOpen={isDailyReportOpen}
                onClose={closeDailyReport}
            />
        </main>
    );
}