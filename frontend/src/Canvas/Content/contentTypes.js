const types = {
    TEXT: 'text',
    VIDEO: 'video',
    IMAGE: 'image',
    LINK: 'link',
    HTML: 'html'
}

export default {...types}

const getComponentFileName = (content) => {
    let _ = types[content.toUpperCase()]
    if (!_) throw new Error("Invalid content " + content)
    return _.charAt(0).toUpperCase() + _.slice(1)
}

export function getComponent(content) {
    return require(`./${getComponentFileName(content)}/${getComponentFileName(content)}`).default
}

export function getIcon(content) {
    return require(`./${getComponentFileName(content)}/${getComponentFileName(content)}.svg`)
}

export function getProcessFunction(content) {
    return require(`./${getComponentFileName(content)}/process.js`).default
}