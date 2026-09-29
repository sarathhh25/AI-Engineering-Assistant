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

        const authHeader = req.headers.get("authorization");
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        let res;
        try {
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (authHeader) {
                headers["Authorization"] = authHeader;
            }

            res = await fetch(`${backendUrl}/api/chat`, {
                method: "POST",
                headers,
                body: JSON.stringify({ message, repo, files }),
            });
        } catch (fetchError: any) {
            return NextResponse.json({
                reply: `⚠️ Unable to reach backend service at ${backendUrl}. Please ensure FastAPI is running on port 8000.`,
                status: "error"
            }, { status: 502 });
        }

        if (res.ok) {
            const data = await res.json();
            return NextResponse.json(data);
        }

        const errText = await res.text().catch(() => "Unknown error");
        return NextResponse.json({
            reply: `⚠️ Backend returned error (${res.status}): ${errText}`,
            status: "error"
        }, { status: res.status });
    } catch (error: any) {
        return NextResponse.json({
            reply: `⚠️ Error processing chat request: ${error.message}`,
            status: "error"
        }, { status: 500 });
    }
}
