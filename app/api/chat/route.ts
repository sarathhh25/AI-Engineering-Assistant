import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Chat with AI Engineering Assistant
 *     description: Submit a query along with optional repository context and attached file contents to receive AI-powered engineering analysis.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Review this configuration file for security vulnerabilities."
 *               repo:
 *                 type: string
 *                 example: "ai-engineering-assistant"
 *               files:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - fileName
 *                     - content
 *                   properties:
 *                     fileName:
 *                       type: string
 *                       example: "next.config.mjs"
 *                     content:
 *                       type: string
 *                       example: "export default { reactStrictMode: true };"
 *     responses:
 *       200:
 *         description: Successful AI response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reply:
 *                   type: string
 *                 status:
 *                   type: string
 *                   example: "success"
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { message, repo = "ai-engineering-assistant", files = [] } = body;

        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${backendUrl}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, repo, files }),
        });

        if (res.ok) {
            const data = await res.json();
            return NextResponse.json(data);
        }

        const fileSummary = files.length > 0 ? ` (${files.length} attached file(s): ${files.map((f: any) => f.fileName).join(", ")})` : "";
        return NextResponse.json({
            reply: `Received message for \`${repo}\`${fileSummary}: "${message}". (Backend fallback mode).`,
            status: "fallback"
        });
    } catch (error: any) {
        return NextResponse.json({
            reply: `⚠️ Error processing chat request: ${error.message}`,
            status: "error"
        }, { status: 500 });
    }
}
