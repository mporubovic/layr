import {v4 as uuidv4} from "uuid"

export default [
    {
        id: uuidv4(),
        name: "Product design",
        content: [
            {
                id: uuidv4(),
                type: "Image",
                src: "/chair.jpeg",
                x: 0,
                y: 0,
                scale: 0.34101559892298444
            },
            {
                id: uuidv4(),
                type: "Text",
                text: "ACRYLIC CHAIR",
                x: 10.323787567256346,
                y: -182.88007264864473,
                scale: 1.1697768426305324,
            },
            {
                id: uuidv4(),
                type: "Image",
                src: "/square.png",
                x: -199.3564832446165,
                y: -154.364600952464,
                scale: 0.1,
            },
            {
                id: uuidv4(),
                type: "Video",
                src: "/the-dark-knight.mov#t=11.5",
                x: -405.49135746142133,
                y: 0.3697147500048743,
                scale: 0.1
            }
        ]
    }
]

    // [{2298444},{"id":"862e","type":"text","text":"ACRYLIC CHAIR","x":10.323787567256346,"y":-182.88007264864473,"scale":1.1697768426305324},{"id":"54de","type":"image","src":"/square.png","x":-199.3564832446165,"y":-154.364600952464,"scale":0.1},{"id":"cd10","type":"video","src":"/the-dark-knight.mov#t=11.5","x":-405.49135746142133,"y":0.3697147500048743,"scale":0.1}]}]