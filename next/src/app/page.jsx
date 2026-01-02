'use client';
import React, { useState, useEffect } from 'react';
import '../style/app/page.scss';

import { getVal } from '../hooks/display';
import { master } from '../hooks/master';
import { useTaskEditor } from '../hooks/useTaskEditor';
import { useGanttDerived } from '../hooks/useGanttDerived';

import GanttChart from '../components/GanttChart';
import TaskList from '../components/TaskList.jsx';
import TaskAddTable from '../components/TaskAddTable.jsx';
import DailyReportModal from '../components/DailyReportModal.jsx';

export default function Page({ setModal }) {
    /**
     * 表示カラム
     */
    const column = [
        { id: 1, label: 'name', name: 'タスク名', type: 'text' },
        { id: 2, label: 'project_id', name: 'プロジェクトID', type: 'id' },
        { id: 3, label: 'complete_ratio', name: '進捗率(%)', type: 'number' },
        { id: 4, label: 'time', name: '工数(h)', type: 'number' },
        { id: 5, label: 'task_status', name: '状態ID', type: 'id' },
        { id: 6, label: 'start_date', name: '開始日', type: 'date' },
        { id: 7, label: 'end_date', name: '終了日', type: 'date' },
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
                <h1>Dashboard</h1>
                <button className='c-btn' onClick={openDailyReport}>
                    日報作成
                </button>
            </div>

            <GanttChart
                tasks={tasks}
                master={master}
            />
            <TaskList
                column={column}
                listGroups={listGroups}
                master={master}
                getVal={getVal}
                editingId={editingId}
                startEdit={startEdit}
                cancelEdit={cancelEdit}
                onChangeEdit={onChangeEdit}
                saveEdit={saveEdit}
                deleteTask={deleteTask}
            />
            <TaskAddTable
                column={column}
                draftRows={draftRows}
                addDraftRow={addDraftRow}
                removeDraftRow={removeDraftRow}
                onChangeDraft={onChangeDraft}
                commitDraftRows={commitDraftRows}
            />
            <DailyReportModal
                isOpen={isDailyReportOpen}
                onClose={closeDailyReport}
                listGroups={listGroups}
                // onSubmit={() => { ...投稿処理... }} // 必要なら
            />
        </main>
    );
}