import { 
    AlertTriangle, BarChart3, Globe, Activity, PieChart, Table, 
    LayoutGrid, Gauge, Hash, Network, LineChart, FileText, 
    MonitorCheck, Workflow, Database, Server, Map 
} from 'lucide-react';

export const getWidgetIcon = (type: string) => {
    const baseClass = "w-4 h-4";
    
    const types: Record<string, { icon: JSX.Element; bgColor: string }> = {
        'graph': {
            icon: <LineChart className={`${baseClass} text-indigo-600 dark:text-indigo-400`} />,
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
        },
        'cgraph': {
            icon: <BarChart3 className={`${baseClass} text-blue-600 dark:text-blue-400`} />,
            bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        },
        'ngraph': {
            icon: <Activity className={`${baseClass} text-cyan-600 dark:text-cyan-400`} />,
            bgColor: 'bg-cyan-50 dark:bg-cyan-900/20'
        },
        'websiteSLA': {
            icon: <Globe className={`${baseClass} text-emerald-600 dark:text-emerald-400`} />,
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
        },
        'deviceSLA': {
            icon: <MonitorCheck className={`${baseClass} text-green-600 dark:text-green-400`} />,
            bgColor: 'bg-green-50 dark:bg-green-900/20'
        },
        'pieChart': {
            icon: <PieChart className={`${baseClass} text-purple-600 dark:text-purple-400`} />,
            bgColor: 'bg-purple-50 dark:bg-purple-900/20'
        },
        'table': {
            icon: <Table className={`${baseClass} text-slate-600 dark:text-slate-400`} />,
            bgColor: 'bg-slate-50 dark:bg-slate-900/20'
        },
        'dynamicTable': {
            icon: <LayoutGrid className={`${baseClass} text-gray-600 dark:text-gray-400`} />,
            bgColor: 'bg-gray-50 dark:bg-gray-900/20'
        },
        'bigNumber': {
            icon: <Hash className={`${baseClass} text-rose-600 dark:text-rose-400`} />,
            bgColor: 'bg-rose-50 dark:bg-rose-900/20'
        },
        'gauge': {
            icon: <Gauge className={`${baseClass} text-amber-600 dark:text-amber-400`} />,
            bgColor: 'bg-amber-50 dark:bg-amber-900/20'
        },
        'netflow': {
            icon: <Network className={`${baseClass} text-teal-600 dark:text-teal-400`} />,
            bgColor: 'bg-teal-50 dark:bg-teal-900/20'
        },
        'text': {
            icon: <FileText className={`${baseClass} text-neutral-600 dark:text-neutral-400`} />,
            bgColor: 'bg-neutral-50 dark:bg-neutral-900/20'
        },
        'batchjob': {
            icon: <Workflow className={`${baseClass} text-orange-600 dark:text-orange-400`} />,
            bgColor: 'bg-orange-50 dark:bg-orange-900/20'
        },
        'noc': {
            icon: <Server className={`${baseClass} text-violet-600 dark:text-violet-400`} />,
            bgColor: 'bg-violet-50 dark:bg-violet-900/20'
        },
        'alert': {
            icon: <AlertTriangle className={`${baseClass} text-red-600 dark:text-red-400`} />,
            bgColor: 'bg-red-50 dark:bg-red-900/20'
        },
        'gmap': {
            icon: <Map className={`${baseClass} text-emerald-600 dark:text-emerald-400`} />,
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
        },
        'savedMap': {
            icon: <Map className={`${baseClass} text-emerald-600 dark:text-emerald-400`} />,
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
        }
    };

    const widgetType = types[type] || {
        icon: <AlertTriangle className={`${baseClass} text-gray-400 dark:text-gray-500`} />,
        bgColor: 'bg-gray-50 dark:bg-gray-800'
    };

    return (
        <div className={`p-1 rounded-full ${widgetType.bgColor}`}>
            {widgetType.icon}
        </div>
    );
}; 