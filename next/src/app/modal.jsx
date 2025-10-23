'use client'

import React from "react"

export const Modal = ({ setModal }) => {
    return (
        <div className="c-modal">
            <div className="c-modal__contents">
                <button className="c-modal__btn--close" onClick={() => setModal(false)}>閉じる</button>
            </div>
        </div>
    )
}