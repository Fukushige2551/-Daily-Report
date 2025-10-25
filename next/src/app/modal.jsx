'use client'

import React from "react"

export const Modal = ({
    setModal,
    setModalDailyReport
}) => {
    const closeModal = () => {
        setModal(false);
        setModalDailyReport(false);
    }

    return (
        <div className="c-modal">
            <div className="c-modal__body">
                <div className="c-modal__body__head">
                    <button className="c-btn--general" onClick={() => closeModal()}>閉じる</button>
                    <h3>日報作成</h3>
                    <button className="c-btn--general" onClick={() => closeModal()}>次へ</button>
                </div>
            </div>
        </div>
    )
}