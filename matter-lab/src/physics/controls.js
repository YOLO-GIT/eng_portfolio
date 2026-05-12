import Matter from 'matter-js'

const {
    Mouse,
    MouseConstraint,
    Composite
} = Matter

export function addMouseControl(engine, render) {

    const mouse = Mouse.create(render.canvas)

    const mouseConstraint =
        MouseConstraint.create(engine, {
            mouse
        })

    Composite.add(
        engine.world,
        mouseConstraint
    )

}