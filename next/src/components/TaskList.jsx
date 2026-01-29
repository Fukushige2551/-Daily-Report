'use client';

import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from './icons/FontAwesomeIcon';
import Input from './forms/Input';

export default function TaskList({
    tasks = [],
    projectRow = [],
    onChangeProjectEdit,
    onAddProjectRow,
    onDeleteProjectRow,
    onAddTaskRow,
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

    /**
     * プロジェクト操作ボタン
     */
    const projectMennuBtns = () => {
        return [
            { id: 1, type: 'sort', icon: 'link', display: '', action: () => {} },
            { id: 2, type: 'sort', icon: 'unlink', display: '', action: () => {} },
            { id: 3, type: 'delete', icon: 'trash', display: '', action: (id) => { setOpenFunction({ id: null, open: false }); onDeleteProjectRow(id);} },
        ]
    }

    return (
        <section className='p-app__section'>
            <div className='p-app__section__list'>
                {projectRow.length > 0 && projectRow.map(({ id, name }) => {
                const projectMenuOpened = openFunction.open && openFunction.id === id;

                return (

                /**
                 * プロジェクト
                 */
                <div key={id} className='p-app__section__list__project'>
                    {/* プロジェクト名 */}
                    <Input
                        name={`project_name`}
                        type='text'
                        value={name || ''}
                        placeholder='プロジェクト名'
                        className='p-app__section__list__project__name'
                        onChange={(e) => {
                            onChangeProjectEdit(id, 'name', e);
                        }}
                    />

                    {/* プロジェクト操作 */}
                    <button
                        className='c-btn p-app__section__list__function'
                        onClick={() => setOpenFunction({ id: id, open: true })}
                    >
                        <FontAwesomeIcon icon="bars" />
                    </button>

                    {/* 操作オプション */}
                    <div
                        ref={projectMenuOpened ? optionRef : null}
                        className={`p-app__section__list__options ${projectMenuOpened ? 'is-open' : 'is-closed'}`}
                    >
                        {projectMennuBtns().map(({ id: btnId, type, icon, display, action }) => (

                        <button
                            key={btnId}
                            type='button'
                            className={`c-btn c-btn--${type} p-app__section__list__options__btn`}
                            onClick={() => action(id)}
                        >
                            { icon && <FontAwesomeIcon icon={icon} /> }
                            { display }
                        </button>

                        ))}
                    </div>

                    {/* タスク */}
                    {tasks.filter(task => task.project_id === id).map(task => (
                    <div key={task.id} className='p-app__section__list__project__task'>
                        <Input
                            name={`task_name_${task.id}`}
                            type='text'
                            value={task.name || ''}
                            placeholder='タスク名'
                            className='p-app__section__list__project__task__name'
                            onChange={(e) => {
                                () => {};
                            }}
                        />
                    </div>
                    ))}

                    {/* タスク追加 */}
                    <button
                        type='button'
                        className='c-btn p-app__section__list__project__task--add'
                        onClick={() => onAddTaskRow({ project_id: id })}
                    >
                        <FontAwesomeIcon icon="plus" />
                    </button>
                </div>

                );
                })}

                <div className='p-app__section__list__project c-row--add' onClick={() => onAddProjectRow()}>
                    <span className='c-btn--add'></span>
                </div>
            </div>
        </section>
    );
}
