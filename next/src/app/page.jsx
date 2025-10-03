'use client';
import { useMemo, useState } from 'react';

/** -------- ヘルパー -------- */
const toDate = (v) => (v instanceof Date ? v : new Date(v));
const fmt = (d) => new Date(d).toISOString().slice(0, 10);
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const daysBetween = (a, b) => {
  const d1 = new Date(fmt(a));
  const d2 = new Date(fmt(b));
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
};

/** -------- メインページ -------- */
export default function Page() {
  // 初期タスク（例）
  const [tasks, setTasks] = useState([
    { id: 't1', name: '要件定義', progress: 80, start: '2025-10-01', end: '2025-10-07' },
    { id: 't2', name: '設計',     progress: 40, start: '2025-10-05', end: '2025-10-12' },
    { id: 't3', name: '実装',     progress: 15, start: '2025-10-10', end: '2025-10-25' },
  ]);

  // 追加用フォーム
  const [newRow, setNewRow] = useState({
    name: '', progress: 0, start: fmt(new Date()), end: fmt(new Date())
  });

  // 編集行の管理
  const [editingId, setEditingId] = useState(null);
  const [editRow,   setEditRow]   = useState({ name: '', progress: 0, start: '', end: '' });

  // WBSのタイムスケール
  const { minDate, maxDate, totalDays } = useMemo(() => {
    if (tasks.length === 0) {
      const today = fmt(new Date());
      return { minDate: today, maxDate: today, totalDays: 1 };
    }
    const minD = tasks.reduce((m, t) => (toDate(t.start) < toDate(m) ? t.start : m), tasks[0].start);
    const maxD = tasks.reduce((m, t) => (toDate(t.end)   > toDate(m) ? t.end   : m), tasks[0].end);
    const span = Math.max(1, daysBetween(minD, maxD));
    return { minDate: fmt(minD), maxDate: fmt(maxD), totalDays: span };
  }, [tasks]);

  // 追加
  const addTask = () => {
    if (!newRow.name.trim()) return alert('※タスク名を入力');
    if (toDate(newRow.start) > toDate(newRow.end)) return alert('開始日は終了日より前にしてね');
    const id = crypto.randomUUID?.() ?? String(Date.now());
    const p  = clamp(Number(newRow.progress) || 0, 0, 100);
    setTasks((prev) => [...prev, { id, name: newRow.name.trim(), progress: p, start: newRow.start, end: newRow.end }]);
    setNewRow({ name: '', progress: 0, start: fmt(new Date()), end: fmt(new Date()) });
  };

  // 編集開始
  const startEdit = (t) => {
    setEditingId(t.id);
    setEditRow({ name: t.name, progress: t.progress, start: t.start, end: t.end });
  };

  // 編集保存
  const saveEdit = () => {
    if (!editRow.name.trim()) return alert('※タスク名を入力');
    if (toDate(editRow.start) > toDate(editRow.end)) return alert('開始日は終了日より前にしてね');
    const p = clamp(Number(editRow.progress) || 0, 0, 100);
    setTasks((prev) => prev.map((t) =>
      t.id === editingId ? { ...t, name: editRow.name.trim(), progress: p, start: editRow.start, end: editRow.end } : t
    ));
    setEditingId(null);
  };

  // 削除
  const removeTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (editingId === id) setEditingId(null);
  };

  /** ---- WBS（ガント風）描画用 ----
   * left: 期間の開始位置（%）
   * width: 期間の幅（%）
   * progress: 塗りつぶし幅（%）
   */
  const bars = useMemo(() => {
    const min = toDate(minDate);
    const spanDays = Math.max(1, totalDays);
    return tasks.map((t, idx) => {
      const startOff = clamp(daysBetween(min, t.start), 0, spanDays);
      const widthDays = Math.max(1, daysBetween(t.start, t.end));
      const left = (startOff / spanDays) * 100;
      const width = (widthDays / spanDays) * 100;
      const progressWidth = (width * clamp(Number(t.progress) || 0, 0, 100)) / 100;
      return { id: t.id, name: t.name, progress: t.progress, left, width, progressWidth, row: idx };
    });
  }, [tasks, minDate, totalDays]);

  // グリッド目盛（週ごと or 日ごと）
  const ticks = useMemo(() => {
    const count = Math.min(60, Math.max(10, totalDays + 1));
    return Array.from({ length: count }, (_, i) => i);
  }, [totalDays]);

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>WBS（ガントチャート）</h1>

      {/* ---- WBSヘッダー（期間情報） ---- */}
      <div style={styles.rangeInfo}>
        <span>期間: {minDate} 〜 {maxDate}（{totalDays}日）</span>
      </div>

      {/* ---- WBS本体 ---- */}
      <div style={styles.wbsWrap}>
        {/* 目盛ライン */}
        <div style={styles.grid}>
          {ticks.map((i) => (
            <div key={i} style={styles.gridCol} />
          ))}
        </div>

        {/* タスクバー */}
        <div style={styles.barsLayer}>
          {bars.map((b) => (
            <div key={b.id} style={{
              ...styles.barOuter,
              left: `${b.left}%`,
              width: `${b.width}%`,
              top: `${b.row * 40}px`,
            }}>
              <div style={{ ...styles.barProgress, width: `${b.progressWidth}%` }} />
              <span style={styles.barLabel}>{b.name} ({b.progress}%)</span>
            </div>
          ))}
        </div>

        {/* 行ラベル */}
        <div style={styles.rowLabels}>
          {tasks.map((t, i) => (
            <div key={t.id} style={{ ...styles.rowLabel, top: `${i * 40}px` }}>
              {t.name}
            </div>
          ))}
        </div>
      </div>

      {/* ---- テーブル ---- */}
      <h2 style={styles.h2}>タスク一覧（編集可）</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>タスク名</th>
              <th style={styles.th} title="0〜100">進捗率(%)</th>
              <th style={styles.th}>開始日</th>
              <th style={styles.th}>終了日</th>
              <th style={styles.th} aria-label="actions">操作</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id}>
                <td style={styles.td}>
                  {editingId === t.id ? (
                    <input
                      value={editRow.name}
                      onChange={(e) => setEditRow((s) => ({ ...s, name: e.target.value }))}
                      style={styles.input}
                      placeholder="タスク名"
                    />
                  ) : t.name}
                </td>
                <td style={styles.td} align="right">
                  {editingId === t.id ? (
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={editRow.progress}
                      onChange={(e) => setEditRow((s) => ({ ...s, progress: e.target.value }))}
                      style={{ ...styles.input, width: 90, textAlign: 'right' }}
                    />
                  ) : `${t.progress}%`}
                </td>
                <td style={styles.td}>
                  {editingId === t.id ? (
                    <input
                      type="date"
                      value={editRow.start}
                      onChange={(e) => setEditRow((s) => ({ ...s, start: e.target.value }))}
                      style={styles.input}
                    />
                  ) : t.start}
                </td>
                <td style={styles.td}>
                  {editingId === t.id ? (
                    <input
                      type="date"
                      value={editRow.end}
                      onChange={(e) => setEditRow((s) => ({ ...s, end: e.target.value }))}
                      style={styles.input}
                    />
                  ) : t.end}
                </td>
                <td style={styles.td}>
                  {editingId === t.id ? (
                    <>
                      <button style={styles.btnPrimary} onClick={saveEdit}>保存</button>
                      <button style={styles.btnGhost} onClick={() => setEditingId(null)}>取消</button>
                    </>
                  ) : (
                    <>
                      <button style={styles.btn} onClick={() => startEdit(t)}>編集</button>
                      <button style={styles.btnDanger} onClick={() => removeTask(t.id)}>削除</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {/* 追加行 */}
            <tr>
              <td style={styles.td}>
                <input
                  value={newRow.name}
                  onChange={(e) => setNewRow((s) => ({ ...s, name: e.target.value }))}
                  style={styles.input}
                  placeholder="新しいタスク名"
                />
              </td>
              <td style={styles.td} align="right">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={newRow.progress}
                  onChange={(e) => setNewRow((s) => ({ ...s, progress: e.target.value }))}
                  style={{ ...styles.input, width: 90, textAlign: 'right' }}
                />
              </td>
              <td style={styles.td}>
                <input
                  type="date"
                  value={newRow.start}
                  onChange={(e) => setNewRow((s) => ({ ...s, start: e.target.value }))}
                  style={styles.input}
                />
              </td>
              <td style={styles.td}>
                <input
                  type="date"
                  value={newRow.end}
                  onChange={(e) => setNewRow((s) => ({ ...s, end: e.target.value }))}
                  style={styles.input}
                />
              </td>
              <td style={styles.td}>
                <button style={styles.btnPrimary} onClick={addTask}>追加</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}

/** -------- スタイル（CSS-in-JSで単純化） -------- */
const styles = {
  main: { padding: '24px', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif', lineHeight: 1.5 },
  h1: { fontSize: 24, margin: '0 0 12px' },
  h2: { fontSize: 18, margin: '24px 0 8px' },
  rangeInfo: { marginBottom: 8, fontSize: 14, color: '#555' },

  wbsWrap: {
    position: 'relative',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '40px 16px 16px',
    overflowX: 'auto',
    overflowY: 'hidden',
    height: 200 + 40, // 行ラベル分のマージン
  },

  grid: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: 'repeat(40, 1fr)', // ざっくり等間隔（日数が増えても伸縮）
    gap: 0,
    height: 200,
    background: 'linear-gradient(#fafafa, #fff)',
    borderRadius: 6,
  },
  gridCol: {
    borderRight: '1px solid #eee',
  },

  barsLayer: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 40,
    height: 200,
    pointerEvents: 'none',
  },
  barOuter: {
    position: 'absolute',
    height: 22,
    background: '#e5f0ff',
    border: '1px solid #93c5fd',
    borderRadius: 6,
    boxShadow: '0 1px 0 rgba(0,0,0,0.04) inset',
    pointerEvents: 'auto',
  },
  barProgress: {
    height: '100%',
    background: '#3b82f6',
    borderRadius: '6px 0 0 6px',
  },
  barLabel: {
    position: 'absolute',
    left: 8,
    top: 2,
    fontSize: 12,
    color: '#0f172a',
    textShadow: '0 1px 0 rgba(255,255,255,0.6)',
    whiteSpace: 'nowrap',
  },

  rowLabels: {
    position: 'absolute',
    left: 24,
    top: 18,
    fontSize: 10,
    color: '#94a3b8',
  },
  rowLabel: {
    position: 'absolute',
  },

  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
    fontSize: 14,
    color: '#333',
  },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    background: '#f8fafc',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  td: {
    padding: '10px 12px',
    borderBottom: '1px solid #f1f5f9',
    background: '#fff',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
  },
  input: {
    width: '100%',
    padding: '6px 8px',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontSize: 14,
  },
  btn: {
    padding: '6px 10px',
    border: '1px solid #cbd5e1',
    background: '#fff',
    borderRadius: 6,
    cursor: 'pointer',
    marginRight: 6,
  },
  btnGhost: {
    padding: '6px 10px',
    border: '1px solid #e5e7eb',
    background: '#f8fafc',
    borderRadius: 6,
    cursor: 'pointer',
    marginRight: 6,
  },
  btnPrimary: {
    padding: '6px 10px',
    border: '1px solid #2563eb',
    background: '#3b82f6',
    color: '#fff',
    borderRadius: 6,
    cursor: 'pointer',
    marginRight: 6,
  },
  btnDanger: {
    padding: '6px 10px',
    border: '1px solid #ef4444',
    background: '#fee2e2',
    color: '#991b1b',
    borderRadius: 6,
    cursor: 'pointer',
  },
};