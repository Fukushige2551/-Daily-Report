'use client';

import React from 'react';

export default function Input({
    name = '',
    type = 'text',
    value = '',
    placeholder = '',
    className = '',
    onChange = () => {},
}) {
    return (
        <input
            name={name}
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={`c-input c-input--${type} ${className}`}
        />
    );
}