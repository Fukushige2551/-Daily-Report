'use client';

import React, { useMemo, useState } from 'react';

export default function GanttChart({ tasks = [], master = {} }) {
    /**
     * 日付の取得
     */
    const parseDate = (s) => {
        const [y, m, d] = String(s).split('-').map(Number);
        return new Date(y, (m || 1) - 1, d || 1);
    };
    const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const addMonths = (date, n) => new Date(date.getFullYear(), date.getMonth() + n, 1);

    // タスクの日付を取得
    const tasksD = useMemo(
        () =>
            tasks.map((t) => ({
            ...t,
            _start: t.start_date ? parseDate(t.start_date) : null,
            _end: t.end_date ? parseDate(t.end_date) : null,
            })),
        [tasks]
    );

    // 初期表示月の算出
    const initialMonthStart = useMemo(() => {
        const withStart = tasksD.filter((t) => t._start);
        if (withStart.length === 0) return startOfMonth(new Date());

        const rawMin = new Date(Math.min(...withStart.map((t) => t._start.getTime())));
        return startOfMonth(rawMin);
    }, [tasksD]);

    /**
     * ガントチャート表示処理
     */
    const [viewStart, setViewStart] = useState(initialMonthStart);
    const viewEnd = useMemo(() => endOfMonth(viewStart), [viewStart]);

    // 表示日リストの作成
    const days = useMemo(() => {
        const list = [];

        for (let d = new Date(viewStart); d <= viewEnd; d.setDate(d.getDate() + 1)) {
            list.push(new Date(d));
        }

        return list;
    }, [viewStart, viewEnd]);

    // 日付からインデックスを取得
    const dayIndex = (date) =>
        Math.floor((date.getTime() - viewStart.getTime()) / (24 * 60 * 60 * 1000));

        const monthGroups = useMemo(() => {
            return [
                {
                key: `${viewStart.getFullYear()}-${viewStart.getMonth() + 1}`,
                label: `${viewStart.getFullYear()}/${String(viewStart.getMonth() + 1).padStart(2, '0')}`,
                span: days.length,
                },
            ];
    }, [viewStart, days.length]);

    // 曜日判定
    const wday = ['日', '月', '火', '水', '木', '金', '土'];
    const isSunday = (d) => d.getDay() === 0;
    const isSaturday = (d) => d.getDay() === 6;

    // 表示タスクの抽出
    const visibleTasks = useMemo(() => {
        return tasksD
            .map((t) => {
            if (!t._start || !t._end) return null;
            if (t._end < viewStart || t._start > viewEnd) return null;

            const clampedStart = t._start < viewStart ? viewStart : t._start;
            const clampedEnd = t._end > viewEnd ? viewEnd : t._end;
            return { ...t, _startV: clampedStart, _endV: clampedEnd };
            })
            .filter(Boolean);
    }, [tasksD, viewStart, viewEnd]);

    // プロジェクトごとへグルーピング & 並び替え
    const ganttGroups = useMemo(() => {
        const map = new Map();
        visibleTasks.forEach((t) => {
            const pid = t.project_id;
            if (!map.has(pid)) map.set(pid, []);
            map.get(pid).push(t);
        });

        const entries = [...map.entries()].sort((a, b) => a[0] - b[0]); // project_id昇順
        entries.forEach(([_, arr]) => {
            arr.sort((a, b) => (a._startV - b._startV) || (a.id - b.id));
        });

        return entries; // [ [project_id, Task[]], ... ]
    }, [visibleTasks]);

    /**
     * ページ操作
     */
    // 当月データ取得
    const getMonthData = async (date) => {
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        const data = tasksD.filter(
            (t) => t._start && t._end && !(t._end < monthStart || t._start > monthEnd)
        );
        return data;
    };

    // 前月
    const handlePrev = async () => {
        const nextStart = addMonths(viewStart, -1);
        setViewStart(nextStart);
        await getMonthData(nextStart);
    };
    // 次月
    const handleNext = async () => {
        const nextStart = addMonths(viewStart, 1);
        setViewStart(nextStart);
        await getMonthData(nextStart);
    };

    return (
        <section className='p-app__section'>
            <h2 className='p-app__section__title'>ガントチャート</h2>

            {/* 月ページング */}
            <div
                className='wbs__controls'
                style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: 12 }}
            >
            <button type='button' onClick={handlePrev} aria-label='前の月へ'>
                ←
            </button>
            <div>
                {viewStart.getFullYear()} / {String(viewStart.getMonth() + 1).padStart(2, '0')}
            </div>
            <button type='button' onClick={handleNext} aria-label='次の月へ'>
                →
            </button>
            </div>

            <div className='p-app__section__main wbs'>
                <table className='c-table wbs__table'>
                    <thead>
                    <tr>
                        {monthGroups.map((g, i) => (
                        <th key={i} colSpan={g.span} className='c-th--month'>
                            {g.label}
                        </th>
                        ))}
                    </tr>
                    <tr>
                        {days.map((d, i) => {
                            let day = 'default';
                            switch (true) {
                                case isSunday(d):
                                day = 'sunday';
                                break;
                                case isSaturday(d):
                                day = 'saturday';
                                break;
                            }
                            return (
                                <th
                                key={i}
                                className={`c-th--${day}`}
                                title={`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
                                    d.getDate()
                                ).padStart(2, '0')}(${wday[d.getDay()]})`}
                                >
                                {d.getDate()}
                                </th>
                            );
                        })}
                    </tr>
                    </thead>

                    <tbody>
                    {ganttGroups.length === 0 && (
                        <tr>
                            <td colSpan={days.length} style={{ textAlign: 'center' }}>
                                この月に該当するタスクはありません
                            </td>
                        </tr>
                    )}

                    {ganttGroups.map(([pid, arr]) => {
                        const projectName = master?.project_id?.[pid] ?? `Project ${pid}`;
                        return (
                            <React.Fragment key={`g-${pid}`}>
                                {/* プロジェクト見出し行 */}
                                <tr>
                                    <td className='c-td--parent' colSpan={days.length}>
                                        {projectName}
                                    </td>
                                </tr>

                                {/* プロジェクト内タスク行 */}
                                {arr.map((t, i) => {
                                const pre = Math.max(0, dayIndex(t._startV));
                                const span = Math.max(1, dayIndex(t._endV) - dayIndex(t._startV) + 1);
                                const post = Math.max(0, days.length - pre - span);
                                const title = `${t.name}`;

                                return (
                                    <tr key={`g-${pid}-${t.id}-${i}`}>
                                    {pre > 0 && <td colSpan={pre}></td>}
                                    <td colSpan={span}>
                                        <div className='wbs__title'>{title}</div>
                                        <div className={`wbs__bar status-${t.task_status}`}>
                                        <div
                                            className='wbs__bar__fill'
                                            style={{ width: `${t.complete_ratio}%` }}
                                        />
                                        </div>
                                    </td>
                                    {post > 0 && <td colSpan={post}></td>}
                                    </tr>
                                );
                                })}
                            </React.Fragment>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}