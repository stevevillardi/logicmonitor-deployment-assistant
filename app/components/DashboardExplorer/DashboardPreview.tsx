import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getWidgetIcon } from './utils';
import { X } from 'lucide-react';
import { LayoutDashboard, Palette, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DashboardPreviewProps {
    isOpen: boolean;
    onClose: () => void;
    dashboard: any;
}

const getWidgetPreview = (widget: any) => {
    const type = widget.config.type;
    
    switch (type) {
        // Graph Types
        case 'ngraph':
        case 'ograph':
        case 'cgraph':
        case 'sgraph':
        case 'netflowgraph':
        case 'groupNetflowGraph':
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <div className="w-full h-32 relative">
                        <div className="absolute inset-0 grid grid-cols-6 grid-rows-4">
                            {Array.from({ length: 24 }).map((_, i) => (
                                <div key={i} className="border-r border-t border-gray-100" />
                            ))}
                        </div>
                        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                            {type === 'ngraph' && (
                                <path 
                                    d="M0,80 C30,70 60,90 90,50 C120,10 150,60 180,40 C210,20 240,30 270,25 C300,20 330,40 360,30" 
                                    className="stroke-blue-500 stroke-2 fill-none"
                                />
                            )}
                            {type === 'cgraph' && (
                                <>
                                    <path 
                                        d="M0,60 C30,50 60,70 90,30 C120,10 150,40 180,20 C210,10 240,20 270,15 C300,10 330,30 360,20" 
                                        className="stroke-indigo-500 stroke-2 fill-none"
                                    />
                                    <path 
                                        d="M0,100 C30,90 60,110 90,70 C120,50 150,80 180,60 C210,40 240,50 270,45 C300,40 330,60 360,50" 
                                        className="stroke-blue-400 stroke-2 fill-none"
                                    />
                                </>
                            )}
                            {type === 'sgraph' && (
                                <>
                                    <path 
                                        d="M0,70 C30,90 60,50 90,80 C120,40 150,70 180,30 C210,60 240,40 270,70 C300,30 330,60 360,40" 
                                        className="stroke-purple-500 stroke-2 fill-none"
                                    />
                                    <path 
                                        d="M0,70 C30,90 60,50 90,80 C120,40 150,70 180,30 C210,60 240,40 270,70 C300,30 330,60 360,40" 
                                        className="stroke-purple-200 stroke-[8] fill-none opacity-20"
                                    />
                                </>
                            )}
                            {(type === 'netflowgraph' || type === 'groupNetflowGraph') && (
                                <>
                                    <path 
                                        d="M0,90 C60,40 120,80 180,30 C240,70 300,20 360,60" 
                                        className="stroke-teal-500 stroke-2 fill-none"
                                    />
                                    <path 
                                        d="M0,50 C60,80 120,30 180,70 C240,20 300,60 360,30" 
                                        className="stroke-blue-400 stroke-2 fill-none opacity-50"
                                    />
                                    <path 
                                        d="M0,90 C60,40 120,80 180,30 C240,70 300,20 360,60 L360,128 L0,128 Z" 
                                        className="fill-teal-50"
                                    />
                                </>
                            )}
                            {type === 'ograph' && (
                                <>
                                    <path 
                                        d="M0,60 L60,40 L120,80 L180,30 L240,50 L300,20 L360,40" 
                                        className="stroke-orange-500 stroke-2 fill-none"
                                    />
                                    <path 
                                        d="M0,60 L60,40 L120,80 L180,30 L240,50 L300,20 L360,40" 
                                        className="stroke-orange-200 stroke-[8] fill-none opacity-20"
                                    />
                                    {[0, 60, 120, 180, 240, 300, 360].map((x, i) => (
                                        <circle
                                            key={i}
                                            cx={x}
                                            cy={[60, 40, 80, 30, 50, 20, 40][i]}
                                            r="3"
                                            className="fill-orange-500"
                                        />
                                    ))}
                                </>
                            )}
                        </svg>
                        <div className="absolute left-0 inset-y-0 w-8 flex flex-col justify-between text-[10px] text-gray-400 py-1">
                            <span>100</span>
                            <span>50</span>
                            <span>0</span>
                        </div>
                    </div>
                </div>
            );

        case 'pieChart':
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-32 h-32">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#ddd" strokeWidth="10"/>
                        <circle 
                            cx="50" cy="50" r="45"
                            fill="none" stroke="#3B82F6"
                            strokeWidth="10"
                            strokeDasharray="220"
                            strokeDashoffset="60"
                            transform="rotate(-90 50 50)"
                        />
                    </svg>
                </div>
            );

        case 'bigNumber':
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <div className="text-3xl font-bold text-blue-600">99.9%</div>
                    <div className="text-sm text-gray-500 mt-1">Uptime</div>
                </div>
            );
            
        case 'gauge':
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle 
                                cx="64" 
                                cy="64" 
                                r="56"
                                fill="none"
                                stroke="#E2E8F0"
                                strokeWidth="12"
                                strokeDasharray="264"
                                strokeDashoffset="66"
                                strokeLinecap="round"
                            />
                            <circle 
                                cx="64" 
                                cy="64" 
                                r="56"
                                fill="none"
                                stroke="#3B82F6"
                                strokeWidth="12"
                                strokeDasharray="264"
                                strokeDashoffset="132"
                                strokeLinecap="round"
                            />
                            {[0, 25, 50, 75, 100].map((mark, i) => (
                                <line
                                    key={i}
                                    x1="64"
                                    y1="8"
                                    x2="64"
                                    y2="16"
                                    stroke="#94A3B8"
                                    strokeWidth="2"
                                    transform={`rotate(${mark * 2.64} 64 64)`}
                                />
                            ))}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-2xl font-bold text-blue-600">75%</div>
                        </div>
                    </div>
                </div>
            );

        case 'table':
        case 'dynamicTable':
            return (
                <div className="w-full p-2 space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                        {[1,2,3].map(i => (
                            <div key={i} className="h-6 bg-blue-50 rounded" />
                        ))}
                    </div>
                    {[1,2].map(row => (
                        <div key={row} className="grid grid-cols-3 gap-2">
                            {[1,2,3].map(col => (
                                <div key={col} className="h-6 bg-gray-50 rounded" />
                            ))}
                        </div>
                    ))}
                </div>
            );

        case 'alert':
        case 'serviceAlert':
            return (
                <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-100 rounded">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-sm text-red-600">Critical Alert</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-100 rounded">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span className="text-sm text-yellow-600">Warning Alert</span>
                    </div>
                </div>
            );

        case 'netflow':
        case 'groupNetflow':
            return (
                <div className="h-full flex items-center justify-center">
                    <div className="space-y-3 w-full">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-teal-500 rounded-full" />
                            <div className="flex-1 h-2 bg-gradient-to-r from-teal-500 to-teal-50 rounded-full" />
                            <div className="text-xs text-teal-600">2.1 GB/s</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-blue-500 rounded-full" />
                            <div className="flex-1 h-2 bg-gradient-to-r from-blue-500 to-blue-50 rounded-full" />
                            <div className="text-xs text-blue-600">1.8 GB/s</div>
                        </div>
                    </div>
                </div>
            );

        case 'batchjob':
            return (
                <div className="h-full flex items-center justify-center">
                    <div className="space-y-2 w-full">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <div className="flex-1 h-4 bg-green-50 rounded relative overflow-hidden">
                                <div className="absolute inset-y-0 left-0 bg-green-500 rounded" style={{ width: '75%' }} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                            <div className="flex-1 h-4 bg-orange-50 rounded relative overflow-hidden">
                                <div className="absolute inset-y-0 left-0 bg-orange-500 rounded" style={{ width: '45%' }} />
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 'deviceSLA':
        case 'websiteSLA':
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <div className="relative w-32 h-32">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle 
                                cx="50" cy="50" r="45" 
                                className="fill-none stroke-emerald-100 stroke-[8]"
                            />
                            <circle 
                                cx="50" cy="50" r="45"
                                className="fill-none stroke-emerald-500 stroke-[8]"
                                strokeDasharray="280"
                                strokeDashoffset="28"
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-emerald-600">99.9%</div>
                                <div className="text-xs text-emerald-700">Uptime</div>
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 'text':
            return (
                <div className="h-full flex items-center justify-center p-4">
                    <div className="space-y-2 w-full">
                        {[1,2,3].map((i) => (
                            <div key={i} className="h-2 bg-gray-200 rounded-full w-full" 
                                style={{ width: `${Math.random() * 40 + 60}%` }} 
                            />
                        ))}
                    </div>
                </div>
            );

        case 'flash':
        case 'html':
            return (
                <div className="h-full flex items-center justify-center p-4 bg-gray-50 rounded">
                    <div className="space-y-2 w-full">
                        <div className="h-2 bg-gray-200 w-3/4 rounded" />
                        <div className="h-2 bg-gray-200 w-1/2 rounded" />
                        <div className="h-2 bg-gray-200 w-2/3 rounded" />
                    </div>
                </div>
            );

        case 'gmap':
        case 'savedMap':
            return (
                <div className="h-full flex items-center justify-center">
                    <div className="w-full h-32 relative rounded-lg overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-blue-50">
                            <div className="absolute inset-0 grid grid-cols-12 grid-rows-6">
                                {Array.from({ length: 72 }).map((_, i) => (
                                    <div key={i} className="border-[0.5px] border-emerald-100/30" />
                                ))}
                            </div>
                            
                            <div className="absolute top-1/3 left-0 right-0 h-[1px] bg-emerald-200" />
                            <div className="absolute top-2/3 left-0 right-0 h-[1px] bg-emerald-200" />
                            <div className="absolute left-1/4 top-0 bottom-0 w-[1px] bg-emerald-200" />
                            <div className="absolute left-2/3 top-0 bottom-0 w-[1px] bg-emerald-200" />
                            
                            <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2">
                                <div className="relative">
                                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-md" />
                                    <div className="absolute -top-1 -left-1 w-4.5 h-4.5 bg-red-500 rounded-full animate-ping opacity-75" />
                                </div>
                            </div>
                            <div className="absolute bottom-1/3 right-1/4 -translate-x-1/2 -translate-y-1/2">
                                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-md" />
                            </div>
                            <div className="absolute top-1/2 right-1/3 -translate-x-1/2 -translate-y-1/2">
                                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-md" />
                            </div>

                            <div className="absolute top-2 right-2 bg-white/90 rounded shadow-sm text-[10px] divide-y divide-gray-200">
                                <button className="p-1 hover:bg-gray-50 text-gray-600">+</button>
                                <button className="p-1 hover:bg-gray-50 text-gray-600">−</button>
                            </div>

                            <div className="absolute bottom-2 left-2 bg-white/90 rounded px-1.5 py-0.5 text-[8px] text-gray-600">
                                <div className="flex items-center gap-1">
                                    <div className="w-8 h-0.5 bg-emerald-500" />
                                    <span>5 km</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 'noc':
            return (
                <div className="h-full grid grid-cols-2 gap-2 p-2">
                    {[1,2,3,4].map((i) => (
                        <div key={i} className={`rounded p-2 flex items-center justify-center
                            ${i === 1 ? 'bg-red-50 border border-red-100' :
                              i === 2 ? 'bg-yellow-50 border border-yellow-100' :
                              'bg-green-50 border border-green-100'}`}>
                            <div className={`w-2 h-2 rounded-full
                                ${i === 1 ? 'bg-red-500' :
                                  i === 2 ? 'bg-yellow-500' :
                                  'bg-green-500'}`} 
                            />
                        </div>
                    ))}
                </div>
            );

        case 'statsd':
            return (
                <div className="h-full flex items-center justify-center">
                    <div className="space-y-3 w-full px-4">
                        {[1,2].map(i => (
                            <div key={i} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">Metric {i}</span>
                                    <span className="text-gray-900 font-medium">{Math.round(Math.random() * 1000)}</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-500 rounded-full" 
                                        style={{ width: `${Math.random() * 100}%` }} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'deviceStatus':
        case 'websiteOverallStatus':
        case 'websiteIndividualStatus':
            return (
                <div className="h-full grid grid-cols-3 gap-2 p-3">
                    {[1,2,3,4,5,6].map((i) => (
                        <div key={i} className={`rounded-lg p-2 flex items-center justify-center
                            ${i === 1 ? 'bg-red-50 border border-red-100' :
                              i === 2 ? 'bg-yellow-50 border border-yellow-100' :
                              'bg-green-50 border border-green-100'}`}>
                            <div className={`w-2 h-2 rounded-full
                                ${i === 1 ? 'bg-red-500' :
                                  i === 2 ? 'bg-yellow-500' :
                                  'bg-green-500'}`} 
                            />
                        </div>
                    ))}
                </div>
            );

        case 'websiteOverview':
            return (
                <div className="h-full p-3 space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-xs text-gray-600">Available</span>
                        </div>
                        <span className="text-xs font-medium text-gray-900">98.5%</span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '98.5%' }} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2">
                        {[1,2,3].map(i => (
                            <div key={i} className="text-center">
                                <div className="text-xs font-medium text-gray-900">1.2s</div>
                                <div className="text-[10px] text-gray-500">Response</div>
                            </div>
                        ))}
                    </div>
                </div>
            );

        default:
            return (
                <div className="flex items-center justify-center h-full">
                    <span className="text-xs text-gray-500">Widget Type: {type}</span>
                </div>
            );
    }
};

const DashboardPreview: React.FC<DashboardPreviewProps> = ({ isOpen, onClose, dashboard }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!dashboard) return null;

    const gridDimensions = dashboard.widgets?.reduce(
        (acc: { rows: number; cols: number }, widget: any) => ({
            rows: Math.max(acc.rows, widget.position.row + widget.position.sizey),
            cols: Math.max(acc.cols, widget.position.col + widget.position.sizex - 1)
        }),
        { rows: 0, cols: 0 }
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent aria-describedby={undefined} className="max-w-[95vw] w-full h-[90vh] p-0 bg-gray-50/95 backdrop-blur-sm flex flex-col">
                <DialogHeader className="flex-shrink-0 p-4 sm:p-6 pb-3 sm:pb-4 border-b bg-white">
                    <div className="space-y-1">
                        <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900 pr-8">
                            {dashboard.name}
                        </DialogTitle>
                        {dashboard.description && (
                            <p className="text-xs sm:text-sm text-gray-600">
                                {dashboard.description}
                            </p>
                        )}
                    </div>
                </DialogHeader>
                
                <div className="flex-1 overflow-auto p-3 sm:p-6">
                    <div className="bg-white rounded-lg border shadow-sm p-2 sm:p-4">
                        <div 
                            className="grid gap-2 sm:gap-3"
                            style={{
                                gridTemplateColumns: `repeat(${
                                    isMobile ? 1 : gridDimensions.cols
                                }, minmax(0, 1fr))`,
                                gridAutoRows: 'minmax(100px, auto)'
                            }}
                        >
                            {dashboard.widgets.map((widget: any, index: number) => (
                                <div
                                    key={index}
                                    style={{
                                        gridColumn: window.innerWidth < 640 
                                            ? '1 / -1' 
                                            : `${widget.position.col} / span ${widget.position.sizex}`,
                                        gridRow: window.innerWidth < 640 
                                            ? 'auto' 
                                            : `${widget.position.row} / span ${widget.position.sizey}`
                                    }}
                                    className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow group flex flex-col"
                                >
                                    <div className="p-2 sm:p-3 border-b bg-gray-50/50 flex-shrink-0">
                                        <div className="flex items-center gap-2">
                                            {getWidgetIcon(widget.config.type)}
                                            <h3 className="text-xs sm:text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
                                                {widget.config.name}
                                            </h3>
                                        </div>
                                        {widget.config.description && (
                                            <p className="mt-1 text-[10px] sm:text-xs text-gray-500 line-clamp-2">
                                                {widget.config.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="p-2 sm:p-4 flex-1">
                                        {getWidgetPreview(widget)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0 p-3 sm:p-4 border-t bg-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                                <LayoutDashboard className="w-4 h-4" />
                                <span>{dashboard.widgets.length} widgets</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <Palette className="w-4 h-4" />
                                <span>Theme: {dashboard.theme || 'Default'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Tag className="w-4 h-4" />
                                <span>v{dashboard.version || '1.0'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DashboardPreview; 