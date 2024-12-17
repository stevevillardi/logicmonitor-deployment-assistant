import { useState, useEffect } from 'react';
import VideoGuide from './VideoGuide';
import { VideoGuideData } from '../types';
import { AlertTriangle, Search, Filter, PlayCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Define the structure of the video categories
interface VideoCategory {
    category: string;
    videos: VideoGuideData[];
}

// Fallback videos if remote fetch fails
const localVideoCategories: VideoCategory[] = [
    {
        category: "Monitoring",
        videos: [
            {
                title: 'PowerShell Series: Setting up LogicMonitor with multiple SSH/SNMP Credentials',
                description: 'Learn how to setup LogicMonitor with multiple SSH/SNMP credentials',
                videoId: 'DR63mbIXeB0',
                duration: '12:29'
            },
        ]
    },
    {
        category: "Automation",
        videos: [
            {
                title: 'PowerShell Series: Filtering and Delta Usage',
                description: 'Learn how to use PowerShell module for advanced filtering and delta usage',
                videoId: 'tJqbfAd9sqU',
                duration: '18:24'
            },
        ]
    },
    {
        category: "Resource Management",
        videos: [
            {
                title: 'PowerShell Series: Onboarding and Configuring Devices',
                description: 'Learn how to use PowerShell module for onboarding and configuring devices',
                videoId: 'mMGadMsu1Qo',
                duration: '12:11'
            },
        ]
    }
];

// URL for remote videos JSON
const VIDEOS_URL = process.env.NEXT_PUBLIC_VIDEO_JSON || '';

const VideoLibrary = () => {
    const [videoCategories, setVideoCategories] = useState<VideoCategory[]>(localVideoCategories);
    const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const videosPerPage = 5; // Adjustable number of videos per page
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                console.log('Attempting to fetch videos from:', VIDEOS_URL);
                const response = await fetch(VIDEOS_URL);
                console.log('Response status:', response.status);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch videos: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                console.log('Fetched data:', data);

                if (!Array.isArray(data)) {
                    console.error('Invalid data format received:', data);
                    throw new Error('Invalid data format: expected an array');
                }

                // Validate data structure
                const isValidData = data.every(item => 
                    item.category && 
                    Array.isArray(item.videos) && 
                    item.videos.every((video: any) => 
                        video.title && 
                        video.description && 
                        (video.videoId || video.videoUrl)
                    )
                );

                if (!isValidData) {
                    throw new Error('Invalid data structure in JSON');
                }

                setVideoCategories(data);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching videos:', err);
                setVideoCategories(localVideoCategories);
                setError(`Unable to load remote video content (${err.message}). Showing default videos.`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVideos();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory]);

    const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCategory(event.target.value);
        setCurrentPage(1); // Reset to first page on category change
    };

    // Get unique categories
    const uniqueCategories = Array.from(
        new Set(videoCategories.map(category => category.category))
    );

    // Filter videos based on selected category
    const filteredCategories = selectedCategory === 'All Categories'
        ? videoCategories
        : videoCategories.filter(category => category.category === selectedCategory);

    // Add this filtering logic after the category filtering
    const filteredVideos = filteredCategories
        .map(category => ({
            ...category,
            videos: category.videos.filter(video =>
                video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                video.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }))
        .filter(category => category.videos.length > 0);

    // Pagination logic
    const indexOfLastVideo = currentPage * videosPerPage;
    const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
    const currentVideos = filteredVideos
        .flatMap(category => category.videos)
        .slice(indexOfFirstVideo, indexOfLastVideo);
    const totalPages = Math.ceil(
        filteredVideos.flatMap(category => category.videos).length / videosPerPage
    );

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const totalVideos = filteredVideos.reduce((sum, category) => sum + category.videos.length, 0);

    if (isLoading) {
        return (
            <div className="min-h-[800px] space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-100 animate-pulse h-24 rounded-lg" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                        <PlayCircle className="w-6 h-6 text-blue-700" />
                        <CardTitle>Video Library</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col min-h-[800px]">
                        {/* Top Content Section */}
                        <div className="flex-grow">
                            {error && (
                                <Alert variant="default" className="bg-yellow-50 text-yellow-800 border-yellow-200 mb-8">
                                    <AlertTriangle className="h-4 w-4 !text-yellow-800" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                                        <Info className="w-5 h-5" />
                                        <span className="font-medium">Looking for information on a specific topic?</span>
                                    </div>
                                    <p className="text-sm text-blue-600">
                                        This section contains a collection of videos that cover a variety of topics related to LogicMonitor. From monitoring and automation to resource management, these videos provide a comprehensive guide to using LogicMonitor.
                                    </p>
                                </div>
                            </div>
                            {/* Search and Filter Section */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Search and Filter
                                    </label>
                                    <span className="text-sm font-medium text-gray-700">
                                        {totalVideos} {totalVideos === 1 ? 'video' : 'videos'}
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                        <Input
                                            placeholder="Search videos..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-9 bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                                        />
                                    </div>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button 
                                                variant="outline" 
                                                className="gap-2 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 w-full sm:w-[180px] justify-between"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Filter className="w-4 h-4" />
                                                    <span className="truncate">{selectedCategory || 'All Categories'}</span>
                                                </div>
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[180px] p-0 bg-white border border-gray-200">
                                            <div className="p-2">
                                                <div
                                                    className={`px-2 py-1.5 cursor-pointer rounded hover:bg-gray-100 ${
                                                        selectedCategory === 'All Categories' ? 'bg-gray-100' : ''
                                                    }`}
                                                    onClick={() => setSelectedCategory('All Categories')}
                                                >
                                                    All Categories
                                                </div>
                                                {uniqueCategories.map((category, index) => (
                                                    <div
                                                        key={index}
                                                        className={`px-2 py-1.5 cursor-pointer rounded hover:bg-gray-100 ${
                                                            selectedCategory === category ? 'bg-gray-100' : ''
                                                        }`}
                                                        onClick={() => setSelectedCategory(category)}
                                                    >
                                                        {category}
                                                    </div>
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            {/* Video List */}
                            <div className="space-y-6">
                                {currentVideos.map((video, index) => (
                                    <VideoGuide
                                        key={index}
                                        title={video.title}
                                        description={video.description}
                                        videoId={video.videoId}
                                        videoUrl={video.videoUrl}
                                        duration={video.duration}
                                        category={filteredCategories.find(cat => cat.videos.includes(video))?.category}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Pagination Controls - Fixed at Bottom */}
                        <div className="mt-8">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <button
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 1}
                                    className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-700 order-first sm:order-none">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default VideoLibrary;
