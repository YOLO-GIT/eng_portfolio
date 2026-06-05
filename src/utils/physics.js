export function calculateMomentum(ball) {
    // If the ball is null or undefined, return 0 instead of crashing
    if (!ball || !ball.velocity) return 0;

    const speed = Math.sqrt(
        ball.velocity.x ** 2 +
        ball.velocity.y ** 2
    )

    return ball.mass * speed
}

export function calculateKE(ball) {
    // If the ball is null or undefined, return 0 instead of crashing
    if (!ball || !ball.velocity) return 0;

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