export const runtime = 'nodejs'; // or 'edge'

export async function GET(request: Request) {
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
        async start(controller) {
            // Send initial data
            const sendData = (data: any) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            const interval = setInterval(() => {
                // Simulate varying traffic density
                const simulatedUpdate = {
                    timestamp: new Date().toISOString(),
                    roads: [
                        { id: "1", density: Math.floor(Math.random() * 100), lightStatus: Math.random() > 0.5 ? 'green' : 'red' },
                        { id: "2", density: Math.floor(Math.random() * 100), lightStatus: Math.random() > 0.5 ? 'green' : 'red' },
                    ]
                };
                sendData(simulatedUpdate);
            }, 3000); // Update every 3 seconds

            request.signal.addEventListener('abort', () => {
                clearInterval(interval);
                controller.close();
            });
        },
    });

    return new Response(readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
