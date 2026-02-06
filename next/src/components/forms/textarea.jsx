'use client';

import React, { useRef, useEffect } from 'react';

export default function TextArea({
    name = '',
    value = '',
    placeholder = '',
    className = '',
    onChange = () => {},
    minHeight = 16, // 任意: 最小高さ 16px
}) {
    const textareaRef = useRef(null);

    // 高さ自動調整関数
    const autoResize = () => {
        const el = textareaRef.current;
        if (!el) return;

        el.style.height = "auto"; // 一度リセット
        el.style.height = Math.max(el.scrollHeight, minHeight) - 16 + "px";
    };

    // value 変更時も高さ調整
    useEffect(() => {
        autoResize();
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            name={name}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={`c-textarea ${className}`}
            style={{
                fontSize: 14,
                lineHeight: '1.2',
                minHeight: minHeight,
                overflow: 'hidden',
                resize: 'none', // ユーザーによる手動リサイズを禁止（任意）
            }}
        />
    );
}
