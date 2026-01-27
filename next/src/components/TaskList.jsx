'use client';

import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from './icons/FontAwesomeIcon';
import Input from './forms/Input';

export default function TaskList({
    maxId,
    projectRow = [],
    onChangeProjectEdit,
    onAddProjectRow,
    onDeleteProjectRow,
}) {
    const optionRef = useRef(null);

    // プロジェクト行オプションの開閉
    const [openFunction, setOpenFunction] = useState({
        id: null, open: false,
    });

    /**
     * 外側クリックでメニューを閉じる
     */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                optionRef.current &&
                !optionRef.current.contains(event.target)
            ) {
                setOpenFunction({ id: null, open: false });
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <section className='p-app__section'>
            <div className='p-app__section__list'>
                {projectRow.length > 0 && projectRow.map(({ id, name}, i) => {
                return (

                <div key={id} className='p-app__section__list__project'>
                    <Input
                        type='text'
                        value={name || ''}
                        onChange={(e) => {
                            onChangeProjectEdit(id, 'name', e);
                        }}
                    />
                    <button
                        className='c-btn p-app__section__list__function'
                        onClick={() => setOpenFunction({ id: id, open: true })}
                    >
                    </button>

                    {openFunction.open && openFunction.id === id &&
                    <div ref={optionRef} className='c-btn p-app__section__list__options'>
                        <button
                            type='button'
                            className='c-btn p-app__section__list__options__btn'
                            onClick={() => onDeleteProjectRow(id)}
                        >
                            <FontAwesomeIcon icon="trash" />
                        </button>
                    </div>
                    }
                </div>

                );
                })
                }

                <div className='p-app__section__list__project c-row--add' onClick={() => onAddProjectRow(maxId + 1)}>
                    <span className='c-btn--add'></span>
                </div>
            </div>
        </section>
    );
}
