import { master } from "./master"

export const format = (value = '', label = '', type = '') => {
    /** transform value */
    switch (type) {
        case 'id':
            value = master[label][value]
            break
        case 'date':
            value = value.replace(/-/g, "/")
            break
    }
    switch (label) {
        case 'complete_ratio':
            return `${value}%`
        default:
            return value
    }
}