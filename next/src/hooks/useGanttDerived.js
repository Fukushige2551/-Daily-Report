'use client';

import { useMemo } from 'react';

export function useGanttDerived(tasks = [], viewStart) {
    /** ---------- util（ガント） ---------- */
    const parseDate = (s) => {
        const [y, m, d] = String(s).split('-').map(Number);
        return new Date(y, (m || 1) - 1, d || 1);
    };
    const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const tasksD = useMemo(
        () =>
        (tasks ?? []).map((t) => ({
            ...t,
            _start: t.start_date ? parseDate(t.start_date) : null,
            _end: t.end_date ? parseDate(t.end_date) : null,
        })),
        [tasks]
    );

    const initialMonthStart = useMemo(() => {
        const withStart = tasksD.filter((t) => t._start);
        if (withStart.length === 0) return startOfMonth(new Date());
        const rawMin = new Date(Math.min(...withStart.map((t) => t._start.getTime())));
        return startOfMonth(rawMin);
    }, [tasksD]);

    const viewEnd = useMemo(() => {
        // viewStart が未設定の場合でも落ちないように保険
        const base = viewStart ?? initialMonthStart;
        return endOfMonth(base);
    }, [viewStart, initialMonthStart]);

    const visibleTasks = useMemo(() => {
        const start = viewStart ?? initialMonthStart;
        const end = viewEnd;

        return tasksD
        .map((t) => {
            if (!t._start || !t._end) return null;
            if (t._end < start || t._start > end) return null;

            const clampedStart = t._start < start ? start : t._start;
            const clampedEnd = t._end > end ? end : t._end;
            return { ...t, _startV: clampedStart, _endV: clampedEnd };
        })
        .filter(Boolean);
    }, [tasksD, viewStart, initialMonthStart, viewEnd]);

    const listGroups = useMemo(() => {
        const map = new Map();
        visibleTasks.forEach((t) => {
        const pid = t.project_id;
        if (!map.has(pid)) map.set(pid, []);
        map.get(pid).push(t);
        });

        // プロジェクト昇順、プロジェクト内は開始日→IDでソート
        const entries = [...map.entries()].sort((a, b) => a[0] - b[0]);
        entries.forEach(([_, arr]) => {
        arr.sort((a, b) => {
            const aStart = a._startV?.getTime() ?? 0;
            const bStart = b._startV?.getTime() ?? 0;
            return aStart - bStart || a.id - b.id;
        });
        });

        return entries; // [ [project_id, Task[]], ... ]
    }, [visibleTasks]);

    return {
        tasksD,
        initialMonthStart,
        viewEnd,
        visibleTasks,
        listGroups,
    };
}
