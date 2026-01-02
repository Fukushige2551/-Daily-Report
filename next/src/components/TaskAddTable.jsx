'use client';

import React from 'react';
import { master } from '../hooks/master';

/**
 * タスク追加（複数行まとめて追加）テーブル
 *
 * Props:
 * - column: 表示カラム定義
 * - draftRows: 追加ドラフト行配列
 * - addDraftRow(): 行追加
 * - removeDraftRow(tmpid): 行削除
 * - onChangeDraft(tmpid, key, value): 値変更
 * - commitDraftRows(): 登録
 */
export default function TaskAddTable({
    column = [],
    draftRows = [],
    addDraftRow,
    removeDraftRow,
    onChangeDraft,
    commitDraftRows,
}) {
    const placeholder = {
        name: 'タスク名を入力',
        description: '内容を入力',
        start_date: 'YYYY-MM-DD',
        end_date: 'YYYY-MM-DD',
        complete_ratio: 0,
        time: 1.5,
    }
    return (
        <section className='p-app__section'>
            <h2 className='p-app__section__title'>追加</h2>

            {/* <div>
                <button type='button' onClick={addDraftRow}>
                    +
                </button>
            </div> */}

            <div className='p-app__section__main add'>
                <table className='c-table'>
                    <thead>
                        <tr>
                            {column.map(({ id, name, label }) => (
                                <th key={id} className={`c-th c-th--${label}`}>{name}</th>
                            ))}
                            <th className={`c-th c-th--control`}>操作</th>
                        </tr>
                    </thead>

                    <tbody>
                        {draftRows.map((r) => (
                        <tr key={r.__tmpid}>
                            {column.map(({ id, label, type }) => {
                                switch (type) {
                                    case 'id':
                                    return (
                                        <td key={id} className={`c-td`}>
                                            <select
                                                value={String(r[label] ?? 1)}
                                                onChange={(e) => onChangeDraft(r.__tmpid, label, e.target.value)}
                                                className={`c-td--${type}`}
                                            >
                                                {Object.values(master?.[label] ?? {}).map((m, i) => (
                                                <option key={`${label}-${i}`} value={i + 1}>
                                                    {m}
                                                </option>
                                                ))}
                                            </select>
                                        </td>
                                    );

                                    default:
                                    return (
                                        <td key={id} className={`c-td`}>
                                            <input
                                                type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
                                                value={String(r[label] ?? '')}
                                                className={`c-td--${type}`}
                                                placeholder={placeholder[label] ?? ''}
                                                onChange={(e) => onChangeDraft(r.__tmpid, label, e.target.value)}
                                            />
                                        </td>
                                    );
                                }
                            })}

                            <td className='c-td--control'>
                                <button type='button' onClick={commitDraftRows}>
                                    ✓
                                </button>
                                <button type='button' onClick={() => removeDraftRow(r.__tmpid)}>
                                    ✕
                                </button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
