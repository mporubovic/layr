
const menus = []

export default menus

export function registerMenu(menu) {
    menus.push(menu)
}

export function unregisterMenu(id) {
    let idx = menus.find(m => m.contentId === id)
    menus.splice(idx, 1)
}