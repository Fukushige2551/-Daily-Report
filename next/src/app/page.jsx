'use client';
import React, { useMemo, useState } from 'react';
import '../style/app/page.scss';
import { getVal } from '@/js/display';
import { master } from '@/js/master';
import { Modal } from './modal';

export default function Page({ setModal }) {
    /** 初期データ（固定） */
    const initialTasks = [
        { id: 1, project_id: 1, name: '要件定義',         complete_ratio: 100, task_status: 3, start_date: '2025-10-1',    end_date: '2025-10-3',    time: '40' },
        { id: 2, project_id: 1, name: '見積もり作成', complete_ratio: 80,    task_status: 2, start_date: '2025-10-7',    end_date: '2025-10-12', time: '24' },
        { id: 3, project_id: 1, name: 'スケジュール作成', complete_ratio: 0, task_status: 1, start_date: '2025-10-10', end_date: '2025-10-12', time: '16' },
        { id: 4, project_id: 2, name: '要件定義',         complete_ratio: 40, task_status: 2, start_date: '2025-10-7',    end_date: '2025-10-14', time: '40' },
        { id: 5, project_id: 2, name: '見積もり作成', complete_ratio: 0, task_status: 1, start_date: '2025-10-14', end_date: '2025-10-17', time: '24' },
        { id: 6, project_id: 3, name: '要件定義',         complete_ratio: 20, task_status: 1, start_date: '2025-10-8',    end_date: '2025-10-18', time: '48' },
        { id: 7, project_id: 3, name: '見積もり作成', complete_ratio: 0,    task_status: 1, start_date: '2025-10-18', end_date: '2025-11-03', time: '48' },
    ];

    /** 表示カラム定義 */
    const column = [
        { id: 1,    label: 'name',                     name: 'タスク名', type: 'text'     },
        { id: 10, label: 'project_id',         name: 'プロジェクトID', type: 'id' },
        { id: 2,    label: 'complete_ratio', name: '進捗率(%)',     type: 'number' },
        { id: 3,    label: 'task_status',        name: '状態ID',         type: 'id' },
        { id: 4,    label: 'start_date',         name: '開始日',         type: 'date'     },
        { id: 5,    label: 'end_date',             name: '終了日',         type: 'date'     },
        { id: 6,    label: 'time',                     name: '工数(h)',        type: 'number' },
    ];

    /** ========= ここから 編集・追加 機能 ========= */
    const [tasks, setTasks] = useState(initialTasks);
    const [editingId, setEditingId] = useState(null);
    const [modalDailyReport, setModalDailyReport] = useState(false);

    // --- テーブル追加用のドラフト行 ---
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

    // 既存行編集
    const startEdit = (id) => setEditingId(id);
    const cancelEdit = () => setEditingId(null);
    const onChangeEdit = (id, key, value) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, [key]: value } : t));
    };
    const saveEdit = (id) => {
        const target = tasks.find(t => t.id === id);
        if (!target) return;
        if (!target.name?.trim()) return alert('タスク名を入力してください');
        if (new Date(target.start_date) > new Date(target.end_date)) return alert('開始日は終了日以前にしてください');
        setTasks(prev => prev.map(t => t.id === id ? sanitizeTask(t) : t));
        setEditingId(null);
    };
    const deleteTask = (id) => {
        if (!confirm('このタスクを削除しますか？')) return;
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    // 追加テーブルの行操作
    const addDraftRow = () => setDraftRows(prev => [...prev, blankDraft()]);
    const removeDraftRow = (tmpid) => {
        setDraftRows(prev => (prev.length <= 1 ? [blankDraft()] : prev.filter(r => r.__tmpid !== tmpid)));
    };
    const onChangeDraft = (tmpid, key, value) => {
        setDraftRows(prev => prev.map(r => r.__tmpid === tmpid ? { ...r, [key]: value } : r));
    };

    const commitDraftRows = () => {
        // バリデーション
        const errs = [];
        draftRows.forEach((r, idx) => {
            if (!r.name?.trim()) errs.push(`${idx + 1}行目: タスク名`);
            if (!r.start_date)     errs.push(`${idx + 1}行目: 開始日`);
            if (!r.end_date)         errs.push(`${idx + 1}行目: 終了日`);
            if (r.start_date && r.end_date && new Date(r.start_date) > new Date(r.end_date)) {
                errs.push(`${idx + 1}行目: 開始日は終了日以前`);
            }
        });
        if (errs.length) {
            alert('入力を確認してください：\n' + errs.join('\n'));
            return;
        }

        // ID採番
        let maxId = tasks.length ? Math.max(...tasks.map(t => t.id)) : 0;
        const newOnes = draftRows.map(r => sanitizeTask({ ...r, id: ++maxId }));
        setTasks(prev => [...prev, ...newOnes]);

        // クリア
        setDraftRows([blankDraft()]);
        alert('追加しました');
    };
    /** ========= 編集・追加 機能ここまで ========= */

    /** ---------- util（ガント） ---------- */
    const parseDate = (s) => {
        const [y, m, d] = String(s).split('-').map(Number);
        return new Date(y, (m || 1) - 1, d || 1);
    };
    const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth     = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const addMonths        = (date, n) => new Date(date.getFullYear(), date.getMonth() + n, 1);

    const tasksD = useMemo(() => tasks.map(t => ({
        ...t,
        _start: t.start_date ? parseDate(t.start_date) : null,
        _end:     t.end_date     ? parseDate(t.end_date)     : null,
    })), [tasks]);

    const initialMonthStart = useMemo(() => {
        const withStart = tasksD.filter(t => t._start);
        if (withStart.length === 0) return startOfMonth(new Date());
        const rawMin = new Date(Math.min(...withStart.map(t => t._start.getTime())));
        return startOfMonth(rawMin);
    }, [tasksD]);

    const [viewStart, setViewStart] = useState(initialMonthStart);
    const viewEnd = useMemo(() => endOfMonth(viewStart), [viewStart]);

    const days = useMemo(() => {
        const list = [];
        for (let d = new Date(viewStart); d <= viewEnd; d.setDate(d.getDate() + 1)) {
            list.push(new Date(d));
        }
        return list;
    }, [viewStart, viewEnd]);

    const dayIndex = (date) =>
        Math.floor((date.getTime() - viewStart.getTime()) / (24 * 60 * 60 * 1000));

    const monthGroups = useMemo(() => {
        return [{
            key: `${viewStart.getFullYear()}-${viewStart.getMonth() + 1}`,
            label: `${viewStart.getFullYear()}/${String(viewStart.getMonth() + 1).padStart(2, '0')}`,
            span: days.length
        }];
    }, [viewStart, days.length]);

    const wday = ['日','月','火','水','木','金','土'];
    const isSunday = (d) => d.getDay() === 0;
    const isSaturday = (d) => d.getDay() === 6;

    const visibleTasks = useMemo(() => {
        return tasksD
            .map(t => {
                if (!t._start || !t._end) return null;
                if (t._end < viewStart || t._start > viewEnd) return null;
                const clampedStart = t._start < viewStart ? viewStart : t._start;
                const clampedEnd     = t._end     > viewEnd     ? viewEnd     : t._end;
                return { ...t, _startV: clampedStart, _endV: clampedEnd };
            })
            .filter(Boolean);
    }, [tasksD, viewStart, viewEnd]);

    // === 追加: ガント用にプロジェクトごとへグルーピング & 並び替え ===
    const ganttGroups = useMemo(() => {
        const map = new Map();
        visibleTasks.forEach(t => {
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

    // === 追加: 一覧用（当月表示のタスク）をプロジェクトごとにグルーピング ===
    const listGroups = useMemo(() => {
        const map = new Map();
        visibleTasks.forEach(t => {
            const pid = t.project_id;
            if (!map.has(pid)) map.set(pid, []);
            map.get(pid).push(t);
        });
        // プロジェクト昇順、プロジェクト内は開始日→IDでソート
        const entries = [...map.entries()].sort((a, b) => a[0] - b[0]);
        entries.forEach(([_, arr]) => {
            arr.sort((a, b) => {
                const aStart = a._startV?.getTime() ?? 0;
                const bStart = b._startV?.getTime() ?? 0;
                return (aStart - bStart) || (a.id - b.id);
            });
        });
        return entries; // [ [project_id, Task[]], ... ]
    }, [visibleTasks]);

    const listTasks = visibleTasks;

    // ページング（次の月のデータ取得フック）
    const getMonthData = async (date) => {
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        const data = tasksD.filter(t => t._start && t._end && !(t._end < monthStart || t._start > monthEnd));
        return data;
    };
    const handlePrev = async () => {
        const nextStart = addMonths(viewStart, -1);
        setViewStart(nextStart);
        await getMonthData(nextStart);
    };
    const handleNext = async () => {
        const nextStart = addMonths(viewStart, 1);
        setViewStart(nextStart);
        await getMonthData(nextStart);
    };

    return (
        <main className='p-app'>
            <div className='p-app__top'>
                <h1>Dashboard</h1>
                <button className='c-btn' onClick={() => {
                    setModalDailyReport(true)
                    setModal(true)
                }}>日報作成</button>
            </div>

            {/* ガントチャート（プロジェクトごと） */}
            <section className='p-app__section'>
                <h2 className='p-app__section__title'>ガントチャート</h2>
                {/* 月ページング */}
                <div className='wbs__controls' style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: 12 }}>
                    <button type='button' onClick={handlePrev} aria-label='前の月へ'>←</button>
                    <div>{viewStart.getFullYear()} / {String(viewStart.getMonth() + 1).padStart(2,'0')}</div>
                    <button type='button' onClick={handleNext} aria-label='次の月へ'>→</button>
                </div>
                <div className='p-app__section__main wbs'>
                    <table className='c-table wbs__table'>
                        <thead>
                            <tr>
                                {monthGroups.map((g, i) => (
                                    <th key={i} colSpan={g.span} className='c-th--month'>{g.label}</th>
                                ))}
                            </tr>
                            <tr>
                                {days.map((d, i) => {
                                    let day = 'default';
                                    switch (true) {
                                        case isSunday(d): day = 'sunday'; break;
                                        case isSaturday(d): day = 'saturday'; break;
                                    }
                                    return (
                                        <th
                                            key={i}
                                            className={`c-th--${day}`}
                                            title={`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}(${wday[d.getDay()]})`}
                                        >
                                            {d.getDate()}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>

                        <tbody>
                            {ganttGroups.length === 0 && (
                                <tr><td colSpan={days.length} style={{ textAlign: 'center' }}>この月に該当するタスクはありません</td></tr>
                            )}

                            {ganttGroups.map(([pid, arr]) => {
                                const projectName = master.project_id?.[pid] ?? `Project ${pid}`;
                                return (
                                    <React.Fragment key={`g-${pid}`}>
                                        {/* プロジェクト見出し行 */}
                                        <tr>
                                            <td className='c-td--parent' colSpan={days.length}>{projectName}</td>
                                        </tr>
                                        {/* プロジェクト内タスク行 */}
                                        {arr.map((t, i) => {
                                            const pre    = Math.max(0, dayIndex(t._startV));
                                            const span = Math.max(1, dayIndex(t._endV) - dayIndex(t._startV) + 1);
                                            const post = Math.max(0, days.length - pre - span);
                                            const title = `【${projectName}】${t.name}`;
                                            return (
                                                <tr key={`g-${pid}-${t.id}-${i}`}>
                                                    {pre > 0 && <td colSpan={pre}></td>}
                                                    <td colSpan={span}>
                                                        <div className='wbs__title'>{title}</div>
                                                        <div className={`wbs__bar status-${t.task_status}`}>
                                                            <div className='wbs__bar__fill' style={{ width: `${t.complete_ratio}%` }} />
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

            {/* 追加テーブル（複数行をまとめて追加） */}
            <section className='p-app__section'>
                <h2 className='p-app__section__title'>タスク追加（テーブル）</h2>
                <div className='p-app__section__main add'>
                    <div>
                        <button type='button' onClick={addDraftRow}>+ 追加</button>
                        <button type='button' onClick={commitDraftRows}>+ 登録</button>
                    </div>

                    <table className='c-table'>
                        <thead>
                            <tr>
                                {column.map(({ id, name }) => <th key={id}>{name}</th>)}
                                <th>行操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {draftRows.map((r) => (
                                <tr key={r.__tmpid}>
                                    {column.map(({ id, label, type }) => {
                                        switch (type) {
                                            case 'id':
                                                return <td key={id}>
                                                    <select value={String(r[label] ?? 0)} onChange={e => onChangeDraft(r.__tmpid, label, e.target.value)}>
                                                        {Object.values(master[label]).map((m, i) => {
                                                            return <option key={`${label}-${i}`} value={i + 1}>{m}</option>
                                                        })}
                                                    </select>
                                                </td>
                                            default:
                                                return <td key={id}>
                                                    <input
                                                        type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
                                                        value={String(r[label] ?? '')}
                                                        onChange={e => onChangeDraft(r.__tmpid, label, e.target.value)}
                                                    />
                                                </td>
                                        }
                                    })}
                                    <td>
                                        <button type='button' onClick={() => removeDraftRow(r.__tmpid)}>削除</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* タスク一覧（その月にかかるものだけ＆行ごとに編集） */}
            <section className='p-app__section'>
                <h2 className='p-app__section__title'>タスク一覧</h2>
                <div className='p-app__section__main task'>
                    <table className='c-table'>
                        <thead>
                            <tr>
                                {column.map(({ id, name, type }) => <th key={id} className={`c-th--${type}`}>{name}</th>)}
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listGroups.length === 0 && (
                                <tr>
                                    <td colSpan={column.length + 1} style={{ textAlign: 'center' }}>
                                        この月に該当するタスクはありません
                                    </td>
                                </tr>
                            )}

                            {listGroups.map(([pid, arr]) => {
                                const projectName = master.project_id?.[pid] ?? `Project ${pid}`;
                                return (
                                    <React.Fragment key={`list-${pid}`}>
                                        {/* プロジェクト見出し行 */}
                                        <tr>
                                            <td className='c-td--parent' colSpan={column.length + 1}>{projectName}</td>
                                        </tr>

                                        {/* プロジェクト配下タスク */}
                                        {arr.map((t, i) => {
                                            const isEditing = editingId === t.id;
                                            return (
                                                <tr key={`row-${pid}-${t.id}-${i}`}>
                                                    {column.map(({ id, label, type }) => {
                                                        const raw = t[label];
                                                        if (isEditing) {
                                                            switch (type) {
                                                                case 'id':
                                                                    return (
                                                                        <td key={id}>
                                                                            <select
                                                                                value={String(raw ?? 0)}
                                                                                onChange={e => onChangeEdit(t.id, label, e.target.value)}
                                                                            >
                                                                                {Object.values(master[label]).map((m, idx) => (
                                                                                    <option key={`${label}-${idx}`} value={idx + 1}>{m}</option>
                                                                                ))}
                                                                            </select>
                                                                        </td>
                                                                    );
                                                                default:
                                                                    return (
                                                                        <td key={id}>
                                                                            <input
                                                                                type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
                                                                                value={String(raw ?? '')}
                                                                                onChange={e => onChangeEdit(t.id, label, e.target.value)}
                                                                            />
                                                                        </td>
                                                                    );
                                                            }
                                                        } else {
                                                            if (raw === undefined || raw === null) return <td key={id}></td>;
                                                            const value = getVal(raw, label, type);
                                                            return <td key={id} className={`c-td--${type} c-td--child`}>{value}</td>;
                                                        }
                                                    })}
                                                    <td>
                                                        {!isEditing ? (
                                                            <>
                                                                <button type='button' onClick={() => startEdit(t.id)}>編集</button>{' '}
                                                                <button type='button' onClick={() => deleteTask(t.id)}>削除</button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button type='button' onClick={() => saveEdit(t.id)}>保存</button>{' '}
                                                                <button type='button' onClick={cancelEdit}>キャンセル</button>
                                                            </>
                                                        )}
                                                    </td>
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

            {modalDailyReport && <Modal
				setModal={setModal}
                setModalDailyReport={setModalDailyReport}
                listGroups={listGroups}
            />}
        </main>
    );
}