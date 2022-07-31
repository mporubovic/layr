import contentTypes, {getIcon} from "./Content/contentTypes";
import programs from "./Programs/programs";

export const canvasCommands = []

export function register(callbacks) {

    const commandArgumentToProperty = {
        [contentTypes.TEXT]: 'text',
        [contentTypes.LINK]: 'src',
        [contentTypes.HTML]: 'html',
        [contentTypes.YOUTUBE]: 'src'
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

    canvasCommands.push({
        name: 'wikidata',
        displayName: 'wikidata',
        icon: require('./Programs/Wikidata/Wikidata-logo-top-white.svg').default,
        callback: (data) => callbacks.openProgram(programs.WIKIDATA),
        // argument: 'name',
        prefix: '/'
    })
}

export function reset() {
    canvasCommands.length = 0
}