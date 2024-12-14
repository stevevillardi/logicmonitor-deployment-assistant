import React, { useState } from 'react';
import { PlayCircle, ChevronUp, Clock, Tag } from 'lucide-react';
import Image from 'next/image';

interface VideoGuideProps {
    title: string;
    description: string;
    videoUrl?: string;
    videoId?: string; // For YouTube videos
    duration?: string; // Add duration prop (e.g., "2:30", "1:45")
    category?: string; // Add category prop
}

const VideoGuide: React.FC<VideoGuideProps> = ({ 
    title, 
    description, 
    videoUrl,
    videoId,
    duration,
    category 
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getVideoEmbed = () => {
        if (videoId) {
            return (
                <iframe
                    className="w-full aspect-video rounded-lg"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            );
        }
        if (videoUrl) {
            return (
                <video 
                    className="w-full rounded-lg"
                    controls
                    src={videoUrl}
                >
                    Your browser does not support the video tag.
                </video>
            );
        }
        return (
            <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Video has not been uploaded yet</p>
            </div>
        );
    };

    return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 hover:border-gray-300">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full text-left px-4 py-3"
            >
                <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                        {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-blue-700" />
                        ) : (
                            <PlayCircle className="w-4 h-4 text-blue-700" />
                        )}
                    </div>
                    <div className="flex flex-grow min-w-0 gap-4">
                        {/* Text Content */}
                        <div className="flex-grow min-w-0">
                            {/* Title and Tags Row */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-medium text-gray-900 truncate text-sm">
                                    {title}
                                </h4>
                                <div className="flex items-center gap-2">
                                    {duration && (
                                        <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium whitespace-nowrap">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {duration}
                                        </div>
                                    )}
                                    {category && (
                                        <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium whitespace-nowrap">
                                            <Tag className="w-3 h-3 mr-1" />
                                            {category}
                                        </div>
                                    )}
                                    {!isExpanded && (
                                        <span className="text-xs text-blue-700 font-normal whitespace-nowrap hidden sm:inline-block">
                                            Click to watch
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                                {description}
                            </p>
                        </div>

                        {/* Thumbnail */}
                        {!isExpanded && videoId && (
                            <div className="relative w-24 h-14 rounded-lg overflow-hidden flex-shrink-0 self-center">
                                <Image
                                    src={`https://img.youtube.com/vi/${videoId}/0.jpg`}
                                    alt={`Thumbnail for ${title}`}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center">
                                    <PlayCircle className="w-6 h-6 text-white drop-shadow-md" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </button>
            {isExpanded && (
                <div className="px-4 pb-3">
                    <div className="mt-2 bg-white rounded-lg border border-gray-200 p-2">
                        {getVideoEmbed()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoGuide;
