import contentTypes, {getIcon} from "../Content/contentTypes";
import {state} from "../../state/state";
import {createConcept} from "../../state/concepts";
import {createContent} from "../../state/concept";

const canvasCommands = []
const contentCommands = []
export {canvasCommands, contentCommands}

const commandArgumentToProperty = {
    [contentTypes.TEXT]: 'text',
    [contentTypes.LINK]: 'src',
    [contentTypes.HTML]: 'html',
    [contentTypes.YOUTUBE]: 'src'
}

export function register() {
    Object.entries(contentTypes).forEach(e => {
        let [key, value] = e

        canvasCommands.push({
            name: value,
            displayName: value,
            icon: getIcon(key),
            // callback: (data) => callbacks.createContent(value, { [commandArgumentToProperty[key]]: data }),
            callback: (data) => state.dispatch(createContent({ type: value, data: { [commandArgumentToProperty[value]]: data } }))
        })
    })

    canvasCommands.push({
        name: 'concept',
        displayName: 'concept',
        icon: require('../icons/cloud.svg').default,
        callback: (data) => state.dispatch(createConcept({ name: data })),
    })

    // addCommand('program.wikidata', {
    //     displayName: 'wikidata',
    //     icon: require('../Programs/Wikidata/Wikidata-logo-top-white.svg').default,
    //     callback: (data) => callbacks.openProgram(programs.WIKIDATA),
    // })
}

export function clearCommands() {
    canvasCommands.length = 0
}
