'use client';

import React, { useMemo, useState } from 'react';
import '../style/app/dailyReport.scss';
import { master } from '@/hooks/master';

export default function DailyReportModal({
    isOpen,
    onClose,
    listGroups = [],
    onSubmit,
}) {
    const [page, setPage] = useState(1);
    const now = useMemo(() => new Date(), []);
    const weekdays = useMemo(() => ['日', '月', '火', '水', '木', '金', '土'], []);

    // 日付フォーマット
    const formattedDate = useMemo(() => {
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const w = weekdays[now.getDay()];
        return `${y}年${m}月${d}日(${w})`;
    }, [now, weekdays]);

    // 終了時間フォーマット
    const endTime = useMemo(() => {
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
    }, [now]);

    /**
     * モーダル操作
     */
    const close = () => {
        setPage(1);
        onClose?.();
    };
    const goNext = () => setPage(2);
    const goBack = () => setPage(1);

    const handleSubmit = async () => {
        try {
        await onSubmit?.();
        } finally {
        close();
        }
    };

    /**
     * タスクセクション
     */
    const renderTaskSection = (title) => (
        <div className='p-dailyReport__field'>
            <h4>{title}</h4>
            <dl className='task'>
                {listGroups.map((l) => {
                const pid = l[0];
                const tasks = l[1] ?? [];
                return (
                    <React.Fragment key={pid}>
                    <dt>{master.project_id?.[pid] ?? `Project ${pid}`}</dt>
                    <dd>
                        <ul>
                        {tasks.map((t) => (
                            <li key={t.id}>{t.name}</li>
                        ))}
                        </ul>
                    </dd>
                    </React.Fragment>
                );
                })}
            </dl>
        </div>
    );

    /**
     * DOM
     */
    if (!isOpen) return null;
    return (
        <div className='c-modal'>
            <div className='c-modal__body'>
                <section className='c-modal__body__head'>
                {page === 1 && (
                    <button className='c-btn--general' onClick={close}>
                    閉じる
                    </button>
                )}
                {page === 2 && (
                    <button className='c-btn--general' onClick={goBack}>
                    戻る
                    </button>
                )}

                <h3>日報作成</h3>

                {page === 1 && (
                    <button className='c-btn--general' onClick={goNext}>
                    次へ
                    </button>
                )}
                {page === 2 && (
                    <button className='c-btn--general' onClick={handleSubmit}>
                    投稿
                    </button>
                )}
                </section>

                {page === 1 && (
                <div className='p-dailyReport'>
                    <dl className='p-dailyReport__field time'>
                    <dt>日付</dt>
                    <dd>{formattedDate}</dd>
                    <dt>勤務時間</dt>
                    <dd>10:00 ~ {endTime}</dd>
                    </dl>

                    {renderTaskSection('完了')}
                    {renderTaskSection('作業中')}
                    {renderTaskSection('明日の作業')}
                </div>
                )}

                {page === 2 && (
                <div className='p-dailyReport'>
                    <div className='p-dailyReport__field'>
                    <h4>質問・相談</h4>
                    </div>
                    <div className='p-dailyReport__field'>
                    <h4>所感</h4>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
}
