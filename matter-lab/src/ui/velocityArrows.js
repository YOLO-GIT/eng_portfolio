export function drawVelocityArrow(
    context,
    ball,
    color = 'white'
) {

    const pos = ball.position
    const vel = ball.velocity

    // Arrow scaling
    const scale = 10

    const endX =
        pos.x + vel.x * scale

    const endY =
        pos.y + vel.y * scale

    // Draw line
    context.beginPath()

    context.moveTo(pos.x, pos.y)

    context.lineTo(endX, endY)

    context.strokeStyle = color
    context.lineWidth = 3

    context.stroke()

    // Draw arrow head
    const angle =
        Math.atan2(
            endY - pos.y,
            endX - pos.x
        )

    const headLength = 12

    context.beginPath()

    context.moveTo(endX, endY)

    context.lineTo(
        endX - headLength * Math.cos(angle - Math.PI / 6),
        endY - headLength * Math.sin(angle - Math.PI / 6)
    )

    context.lineTo(
        endX - headLength * Math.cos(angle + Math.PI / 6),
        endY - headLength * Math.sin(angle + Math.PI / 6)
    )

    context.closePath()

    context.fillStyle = color

    context.fill()

}