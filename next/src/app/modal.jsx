'use client'
import React from "react"
import { useState } from "react"
import { master } from "@/js/master"
import '../style/app/dailyReport.scss'

export const Modal = ({
    setModal,
    setModalDailyReport,
    listGroups
}) => {
    const [page, setPage] = useState(1);

    const closeModal = () => {
        setModal(false);
        setModalDailyReport(false);
    }

    // 今日の日付を取得
    const today = new Date();

    // 曜日配列
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

    // 年・月・日・曜日を取得
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const date = String(today.getDate()).padStart(2, '0');
    const weekday = weekdays[today.getDay()];

    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    // フォーマット整形
    const formatted = `${year}年${month}月${date}日(${weekday})`;

    return (
        <div className="c-modal">
            <div className="c-modal__body">
                <section className="c-modal__body__head">
                    {page === 1 && <button className="c-btn--general" onClick={() => closeModal()}>閉じる</button>}
                    {page === 2 && <button className="c-btn--general" onClick={() => setPage(1)}>戻る</button>}
                    <h3>日報作成</h3>
                    {page === 1 && <button className="c-btn--general" onClick={() => setPage(2)}>次へ</button>}
                    {page === 2 && <button className="c-btn--general" onClick={() => closeModal()}>投稿</button>}
                </section>

                {/* 1ページ目 */}
                {page === 1 && <div className="p-dailyReport">
                    <dl className="p-dailyReport__field time">
                        <dt>日付</dt>
                        <dd>{formatted}</dd>
                        <dt>勤務時間</dt>
                        <dd>10:00 ~ {timeString}</dd>
                    </dl>

                    <div className="p-dailyReport__field">
                        <h4>完了</h4>
                        <dl className="task">
                            {listGroups.map(l => {
                                return <React.Fragment key={l[0]}>
                                    <dt>{master.project_id[l[0]]}</dt>
                                    <dd>
                                        <ul>
                                            {l[1].map(t => {
                                                return <li key={t.id}>{t.name}</li>
                                            })}
                                        </ul>
                                    </dd>
                                </React.Fragment>
                            })}
                        </dl>
                    </div>

                    <div className="p-dailyReport__field">
                        <h4>作業中</h4>
                        <dl className="task">
                            {listGroups.map(l => {
                                return <React.Fragment key={l[0]}>
                                    <dt>{master.project_id[l[0]]}</dt>
                                    <dd>
                                        <ul>
                                            {l[1].map(t => {
                                                return <li key={t.id}>{t.name}</li>
                                            })}
                                        </ul>
                                    </dd>
                                </React.Fragment>
                            })}
                        </dl>
                    </div>

                    <div className="p-dailyReport__field">
                        <h4>明日の作業</h4>
                        <dl className="task">
                            {listGroups.map(l => {
                                return <React.Fragment key={l[0]}>
                                    <dt>{master.project_id[l[0]]}</dt>
                                    <dd>
                                        <ul>
                                            {l[1].map(t => {
                                                return <li key={t.id}>{t.name}</li>
                                            })}
                                        </ul>
                                    </dd>
                                </React.Fragment>
                            })}
                        </dl>
                    </div>
                </div>}

                {/* 2ページ目 */}
                {page === 2 && <div className="p-dailyReport">
                    <div className="p-dailyReport__field">
                        <h4>質問・相談</h4>
                    </div>

                    <div className="p-dailyReport__field">
                        <h4>所感</h4>
                    </div>
                </div>}
            </div>
        </div>
    )
}