'use client'

import { usePOV } from '@/app/contexts/POVContext';
import { Card } from '@/components/ui/card';
import { 
    CheckCircle2, 
    AlertCircle,
    Calendar,
    Users,
    Activity,
    User,
    FileText,
    Search,
    CircleHelp,
    MessageCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { POVActivity } from '@/app/types/pov';

export default function ActivePOVActivitiesList() {
    const { state } = usePOV();
    const { pov } = state;
    const [searchTerm, setSearchTerm] = useState('');

    if (!pov) return null;

    const activities = pov.activities || [];

    const getActivityIcon = (type: POVActivity['type']) => {
        switch (type) {
            case 'CRITERIA':
                return <div className="h-5 w-5 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                </div>;
            case 'SESSION':
                return <div className="h-5 w-5 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center">
                    <Calendar className="h-3 w-3 text-blue-600" />
                </div>;
            case 'CHALLENGE':
                return <div className="h-5 w-5 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center">
                    <AlertCircle className="h-3 w-3 text-yellow-600" />
                </div>;
            case 'TEAM':
                return <div className="h-5 w-5 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center">
                    <Users className="h-3 w-3 text-purple-600" />
                </div>;
            case 'STATUS':
                return <div className="h-5 w-5 rounded-full bg-gray-500/20 border-2 border-gray-500 flex items-center justify-center">
                    <Activity className="h-3 w-3 text-gray-600" />
                </div>;
            case 'DOCUMENT':
                return <div className="h-5 w-5 rounded-full bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center">
                    <FileText className="h-3 w-3 text-orange-600" />
                </div>;
            case 'COMMENT':
                return <div className="h-5 w-5 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
                    <MessageCircle className="h-3 w-3 text-red-600" />
                </div>;
            default:
                return <div className="h-5 w-5 rounded-full bg-gray-500/20 border-2 border-gray-500 flex items-center justify-center">
                    <CircleHelp className="h-3 w-3 text-gray-600" />
                </div>;
        }
    };

    const filteredActivities = activities
        .filter(activity => 
            activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            activity.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Activity Log</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Track all POV activities and updates
                </p>
            </div>

            {/* Search Section */}
            <Card className="p-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input 
                        placeholder="Search activities..." 
                        className="pl-9 bg-transparent dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-400 border-gray-200 dark:border-gray-700 focus-visible:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </Card>

            {/* Activities Timeline */}
            <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                <div className="space-y-6 ml-12">
                    {filteredActivities.length > 0 ? (
                        filteredActivities.map((activity) => (
                            <div key={activity.id} className="relative">
                                <div className="absolute -left-[2.85rem] top-1.5 flex items-center justify-center">
                                    <div className="border-4 border-white dark:border-gray-900 rounded-full bg-white dark:bg-gray-900">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                </div>
                                <Card className="p-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                                {activity.title}
                                            </h3>
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        {activity.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <User className="h-3.5 w-3.5" />
                                        {activity.created_by_email || 'Unknown User'}
                                    </div>
                                </Card>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                No activities found
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {searchTerm ? 'Try adjusting your search terms' : 'Activities will appear here as they occur'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 