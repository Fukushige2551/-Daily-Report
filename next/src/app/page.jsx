'use client';
import React, { useMemo, useState } from 'react';
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
    { project_id: 3, name: '要件定義',     complete_ratio: 20,  task_status: 1, start_date: '2025-10-8',  end_date: '2025-10-18', time: '48' },
    { project_id: 3, name: '見積もり作成', complete_ratio: 0,  task_status: 1, start_date: '2025-10-30', end_date: '2025-11-03', time: '48' }, // ※11月にまたがる例
  ];

  const column = [
    { id: 1, label: 'name',           name: 'タスク名', type: 'text'   },
    { id: 2, label: 'complete_ratio', name: '進捗率',   type: 'number' },
    { id: 3, label: 'task_status',    name: '状態',     type: 'id'     },
    { id: 4, label: 'start_date',     name: '開始日',   type: 'date'   },
    { id: 5, label: 'end_date',       name: '終了日',   type: 'date'   },
    { id: 6, label: 'time',           name: '工数',     type: 'number' },
  ];

  /** ---------- util ---------- */
  const parseDate = (s) => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };
  const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth   = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const addMonths    = (date, n) => new Date(date.getFullYear(), date.getMonth() + n, 1);

  const tasksD = useMemo(() => tasks.map(t => ({
    ...t,
    _start: parseDate(t.start_date),
    _end: parseDate(t.end_date),
  })), [tasks]);

  // 初期表示月＝最も早い開始日を含む月
  const initialMonthStart = useMemo(() => {
    const rawMin = new Date(Math.min(...tasksD.map(t => t._start.getTime())));
    return startOfMonth(rawMin);
  }, [tasksD]);

  const [viewStart, setViewStart] = useState(initialMonthStart);
  const viewEnd = useMemo(() => endOfMonth(viewStart), [viewStart]);

  // その月の日付配列（両端含む）
  const days = useMemo(() => {
    const list = [];
    for (let d = new Date(viewStart); d <= viewEnd; d.setDate(d.getDate() + 1)) {
      list.push(new Date(d));
    }
    return list;
  }, [viewStart, viewEnd]);

  const dayIndex = (date) =>
    Math.floor((date.getTime() - viewStart.getTime()) / (24 * 60 * 60 * 1000));

  // 月ヘッダ（1か月固定だけど拡張しやすい形で）
  const monthGroups = useMemo(() => {
    return [{ key: `${viewStart.getFullYear()}-${viewStart.getMonth() + 1}`, label: `${viewStart.getFullYear()}/${String(viewStart.getMonth() + 1).padStart(2, '0')}`, span: days.length }];
  }, [viewStart, days.length]);

  const wday = ['日','月','火','水','木','金','土'];
  const isSunday = (d) => d.getDay() === 0;
  const isSaturday = (d) => d.getDay() === 6;

  // その月に「かかっている」タスクだけ抽出＆クランプ（ガント描画用）
  const visibleTasks = useMemo(() => {
    return tasksD
      .map(t => {
        if (t._end < viewStart || t._start > viewEnd) return null; // 完全に月外
        const clampedStart = t._start < viewStart ? viewStart : t._start;
        const clampedEnd   = t._end   > viewEnd   ? viewEnd   : t._end;
        return { ...t, _startV: clampedStart, _endV: clampedEnd };
      })
      .filter(Boolean);
  }, [tasksD, viewStart, viewEnd]);

  // 一覧用も同じくその月にかかっているものだけ
  const listTasks = visibleTasks;

  // 「次の月のデータを取る」= ページングAPIを想定した取得フック
  // ここではサンプルとしてローカルtasksからその月のタスクを返す。
  // 実APIとつなぐ場合は fetch(...) に差し替えればOK。
  const getMonthData = async (date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const data = tasksD.filter(t => !(t._end < monthStart || t._start > monthEnd));
    // ここで実APIならレスポンスをreturn
    return data;
  };

  const handlePrev = async () => {
    const nextStart = addMonths(viewStart, -1);
    setViewStart(nextStart);
    // 取得例（使い道があれば state に保存してもOK）
    await getMonthData(nextStart);
  };

  const handleNext = async () => {
    const nextStart = addMonths(viewStart, 1);
    setViewStart(nextStart);
    await getMonthData(nextStart);
  };

  return (
    <main className='p-app'>
      <h1>Dashboard</h1>

      {/* コントロール */}
      <div className='wbs__controls' style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
        <button type='button' onClick={handlePrev} aria-label='前の月へ'>← 前の月</button>
        <div>{viewStart.getFullYear()}年 {String(viewStart.getMonth() + 1).padStart(2,'0')}月</div>
        <button type='button' onClick={handleNext} aria-label='次の月へ'>次の月 →</button>
      </div>

      {/* ガントチャート（その月1か月分だけ） */}
      <section className='p-app__section'>
        <h2 className='p-app__section__title'>ガントチャート</h2>
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
                    case isSunday(d): day = 'sunday';   break;
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
              {visibleTasks.length === 0 && (
                <tr><td colSpan={days.length} style={{ textAlign: 'center' }}>この月に該当するタスクはありません</td></tr>
              )}

              {visibleTasks.map((t, i) => {
                const projectName = (master.project_id && master.project_id[t.project_id]) || `Project ${t.project_id}`;

                const pre  = Math.max(0, dayIndex(t._startV));
                const span = Math.max(1, dayIndex(t._endV) - dayIndex(t._startV) + 1);
                const post = Math.max(0, days.length - pre - span);
                const title = `${projectName}: ${t.name}`;

                return (
                  <tr key={i}>
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
            </tbody>
          </table>
        </div>
      </section>

      {/* タスク一覧（その月にかかるものだけ） */}
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
              {(() => {
                const rows = [];
                const seen = new Set();
                listTasks.forEach((t, i) => {
                  const project = master.project_id?.[t.project_id] ?? `Project ${t.project_id}`;
                  const isFirst = !seen.has(t.project_id);
                  if (isFirst) {
                    seen.add(t.project_id);
                    rows.push(
                      <tr key={`p-${t.project_id}`}>
                        <td className='c-td--parent'>{project}</td>
                        {column.map(({ id, label }) =>
                          label !== 'name' ? <td key={id} className='c-td--parent'></td> : null
                        )}
                      </tr>
                    );
                  }
                  rows.push(
                    <tr key={`${t.project_id}-${t.name}-${i}`}>
                      {column.map(({ id, label, type }) => {
                        // 表示値は元データ（クランプはガントだけ）
                        if (t[label] === undefined || t[label] === null) return <td key={id}></td>;
                        const value = getVal(t[label], label, type);
                        return <td key={id} className={`c-td--${type} c-td--child`}>{value}</td>;
                      })}
                    </tr>
                  );
                });
                if (rows.length === 0) {
                  return (
                    <tr>
                      <td colSpan={column.length} style={{ textAlign: 'center' }}>
                        この月に該当するタスクはありません
                      </td>
                    </tr>
                  );
                }
                return rows;
              })()}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}