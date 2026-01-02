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
    return (
        <section className='p-app__section'>
            <h2 className='p-app__section__title'>タスク追加（テーブル）</h2>

            <div className='p-app__section__main add'>
                <div>
                <button type='button' onClick={addDraftRow}>
                    + 追加
                </button>
                <button type='button' onClick={commitDraftRows}>
                    + 登録
                </button>
                </div>

                <table className='c-table'>
                    <thead>
                        <tr>
                        {column.map(({ id, name }) => (
                            <th key={id}>{name}</th>
                        ))}
                        <th>行操作</th>
                        </tr>
                    </thead>

                    <tbody>
                        {draftRows.map((r) => (
                        <tr key={r.__tmpid}>
                            {column.map(({ id, label, type }) => {
                            switch (type) {
                                case 'id':
                                return (
                                    <td key={id}>
                                    <select
                                        value={String(r[label] ?? 0)}
                                        onChange={(e) => onChangeDraft(r.__tmpid, label, e.target.value)}
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
                                    <td key={id}>
                                    <input
                                        type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
                                        value={String(r[label] ?? '')}
                                        onChange={(e) => onChangeDraft(r.__tmpid, label, e.target.value)}
                                    />
                                    </td>
                                );
                            }
                            })}

                            <td>
                            <button type='button' onClick={() => removeDraftRow(r.__tmpid)}>
                                削除
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
