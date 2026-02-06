'use client';

import { useState, useEffect, useRef, Fragment } from 'react';
import { FontAwesomeIcon } from './icons/FontAwesomeIcon';
import Input from './forms/Input';
import RangeCalendar from "./forms/RangeCalender.jsx";
import TextArea from './forms/textarea';

export default function TaskList({
    tasks = [],
    projectRow = [],
    onChangeProjectEdit,
    onAddProjectRow,
    onDeleteProjectRow,
    onAddTaskRow,
    onChangeTaskEdit,
    onDeleteTaskRow,
}) {
    /**
     * プロジェクトメニュー
     */
    const projectOptionRef = useRef(null);

    // オプションの開閉
    const [openProjectFunction, setOpenProjectFunction] = useState({
        id: null, open: false,
    });

    // メニューボタン群
    const projectMennuBtns = () => {
        return [
            { id: 1, type: 'sort', icon: 'link', display: '', action: () => {} },
            { id: 2, type: 'sort', icon: 'unlink', display: '', action: () => {} },
            { id: 3, type: 'delete', icon: 'trash', display: '', action: (id) => { setOpenProjectFunction({ id: null, open: false }); onDeleteProjectRow(id);} },
        ]
    }

    /**
     * タスクメニュー
     */
    const taskOptionRef = useRef(null);

    // オプションの開閉
    const [openTaskFunction, setOpenTaskFunction] = useState({
        id: null, open: false,
    });

    // メニューボタン群
    const taskMennuBtns = () => {
        return [
            { id: 1, type: 'sort', icon: 'link', display: '', action: () => {} },
            { id: 2, type: 'sort', icon: 'unlink', display: '', action: () => {} },
            { id: 3, type: 'delete', icon: 'trash', display: '', action: (id) => { setOpenTaskFunction({ id: null, open: false }); onDeleteTaskRow(id);} },
        ]
    }

    // メモ（TextArea）開閉
    const [openMemoTaskIds, setOpenMemoTaskIds] = useState(() => new Set());

    /**
     * カレンダー
     */
    const calendarRef = useRef(null);

    // カレンダーID開閉
    const [openCalendarTaskId, setOpenCalendarTaskId] = useState(null);

    // 日付変換ユーティリティ
    const toYMD = (d) => {
        if (!d) return '';
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };
    const fromYMD = (s) => {
        if (!s) return null;
        const [y, m, d] = s.split('-').map(Number);
        if (!y || !m || !d) return null;
        const dt = new Date(y, m - 1, d);
        dt.setHours(0, 0, 0, 0);
        return dt;
    };

    /**
     * 外側クリックでメニューを閉じる
     */
    useEffect(() => {
        const handleClickOutside = (event) => {
            // プロジェクトメニューを閉じる
            if (
                projectOptionRef.current &&
                !projectOptionRef.current.contains(event.target)
            ) {
                setOpenProjectFunction({ id: null, open: false });
            }

            // タスクメニューを閉じる
            if (
                taskOptionRef.current &&
                !taskOptionRef.current.contains(event.target)
            ) {
                setOpenTaskFunction({ id: null, open: false });
            }

            // カレンダーを閉じる
            if (
                openCalendarTaskId != null &&
                calendarRef.current &&
                !calendarRef.current.contains(event.target)
            ) {
                setOpenCalendarTaskId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openCalendarTaskId]);

    return (
        <section className='p-app__section'>
            <div className='p-app__section__list'>
                {projectRow.length > 0 && projectRow.map(({ id, name }) => {
                const projectMenuOpened = openProjectFunction.open && openProjectFunction.id === id;
                const taskMenuOpened = (taskId) => openTaskFunction.open && openTaskFunction.id === taskId;

                return (

                /**
                 * プロジェクト
                 */
                <div key={id} className='p-app__section__list__project'>
                    {/* プロジェクト名 */}
                    <div className='p-app__section__list__project__header'>
                        <Input
                            name={`project_name`}
                            type='text'
                            value={name || ''}
                            placeholder={`Project ${id}`}
                            className='p-app__section__list__project__name'
                            onChange={(e) => {
                                onChangeProjectEdit(id, 'name', e);
                            }}
                        />

                        {/* プロジェクト操作 */}
                        <button
                            className='c-btn p-app__section__list__function'
                            onClick={() => setOpenProjectFunction({ id: id, open: true })}
                        >
                            <FontAwesomeIcon icon="bars" />
                        </button>
                    </div>

                    {/* プロジェクト操作オプション */}
                    <div
                        ref={projectMenuOpened ? projectOptionRef : null}
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
                    <Fragment key={task.id}>
                        <div
                            className='p-app__section__list__project__task'
                        >
                            <Input
                                name={`task_name_${task.id}`}
                                type='text'
                                value={task.name || ''}
                                placeholder={`Task ${task.id}`}
                                className='p-app__section__list__project__task__name'
                                onChange={(e) => {
                                    onChangeTaskEdit(task.id, 'name', e);
                                }}
                            />

                            {/* タスクメモ */}
                            <button
                                type="button"
                                className="c-btn p-app__section__list__project__task__btn"
                                onClick={() => {
                                    setOpenMemoTaskIds((prev) => {
                                        const next = new Set(prev);
                                        if (next.has(task.id)) next.delete(task.id);
                                        else next.add(task.id);
                                        return next;
                                    });
                                }}
                            >
                                <FontAwesomeIcon icon="file-lines" />
                            </button>

                            {/* タスクカレンダー */}
                            <button
                                type="button"
                                className="c-btn p-app__section__list__project__task__btn"
                                onClick={() => {
                                    setOpenCalendarTaskId((prev) => (prev === task.id ? null : task.id));
                                }}
                            >
                                <FontAwesomeIcon icon="clock" />
                            </button>

                            {/* タスク操作 */}
                            <button
                                className='c-btn p-app__section__list__function'
                                onClick={() => setOpenTaskFunction({ id: task.id, open: true })}
                            >
                                <FontAwesomeIcon icon="ellipsis-v" />
                            </button>

                            {/* タスク操作オプション */}
                            <div
                                ref={taskMenuOpened(task.id) ? taskOptionRef : null}
                                className={`p-app__section__list__options p-app__section__list__options--task ${
                                    taskMenuOpened(task.id) ? 'is-open' : 'is-closed'
                                }`}
                            >
                                {taskMennuBtns().map(({ id: btnId, type, icon, display, action }) => (

                                <button
                                    key={btnId}
                                    type='button'
                                    className={`c-btn c-btn--${type} p-app__section__list__options__btn`}
                                    onClick={() => action(task.id)}
                                >
                                    {icon && <FontAwesomeIcon icon={icon} />}
                                    {display}
                                </button>

                                ))}
                            </div>

                            {/* カレンダー */}
                            {openCalendarTaskId === task.id && (
                            <div ref={calendarRef}>
                                <RangeCalendar
                                    value={{
                                        start: fromYMD(task.start_date),
                                        end: fromYMD(task.end_date),
                                    }}
                                    onChange={(nextRange) => {
                                        const startYMD = nextRange.start ? toYMD(nextRange.start) : '';
                                        const endYMD = nextRange.end ? toYMD(nextRange.end) : '';

                                        // 1回目クリック：startだけ入る（endは空のまま）
                                        if (startYMD) {
                                            onChangeTaskEdit(task.id, 'start_date', startYMD);
                                        }

                                        // 2回目クリック：endが入る
                                        if (endYMD) {
                                            onChangeTaskEdit(task.id, 'end_date', endYMD);
                                        } else {
                                            // end未確定の間は end_date を空にしたいならこれ
                                            onChangeTaskEdit(task.id, 'end_date', '');
                                        }
                                    }}
                                    weekStartsOn={1}
                                />
                            </div>
                            )}
                        </div>

                        {openMemoTaskIds.has(task.id) && (
                        <TextArea
                            name={`description_${task.id}`}
                            value={task.description || ''}
                            placeholder=""
                            className="p-app__section__list__project__task--memo"
                            onChange={(e) => {
                            onChangeTaskEdit(task.id, 'description', e);
                            }}
                        />
                        )}
                    </Fragment>
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
