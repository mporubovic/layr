import contentTypes, {getIcon} from "./Content/contentTypes";

export const canvasCommands = []

export function register(callbacks) {

    const commandArgumentToProperty = {
        [contentTypes.TEXT]: 'text',
        [contentTypes.LINK]: 'src',
        [contentTypes.HTML]: 'html',
    }

    Object.entries(contentTypes).forEach(e => {
        let [key, value] = e
        canvasCommands.push ({
            name: value,
            displayName: value,
            icon: getIcon(key),
            callback: (data) => callbacks.createContent(value, data),
            ...(commandArgumentToProperty[value] && { argument: commandArgumentToProperty[value] }),
            prefix: '/'
        })
    })

    canvasCommands.push({
        name: 'concept',
        displayName: 'concept',
        icon: require('./icons/cloud.svg').default,
        callback: (data) => callbacks.createConcept(data),
        argument: 'name',
        prefix: '/'
    })
}

export function reset() {
    canvasCommands.length = 0
}