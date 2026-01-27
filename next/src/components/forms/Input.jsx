'use client';

import React from 'react';

export default function Input({
    type = 'text',
    value = '',
    onChange = () => {},
}) {
    return (
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`c-input--${type}`}
        />
    );
}