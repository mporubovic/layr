import contentTypes, {getIcon} from "../Content/contentTypes";
import programs from "../Programs/programs";

export const commands = {
    concept: {
        create: null,
        open: null
    },

    content: {
        create: {}
    }
}

const addCommand = (_path, data) => {
    let ref = commands
    let path = _path.split('.')

    for (let i = 0; i < path.length; i++) {
        let key = path[i]
        if (!ref[key]) {
            if (i === path.length-1) ref[key] = { ...data, name: key, id: path }
            else ref[key] = {}
        }
        ref = ref[key]
    }
}

const commandArgumentToProperty = {
    [contentTypes.TEXT]: 'text',
    [contentTypes.LINK]: 'src',
    [contentTypes.HTML]: 'html',
    [contentTypes.YOUTUBE]: 'src'
}

export function register(callbacks) {
    Object.entries(contentTypes).forEach(e => {
        let [key, value] = e

        addCommand(`content.create.${value}` , {
            displayName: value,
            icon: getIcon(key),
            callback: (data) => callbacks.createContent(value, { [commandArgumentToProperty[key]]: data }),
        })
    })

    addCommand('concept.create', {
        displayName: 'concept',
        icon: require('../icons/cloud.svg').default,
        callback: (data) => callbacks.createConcept({ name: data }),
    })

    addCommand('program.wikidata', {
        displayName: 'wikidata',
        icon: require('../Programs/Wikidata/Wikidata-logo-top-white.svg').default,
        callback: (data) => callbacks.openProgram(programs.WIKIDATA),
    })
}

export function reset() {
    commands.length = 0
}