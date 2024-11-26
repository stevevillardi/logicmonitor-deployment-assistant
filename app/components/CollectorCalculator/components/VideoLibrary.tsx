import React, { useState } from 'react';
import { Button } from '@/components/ui/enhanced-components';
import { PlayCircle, Filter, AlertTriangle } from 'lucide-react';
import VideoGuide from './VideoGuide';
import EnhancedCard from '@/components/ui/enhanced-card';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
interface Video {
    id: string;
    title: string;
    description: string;
    category: string;
    videoId: string; // YouTube ID
    thumbnailUrl?: string;
}

interface VideoCategory {
    id: string;
    name: string;
    description: string;
}

const categories: VideoCategory[] = [
    { id: 'getting-started', name: 'Getting Started', description: 'Basic setup and configuration' },
    { id: 'device-management', name: 'Device Management', description: 'Adding and managing devices' },
    { id: 'collectors', name: 'Collectors', description: 'Collector setup and management' },
    { id: 'monitoring', name: 'Monitoring', description: 'Setting up monitoring and alerts' },
    { id: 'automation', name: 'Automation', description: 'API and automation tasks' },
    { id: 'troubleshooting', name: 'Troubleshooting', description: 'Common issues and solutions' },
    { id: 'advanced', name: 'Advanced', description: 'Advanced topics and features' },
];

const videos: Video[] = [
    {
        id: '1',
        title: 'PowerShell Series: Setting up LogicMonitor with multiple SSH/SNMP Credentials',
        description: 'Learn how to setup LogicMonitor with multiple SSH/SNMP credentials',
        category: 'monitoring',
        videoId: 'DR63mbIXeB0'
    },
    {
        id: '2',
        title: 'PowerShell Series: Filtering and Delta Usage',
        description: 'Learn how to use PowerShell module for advanced filtering and delta usage',
        category: 'automation',
        videoId: 'tJqbfAd9sqU'
    },
    {
        id: '3',
        title: 'PowerShell Series: Onboarding and Configuring Devices',
        description: 'Learn how to use PowerShell module for onboarding and configuring devices',
        category: 'device-management',
        videoId: 'mMGadMsu1Qo'
    },
    // Add more videos as needed
];

const VideoLibrary: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const filteredVideos = selectedCategory === 'all' 
        ? videos 
        : videos.filter(video => video.category === selectedCategory);

    const NoVideosState = () => (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg border-2 border-dashed border-gray-200">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                <PlayCircle className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-1">No Videos Found</p>
            <p className="text-gray-500 text-sm text-center">
                {selectedCategory === 'all' 
                    ? 'No videos are currently available in the library'
                    : `No videos available in the ${categories.find(c => c.id === selectedCategory)?.name} category`}
            </p>
        </div>
    );

    return (
        <div className="space-y-4">
            <Alert variant="default" className="bg-yellow-50 border-yellow-200">
                <AlertTriangle className="h-4 w-4 !text-yellow-700" />
                <AlertDescription className="text-yellow-700">
                    <div className="flex items-start gap-2">
                        <div>
                            <p className="font-semibold mb-1">
                                Section Under Construction
                            </p>
                            <p className="text-sm">
                                The video library is currently being developed. More content will be added soon.
                            </p>
                        </div>
                    </div>
                </AlertDescription>
            </Alert>

            <EnhancedCard className="bg-white border border-gray-200 h-[calc(100vh-13rem)] overflow-y-auto">
                <CardHeader className="border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <PlayCircle className="w-6 h-6 text-blue-700" />
                            <CardTitle className="text-gray-900">Video Library</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <select
                                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="all">All Categories</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {filteredVideos.length === 0 ? (
                        <NoVideosState />
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {categories.map(category => {
                                const categoryVideos = filteredVideos.filter(
                                    video => video.category === category.id
                                );

                                if (selectedCategory !== 'all' && category.id !== selectedCategory) {
                                    return null;
                                }

                                if (categoryVideos.length === 0) {
                                    return null;
                                }

                                return (
                                    <div key={category.id} className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {category.name}
                                            </h3>
                                            <span className="text-sm text-gray-500">
                                                {categoryVideos.length} videos
                                            </span>
                                        </div>
                                        <div className="space-y-4">
                                            {categoryVideos.map(video => (
                                                <VideoGuide
                                                    key={video.id}
                                                    title={video.title}
                                                    description={video.description}
                                                    videoId={video.videoId}
                                                    thumbnailUrl={video.thumbnailUrl}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </EnhancedCard>
        </div>
    );
};

export default VideoLibrary;
