'use client'
import React from "react"
import { master } from "@/js/master"
import '../style/app/dailyReport.scss'

export const Modal = ({
    setModal,
    setModalDailyReport,
    listGroups
}) => {
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

    console.log(listGroups)
    console.log(master)

    return (
        <div className="c-modal">
            <div className="c-modal__body">
                <section className="c-modal__body__head">
                    <button className="c-btn--general" onClick={() => closeModal()}>閉じる</button>
                    <h3>日報作成</h3>
                    <button className="c-btn--general" onClick={() => closeModal()}>次へ</button>
                </section>
                <div className="p-dailyReport">
                    <dl className="p-dailyReport__time field">
                        <dt>日付</dt>
                        <dd>{formatted}</dd>
                        <dt>勤務時間</dt>
                        <dd>10:00 ~ {timeString}</dd>
                    </dl>

                    <div className="field">
                        <h4>完了</h4>
                        
                    </div>

                    <div className="field">
                        <h4>作業中</h4>
                        <dl className="p-dailyReport__completed">
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

                    <div className="field">
                        <h4>明日の作業</h4>
                    </div>

                    <div className="field">
                        <h4>質問・相談</h4>
                    </div>

                    <div className="field">
                        <h4>所感</h4>
                    </div>
                </div>
            </div>
        </div>
    )
}