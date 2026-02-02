import { library } from '@fortawesome/fontawesome-svg-core';

// 必要なアイコンをここに読み込む
import {
    faTrash,
    faEdit,
    faPlus,
    faUser,
    faCoffee,
    faBars,
    faAngleDown,
    faEllipsisV,
    faSort,
    faSortUp,
    faSortDown,
    faLink,
    faUnlink,
    faCalendar,
    faCalendarDays,
    faCalendarDay,
    faCalendarWeek,
    faCalendarCheck,
    faClock,
} from '@fortawesome/free-solid-svg-icons';

// ライブラリに一括登録
library.add(
    faTrash,
    faEdit,
    faPlus,
    faUser,
    faCoffee,
    faBars,
    faAngleDown,
    faEllipsisV,
    faSort,
    faSortUp,
    faSortDown,
    faLink,
    faUnlink,
    faCalendar,
    faCalendarDays,
    faCalendarDay,
    faCalendarWeek,
    faCalendarCheck,
    faClock,
);

export { FontAwesomeIcon } from '@fortawesome/react-fontawesome';