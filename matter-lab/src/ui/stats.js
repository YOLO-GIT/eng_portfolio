export function updateStats(
    ball,
    velocityText,
    momentumText,
    energyText
) {

    const speed = Math.sqrt(
        ball.velocity.x ** 2 +
        ball.velocity.y ** 2
    )

    velocityText.innerText =
        `Velocity: ${speed.toFixed(2)}`

    const momentum =
        (ball.mass * speed)
            .toFixed(2)

    momentumText.innerText =
        `Momentum: ${momentum}`

    const kineticEnergy =
        (
            0.5 *
            ball.mass *
            speed *
            speed
        ).toFixed(2)

    energyText.innerText =
        `Kinetic Energy: ${kineticEnergy}`
}