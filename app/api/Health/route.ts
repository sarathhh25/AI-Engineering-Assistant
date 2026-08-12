import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: System Health Check
 *     description: Returns the operational status of the AI Engineering Copilot API.
 *     responses:
 *       200:
 *         description: System is operational
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 timestamp:
 *                   type: string
 *                   example: "2026-08-10T15:36:20.000Z"
 */
export async function GET() {
    return NextResponse.json({
        status: "ok",
        timestamp: new Date().toISOString()
    }, { status: 200 });
}