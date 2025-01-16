import { useState, useEffect } from 'react';
import VideoGuide from './VideoGuide';
import { AlertTriangle, Search, Filter, PlayCircle, Info, PlusCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { devError, devLog } from '../Shared/utils/debug';
import { supabaseBrowser } from '@/app/lib/supabase/client';
import SubmitVideoDialog from './SubmitVideoDialog';
import { usePermissions } from '@/app/hooks/usePermissions';

// Define the structure of the video categories
interface Video {
  id: string;
  category_id: string;
  title: string;
  description: string;
  video_id: string;
  duration: string;
  created_at: string;
  updated_at: string;
}

interface VideoCategory {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  videos?: Video[];
}

const VideoLibrary = () => {
    const [videoCategories, setVideoCategories] = useState<VideoCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const videosPerPage = 5; // Adjustable number of videos per page
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
    const { hasPermission } = usePermissions();

    const fetchVideosFromSupabase = async () => {
        try {
            // First fetch categories
            const { data: categories, error: categoriesError } = await supabaseBrowser
                .from('video_categories')
                .select('*')
                .order('name');

            if (categoriesError) throw categoriesError;

            // Then fetch videos with category information
            const { data: videos, error: videosError } = await supabaseBrowser
                .from('videos')
                .select(`
                    *,
                    video_categories (
                        id,
                        name
                    )
                `)
                .order('title');

            if (videosError) throw videosError;

            // Group videos by category
            const organizedData = categories.map(category => ({
                ...category,
                videos: videos
                    .filter(video => 
                        video.category_id === category.id && 
                        video.title && 
                        video.description && 
                        video.video_id && 
                        video.duration
                    )
                    .map(video => ({
                        id: video.id,
                        category_id: video.category_id,
                        title: video.title,
                        description: video.description,
                        video_id: video.video_id,
                        duration: video.duration,
                        created_at: video.created_at,
                        updated_at: video.updated_at
                    }))
            }));

            setVideoCategories(organizedData);
        } catch (err: any) {
            devError('Error fetching videos from Supabase:', err);
            setError('Unable to load video content. Showing default videos.');
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {

        fetchVideosFromSupabase();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory]);

    // Get unique categories
    const uniqueCategories = Array.from(
        new Set(videoCategories.map(category => category.name))
    );

    // Filter videos based on selected category
    const filteredCategories = selectedCategory === 'All Categories'
        ? videoCategories
        : videoCategories.filter(category => category.name === selectedCategory);

    // Add this filtering logic after the category filtering
    const filteredVideos = filteredCategories
        .map(category => ({
            ...category,
            videos: category.videos?.filter(video => {
                if (!video.title || !video.description) return false;
                return (
                    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    video.description.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }) || []
        }))
        .filter(category => (category.videos?.length || 0) > 0);

    // Pagination logic
    const indexOfLastVideo = currentPage * videosPerPage;
    const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
    const currentVideos = filteredVideos
        .flatMap(category => category.videos || [])
        .filter((video): video is Video => !!video) // Type guard to ensure non-null
        .slice(indexOfFirstVideo, indexOfLastVideo);
    const totalPages = Math.ceil(
        filteredVideos.reduce((sum, category) => sum + (category.videos?.length || 0), 0) / videosPerPage
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

    const totalVideos = filteredVideos.reduce((sum, category) => sum + (category.videos?.length || 0), 0);

    if (isLoading) {
        return (
            <div className="min-h-[800px] space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-100 dark:bg-gray-900 animate-pulse h-24 rounded-lg border border-gray-200 dark:border-gray-800" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6 mb-4">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                        <PlayCircle className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                        <CardTitle className="dark:text-gray-100">Video Library</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 bg-white dark:bg-gray-800">
                    <div className="flex flex-col min-h-[800px]">
                        {/* Top Content Section */}
                        <div className="flex-grow">
                            {error && (
                                <Alert variant="default" className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800 mb-8">
                                    <AlertTriangle className="h-4 w-4 !text-yellow-800 dark:!text-yellow-300" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-6">
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
                                        <Info className="w-5 h-5" />
                                        <span className="font-medium">Looking for information on a specific topic?</span>
                                    </div>
                                    <p className="text-sm text-blue-600 dark:text-blue-400">
                                        This section contains a collection of videos that cover a variety of topics related to LogicMonitor. From monitoring and automation to resource management, these videos provide a comprehensive guide to using LogicMonitor.
                                    </p>
                                </div>
                            </div>

                            {/* Search and Filter Section */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Search and Filter
                                    </label>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {totalVideos} {totalVideos === 1 ? 'video' : 'videos'}
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        <Input
                                            placeholder="Search videos..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                        />
                                    </div>
                                    {hasPermission({ action: 'create', resource: 'video' }) && (
                                        <Button
                                            onClick={() => setIsSubmitDialogOpen(true)}
                                            className="flex items-center gap-2 bg-[#040F4B] hover:bg-[#0A1B6F] text-white"
                                        >
                                            <PlusCircle className="h-4 w-4" />
                                            Submit Video
                                        </Button>
                                    )}
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button 
                                                variant="outline" 
                                                className="gap-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 w-full sm:w-[180px] justify-between"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Filter className="w-4 h-4" />
                                                    <span className="truncate">{selectedCategory || 'All Categories'}</span>
                                                </div>
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[180px] p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                            <div className="p-2">
                                                <div
                                                    className={`px-2 py-1.5 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
                                                        selectedCategory === 'All Categories' ? 'bg-gray-100 dark:bg-gray-800' : ''
                                                    }`}
                                                    onClick={() => setSelectedCategory('All Categories')}
                                                >
                                                    All Categories
                                                </div>
                                                {uniqueCategories.map((category, index) => (
                                                    <div
                                                        key={index}
                                                        className={`px-2 py-1.5 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
                                                            selectedCategory === category ? 'bg-gray-100 dark:bg-gray-800' : ''
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
                                {currentVideos.map((video) => (
                                    <VideoGuide
                                        key={video.id}
                                        title={video.title}
                                        description={video.description}
                                        videoId={video.video_id}
                                        duration={video.duration}
                                        category={filteredCategories.find(
                                            cat => cat.videos?.some(v => v.id === video.id)
                                        )?.name || 'Uncategorized'}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Pagination Controls */}
                        <div className="mt-8">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <button
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 1}
                                    className="w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50 text-gray-900 dark:text-gray-100"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-700 dark:text-gray-300 order-first sm:order-none">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className="w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50 text-gray-900 dark:text-gray-100"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <SubmitVideoDialog
                open={isSubmitDialogOpen}
                onOpenChange={setIsSubmitDialogOpen}
                categories={uniqueCategories}
                onSuccess={fetchVideosFromSupabase}
            />
        </div>
    );
};

export default VideoLibrary;
