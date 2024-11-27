import React, { useState } from 'react';
import { PlayCircle, ChevronDown, ChevronUp, Clock, Tag } from 'lucide-react';
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
                className="w-full text-left p-4"
            >
                <div className="flex gap-3">
                    <div className="flex-shrink-0">
                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-blue-700 mt-1" />
                        ) : (
                            <PlayCircle className="w-5 h-5 text-blue-700 mt-1" />
                        )}
                    </div>
                    <div className="flex-grow">
                        <div className="flex justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                    {title}
                                    {!isExpanded && (
                                        <span className="text-xs text-blue-700 font-normal">
                                            Click to watch
                                        </span>
                                    )}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">{description}</p>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                                {!isExpanded && videoId && (
                                    <div className="relative w-16 h-9 rounded overflow-hidden">
                                        <Image
                                            src={`https://img.youtube.com/vi/${videoId}/0.jpg`}
                                            alt={`Thumbnail for ${title}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                {duration && (
                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {duration}
                                </div>
                                )}
                                {category && (
                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                                    <Tag className="w-4 h-4 mr-1" />
                                    {category}
                                </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </button>
            {isExpanded && (
                <div className="px-4 pb-4">
                    <div className="mt-2 bg-white rounded-lg border border-gray-200 p-2">
                        {getVideoEmbed()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoGuide;