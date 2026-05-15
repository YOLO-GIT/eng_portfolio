export function calculateMomentum(ball) {

    const speed = Math.sqrt(
        ball.velocity.x ** 2 +
        ball.velocity.y ** 2
    )

    return ball.mass * speed
}

export function calculateKE(ball) {

    const speed = Math.sqrt(
        ball.velocity.x ** 2 +
        ball.velocity.y ** 2
    )

    return (
        0.5 *
        ball.mass *
        speed *
        speed
    )

}