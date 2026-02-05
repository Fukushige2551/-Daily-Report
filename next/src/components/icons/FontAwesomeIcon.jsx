import { library } from '@fortawesome/fontawesome-svg-core';

// 必要なアイコンをここに読み込む
import {
    faTrash,
    faPlus,
    faBars,
    faEllipsisV,
    faLink,
    faUnlink,
    faClock,
    faFileLines,
} from '@fortawesome/free-solid-svg-icons';

// ライブラリに一括登録
library.add(
    faTrash,
    faPlus,
    faBars,
    faEllipsisV,
    faLink,
    faUnlink,
    faClock,
    faFileLines,
);

export { FontAwesomeIcon } from '@fortawesome/react-fontawesome';