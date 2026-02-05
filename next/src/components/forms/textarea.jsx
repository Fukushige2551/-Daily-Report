'use client';

import React from 'react';

export default function TextArea({
    name = '',
    value = '',
    placeholder = '',
    className = '',
    onChange = () => {},
}) {
    return (
        <textarea
            name={name}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={`c-textarea ${className}`}
        />
    );
}