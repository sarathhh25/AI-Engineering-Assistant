import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
    const spec = createSwaggerSpec({
        apiFolder: "app/api", // Define the API folder under your app directory
        definition: {
            openapi: "3.0.0",
            info: {
                title: "AI Engineering Copilot API",
                version: "1.0.0",
                description: "Interactive OpenAPI documentation for the AI Engineering Copilot endpoints.",
            },
            components: {
                securitySchemes: {
                    BearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT",
                    },
                },
            },
            security: [],
        },
    });
    return spec;
};