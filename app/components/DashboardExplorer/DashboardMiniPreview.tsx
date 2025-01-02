import { getWidgetIcon } from './utils';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface MiniPreviewProps {
    dashboard: any;
    children: React.ReactNode;
}

const DashboardMiniPreview: React.FC<MiniPreviewProps> = ({ dashboard, children }) => {
    if (!dashboard.widgets) return <>{children}</>;

    const gridDimensions = dashboard.widgets.reduce(
        (acc: { rows: number; cols: number }, widget: any) => ({
            rows: Math.max(acc.rows, widget.position.row + widget.position.sizey),
            cols: Math.max(acc.cols, widget.position.col + widget.position.sizex - 1)
        }),
        { rows: 0, cols: 0 }
    );

    return (
        <HoverCard openDelay={300}>
            <HoverCardTrigger asChild>
                {children}
            </HoverCardTrigger>
            <HoverCardContent 
                side="right" 
                align="start" 
                className="w-[400px] p-3 bg-white dark:bg-gray-900 border dark:border-gray-700 shadow-lg"
            >
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[250px]">
                            {dashboard.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded-full flex-shrink-0">
                            {dashboard.widgets.length} widgets
                        </div>
                    </div>
                    <div 
                        className="grid gap-1.5 bg-gray-50/50 dark:bg-gray-800/50 p-2 rounded-lg" 
                        style={{
                            gridTemplateColumns: `repeat(${gridDimensions.cols}, minmax(0, 1fr))`,
                            aspectRatio: `${gridDimensions.cols} / ${gridDimensions.rows}`
                        }}
                    >
                        {dashboard.widgets.map((widget: any, index: number) => (
                            <div
                                key={index}
                                style={{
                                    gridColumn: `${widget.position.col} / span ${widget.position.sizex}`,
                                    gridRow: `${widget.position.row} / span ${widget.position.sizey}`
                                }}
                                className="bg-white dark:bg-gray-900 border dark:border-gray-700 shadow-sm rounded-md p-1.5 flex flex-col items-center justify-center gap-1.5 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all group"
                                title={widget.config.name}
                            >
                                {getWidgetIcon(widget.config.type)}
                                {widget.position.sizey > 1 && (
                                    <div className="w-full px-1">
                                        <div className="text-[10px] text-gray-600 dark:text-gray-400 text-center leading-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                            {widget.config.name}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
};

export default DashboardMiniPreview; 