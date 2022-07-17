import './Navigation.sass'

const concepts = [
    {
        name: "Philosophy",
        style: {
            gridArea: "1 / 1 / 3 / 2",
        },
        labelStyle: {
            transform: "rotate(90deg)"
        }
    },

    {
        name: "Film",
        style: {
            gridArea: "1 / 2 / 2 / 4"
        }
    },

    {
        name: "Computer Science",
        style: {
            gridArea: "2 / 2 / 3 / 4"
        },
        labelStyle: {
            transform: "rotate(-90deg)"
        }
    }
]

export default function Navigation() {




    return (
        <div className="navigation">

            <div className="header">NAVIGATION</div>

            {
                concepts.map(c => (
                    <div key={c.name} className="cell" style={c.style}>
                        <div className="label" style={c.labelStyle}>
                            {c.name}
                        </div>

                        {

                        }
                    </div>
                ))
            }

        </div>
    )
}