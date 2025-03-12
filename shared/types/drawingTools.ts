export type DrawingTool = {
    type: string;
    color?: string;
    width?: number;
};

export const DEFAULT_DRAWING_TOOLS: Record<string, DrawingTool> = {
    pen: {
        type: 'pen',
        options: {
            opacity: 1,
            smoothing: 0.5
        }
    },
    brush: {
        type: 'brush',
        options: {
            opacity: 0.8,
            smoothing: 0.3
        }
    },
    eraser: {
        type: 'eraser',
        options: {
            opacity: 1,
            smoothing: 0.2
        }
    }
};
