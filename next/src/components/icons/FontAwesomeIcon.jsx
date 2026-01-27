import { library } from '@fortawesome/fontawesome-svg-core';

// 必要なアイコンをここに読み込む
import {
    faTrash,
    faEdit,
    faPlus,
    faUser,
    faCoffee,
} from '@fortawesome/free-solid-svg-icons';

// ライブラリに一括登録
library.add(faTrash, faEdit, faPlus, faUser, faCoffee);

export { FontAwesomeIcon } from '@fortawesome/react-fontawesome';