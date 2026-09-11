'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { 
    ssr: false,
    loading: () => <div className="p-8 text-center text-muted-foreground">Loading API Documentation...</div>
});

type Props = {
    spec: Record<string, any>;
};

function ReactSwagger({ spec }: Props) {
    return (
        <div className="bg-white min-h-screen text-slate-900 rounded-lg shadow-sm">
            <SwaggerUI spec={spec} />
        </div>
    );
}

export default ReactSwagger;