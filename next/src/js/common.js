import { useState } from 'react';

export const modalHook = () => {
    const [modal, setModal] = useState(false);

    return {
        modal,
        setModal
    };
};