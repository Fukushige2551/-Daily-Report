'use client';

import React from 'react';

/**
 * タスク一覧（当月に該当するタスクだけ）表示 + 行編集
 *
 * Props:
 * - column: 表示カラム定義配列
 * - listGroups: [ [project_id, Task[]], ... ]（当月表示分だけ＆projectでグルーピング済）
 * - master: masterデータ（select表示用）
 * - getVal: 表示整形関数
 * - editingId: 現在編集中の task.id
 * - startEdit(id)
 * - cancelEdit()
 * - onChangeEdit(id, key, value)
 * - saveEdit(id)
 * - deleteTask(id)
 */
export default function TaskList({
    column = [],
    listGroups = [],
    master = {},
    getVal,
    editingId = null,
    startEdit,
    cancelEdit,
    onChangeEdit,
    saveEdit,
    deleteTask,
}) {
    return (
        <section className='p-app__section'>
            <h2 className='p-app__section__title'>タスク一覧</h2>

            <div className='p-app__section__main task'>
                <table className='c-table'>
                    <thead>
                        <tr>
                        {column.map(({ id, name, type }) => (
                            <th key={id} className={`c-th--${type}`}>
                            {name}
                            </th>
                        ))}
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
                        const projectName = master?.project_id?.[pid] ?? `Project ${pid}`;

                        return (
                            <React.Fragment key={`list-${pid}`}>
                            {/* プロジェクト見出し行 */}
                            <tr>
                                <td className='c-td--parent' colSpan={column.length + 1}>
                                {projectName}
                                </td>
                            </tr>

                            {/* プロジェクト配下タスク */}
                            {arr.map((t, i) => {
                                const isEditing = editingId === t.id;

                                return (
                                <tr key={`row-${pid}-${t.id}-${i}`}>
                                    {column.map(({ id, label, type }) => {
                                    const raw = t[label];

                                    // 編集中
                                    if (isEditing) {
                                        switch (type) {
                                        case 'id':
                                            return (
                                            <td key={id}>
                                                <select
                                                value={String(raw ?? 0)}
                                                onChange={(e) => onChangeEdit?.(t.id, label, e.target.value)}
                                                >
                                                {Object.values(master?.[label] ?? {}).map((m, idx) => (
                                                    <option key={`${label}-${idx}`} value={idx + 1}>
                                                    {m}
                                                    </option>
                                                ))}
                                                </select>
                                            </td>
                                            );

                                        default:
                                            return (
                                            <td key={id}>
                                                <input
                                                type={
                                                    type === 'number'
                                                    ? 'number'
                                                    : type === 'date'
                                                    ? 'date'
                                                    : 'text'
                                                }
                                                value={String(raw ?? '')}
                                                onChange={(e) => onChangeEdit?.(t.id, label, e.target.value)}
                                                />
                                            </td>
                                            );
                                        }
                                    }

                                    // 表示のみ
                                    if (raw === undefined || raw === null) return <td key={id}></td>;
                                    const value = getVal ? getVal(raw, label, type) : String(raw);

                                    return (
                                        <td key={id} className={`c-td--${type} c-td--child`}>
                                        {value}
                                        </td>
                                    );
                                    })}

                                    <td>
                                    {!isEditing ? (
                                        <>
                                        <button type='button' onClick={() => startEdit?.(t.id)}>
                                            編集
                                        </button>{' '}
                                        <button type='button' onClick={() => deleteTask?.(t.id)}>
                                            削除
                                        </button>
                                        </>
                                    ) : (
                                        <>
                                        <button type='button' onClick={() => saveEdit?.(t.id)}>
                                            保存
                                        </button>{' '}
                                        <button type='button' onClick={() => cancelEdit?.()}>
                                            キャンセル
                                        </button>
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
    );
}
