'use client';
import React from 'react';
import '../style/app/page.scss';
import { getVal } from '@/js/display';
import { master } from '@/js/master';

export default function Page() {
    /** data */
    const tasks = [
        { project_id: 1, name: '要件定義',     complete_ratio: 100, task_status: 3, start_date: '2025-10-1',  end_date: '2025-10-7',  time: '40' },
        { project_id: 1, name: '見積もり作成', complete_ratio: 80,  task_status: 1, start_date: '2025-10-7',  end_date: '2025-10-10', time: '24' },
        { project_id: 1, name: 'スケジュール作成', complete_ratio: 0, task_status: 1, start_date: '2025-10-10', end_date: '2025-10-12', time: '16' },
        { project_id: 2, name: '要件定義',     complete_ratio: 40, task_status: 1, start_date: '2025-10-7',  end_date: '2025-10-14', time: '40' },
        { project_id: 2, name: '見積もり作成', complete_ratio: 0, task_status: 1, start_date: '2025-10-14', end_date: '2025-10-17', time: '24' },
        { project_id: 3, name: '要件定義',     complete_ratio: 20,  task_status: 1, start_date: '2025-10-8',  end_date: '2025-10-18',  time: '48' },
        { project_id: 3, name: '見積もり作成',     complete_ratio: 0,  task_status: 1, start_date: '2025-10-18',  end_date: '2025-10-21',  time: '48' },
    ];
    const column = [
        { id: 1, label: 'name',           name: 'タスク名', type: 'text'   },
        { id: 2, label: 'complete_ratio', name: '進捗率',   type: 'number' },
        { id: 3, label: 'task_status',    name: '状態',     type: 'id'     },
        { id: 4, label: 'start_date',     name: '開始日',   type: 'date'   },
        { id: 5, label: 'end_date',       name: '終了日',   type: 'date'   },
        { id: 6, label: 'time',           name: '工数',     type: 'number' },
    ];
    const shownProjects = new Set();

    /** ---------- ガント用ユーティリティ ---------- */
    const parseDate = (s) => {
        const [y, m, d] = s.split('-').map(Number);
        return new Date(y, (m || 1) - 1, d || 1);
    };
    const tasksD = tasks.map(t => ({
        ...t,
        _start: parseDate(t.start_date),
        _end: parseDate(t.end_date),
    }));
    const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth   = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const rawMin = new Date(Math.min(...tasksD.map(t => t._start.getTime())));
    const rawMax = new Date(Math.max(...tasksD.map(t => t._end.getTime())));
    const minDate = startOfMonth(rawMin);
    const maxDate = endOfMonth(rawMax);

    // 期間（日単位・両端含む）
    const days = [];
    for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
        days.push(new Date(d));
    }
    const dayIndex = (date) =>
        Math.floor((date.getTime() - minDate.getTime()) / (24 * 60 * 60 * 1000));

    // 月ヘッダまとめ
    const monthGroups = (() => {
        const groups = [];
        let cur = null;
        days.forEach(d => {
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        const label = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!cur || cur.key !== key) {
            cur = { key, label, span: 1 };
            groups.push(cur);
        } else {
            cur.span += 1;
        }
        });
        return groups;
    })();
    const wday = ['日','月','火','水','木','金','土'];
    const isSunday = (d) => d.getDay() === 0;
    const isSaturday = (d) => d.getDay() === 6;

    return (
        <main className='p-app'>
            <h1>Dashboard</h1>

            {/* ガントチャート */}
            <section className='p-app__section'>
                <h2 className='p-app__section__title'>ガントチャート</h2>
                <div className='p-app__section__main wbs'>
                    <table className='c-table wbs__table'>
                        <thead>
                            <tr>
                                {days.map((d, i) => {
                                    let day = 'default';
                                    switch (true) {
                                        case isSunday(d):
                                            day = 'sunday'
                                            break
                                        case isSaturday(d):
                                            day = 'saturday'
                                            break
                                    }

                                    return <th
                                        key={i}
                                        className={`c-th--${day}`}
                                        title={`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}(${wday[d.getDay()]})`}
                                    >
                                        {d.getDate()}
                                    </th>
                                })}
                            </tr>
                        </thead>

                        <tbody>
                        {tasksD.map((t, i) => {
                            const projectName = (master.project_id && master.project_id[t.project_id]) || `Project ${t.project_id}`;
                            const pre = Math.max(0, dayIndex(t._start));
                            const span = Math.max(1, dayIndex(t._end) - dayIndex(t._start) + 1);
                            const post = Math.max(0, days.length - pre - span);
                            const title = `${projectName}: ${t.name}`;

                            return (
                            <tr key={i}>
                                {/* 余白 */}
                                {pre > 0 && <td colSpan={pre}></td>}

                                <td colSpan={span}>
                                    <div className='wbs__title'>{`${title}`}</div>
                                    <div className={`wbs__bar status-${t.task_status}`}>
                                        <div className='wbs__bar__fill' style={{ width: `${t.complete_ratio}%` }} />
                                    </div>
                                </td>

                                {/* 余白 */}
                                {post > 0 && <td className='' colSpan={post}></td>}
                            </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* タスク一覧（既存） */}
            <section className='p-app__section'>
                <h2 className='p-app__section__title'>タスク一覧</h2>
                <div className='p-app__section__main task'>
                    <table className='c-table'>
                        <thead>
                        <tr>
                            {column.map(({ id, name }) => <th key={id}>{name}</th>)}
                        </tr>
                        </thead>
                        <tbody>
                        {tasks.length > 0 && tasks.map((t, i) => {
                            const project = master.project_id[t.project_id];
                            const isFirst = !shownProjects.has(t.project_id);
                            if (isFirst) shownProjects.add(t.project_id);

                            return (
                            <React.Fragment key={`${t.project_id}-${t.name}-${i}`}>
                                {isFirst && (
                                <tr>
                                    <td className='c-td--parent'>{project}</td>
                                    {column.map(({ id, label }) =>
                                    label !== 'name' ? <td key={id} className='c-td--parent'></td> : null
                                    )}
                                </tr>
                                )}
                                <tr>
                                {column.map(({ id, label, type }) => {
                                    if (t[label] === undefined || t[label] === null) return <td key={id}></td>;
                                    const value = getVal(t[label], label, type);
                                    return <td key={id} className={`c-td--${type} c-td--child`}>{value}</td>;
                                })}
                                </tr>
                            </React.Fragment>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    );
}