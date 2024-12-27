import { 
    AlertTriangle, BarChart3, Globe, Activity, PieChart, Table, 
    LayoutGrid, Gauge, Hash, Network, LineChart, FileText, 
    MonitorCheck, Workflow, Database, Server, Map 
} from 'lucide-react';

export const getWidgetIcon = (type: string) => {
    const baseClass = "w-4 h-4";
    
    const types: Record<string, { icon: JSX.Element; bgColor: string }> = {
        'graph': {
            icon: <LineChart className={`${baseClass} text-indigo-600`} />,
            bgColor: 'bg-indigo-50'
        },
        'cgraph': {
            icon: <BarChart3 className={`${baseClass} text-blue-600`} />,
            bgColor: 'bg-blue-50'
        },
        'ngraph': {
            icon: <Activity className={`${baseClass} text-cyan-600`} />,
            bgColor: 'bg-cyan-50'
        },
        'websiteSLA': {
            icon: <Globe className={`${baseClass} text-emerald-600`} />,
            bgColor: 'bg-emerald-50'
        },
        'deviceSLA': {
            icon: <MonitorCheck className={`${baseClass} text-green-600`} />,
            bgColor: 'bg-green-50'
        },
        'pieChart': {
            icon: <PieChart className={`${baseClass} text-purple-600`} />,
            bgColor: 'bg-purple-50'
        },
        'table': {
            icon: <Table className={`${baseClass} text-slate-600`} />,
            bgColor: 'bg-slate-50'
        },
        'dynamicTable': {
            icon: <LayoutGrid className={`${baseClass} text-gray-600`} />,
            bgColor: 'bg-gray-50'
        },
        'bigNumber': {
            icon: <Hash className={`${baseClass} text-rose-600`} />,
            bgColor: 'bg-rose-50'
        },
        'gauge': {
            icon: <Gauge className={`${baseClass} text-amber-600`} />,
            bgColor: 'bg-amber-50'
        },
        'netflow': {
            icon: <Network className={`${baseClass} text-teal-600`} />,
            bgColor: 'bg-teal-50'
        },
        'text': {
            icon: <FileText className={`${baseClass} text-neutral-600`} />,
            bgColor: 'bg-neutral-50'
        },
        'batchjob': {
            icon: <Workflow className={`${baseClass} text-orange-600`} />,
            bgColor: 'bg-orange-50'
        },
        'noc': {
            icon: <Server className={`${baseClass} text-violet-600`} />,
            bgColor: 'bg-violet-50'
        },
        'alert': {
            icon: <AlertTriangle className={`${baseClass} text-red-600`} />,
            bgColor: 'bg-red-50'
        },
        'gmap': {
            icon: <Map className={`${baseClass} text-emerald-600`} />,
            bgColor: 'bg-emerald-50'
        },
        'savedMap': {
            icon: <Map className={`${baseClass} text-emerald-600`} />,
            bgColor: 'bg-emerald-50'
        }
    };

    const widgetType = types[type] || {
        icon: <AlertTriangle className={`${baseClass} text-gray-400`} />,
        bgColor: 'bg-gray-50'
    };

    return (
        <div className={`p-1 rounded-full ${widgetType.bgColor}`}>
            {widgetType.icon}
        </div>
    );
}; 