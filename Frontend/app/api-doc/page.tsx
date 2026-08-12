import { getApiDocs } from "@/lib/swagger";
import ReactSwagger from "./react-swagger";

export const metadata = {
  title: 'API Documentation | AI Engineering Copilot',
  description: 'Interactive OpenAPI and Swagger documentation for the Next.js API.',
};

export default async function IndexPage() {
  const spec = await getApiDocs();
  return (
    <main className="min-h-screen w-full bg-white">
      <ReactSwagger spec={spec} />
    </main>
  );
}