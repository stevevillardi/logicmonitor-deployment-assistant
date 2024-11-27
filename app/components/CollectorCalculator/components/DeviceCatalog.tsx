import React, { useState, useMemo } from 'react';
import { Search, Filter, ExternalLink, ChevronRight, Info, ChevronLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { technologies } from '../deviceData';
import { Technology } from '../types';
const DeviceCatalog = () => {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedTechnology, setSelectedTechnology] = useState<Technology | null>(null);
    const [copied, setCopied] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const categories = useMemo(() =>
        Array.from(new Set(technologies.map(tech => tech.category))),
        []
    );

    const filteredTechnologies = useMemo(() => {
        return technologies.filter(tech => {
            const matchesSearch = search.length === 0 ||
                tech.name.toLowerCase().includes(search.toLowerCase()) ||
                tech.description.toLowerCase().includes(search.toLowerCase()) ||
                tech.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()));

            const matchesCategory = selectedCategory === 'All Technologies' || !selectedCategory || tech.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [search, selectedCategory]);

    const paginatedTechnologies = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredTechnologies.slice(startIndex, endIndex);
    }, [filteredTechnologies, currentPage]);

    const totalPages = Math.ceil(filteredTechnologies.length / itemsPerPage);

    const TechnologyDialog = ({ technology }: { technology: Technology }) => {
        const Icon = technology.icon;

        return (
            <Dialog>
                <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-md transition-all">
                        <CardHeader>
                            <div className="flex items-start gap-4">
                                {Icon && (
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-6 h-6 text-blue-700" />
                                    </div>
                                )}
                                <div>
                                    <CardTitle className="text-lg">{technology.name}</CardTitle>
                                    <p className="text-sm text-gray-600 mt-1">{technology.description}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                    {technology.category}
                                </Badge>
                                {technology.tags?.map(tag => (
                                    <Badge 
                                        key={tag} 
                                        variant="outline"
                                        className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </CardHeader>
                    </Card>
                </DialogTrigger>
                <DialogContent className="max-w-lg bg-blue-50 sm:max-w-2xl">
        <DialogHeader className="border-b border-blue-100 pb-3">
            <DialogTitle className="text-xl font-bold text-[#040F4B]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {Icon && <Icon className="w-6 h-6 text-blue-700" />}
                        <span>{technology.name}</span>
                    </div>
                </div>
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-1">{technology.description}</p>
        </DialogHeader>

        <div className="space-y-4 py-3">
            {/* Properties Section */}
            <div className="space-y-3">
                <h3 className="text-base font-semibold text-gray-900">Required Properties</h3>
                <div className="grid gap-2">
                    {technology.properties.map(prop => (
                        <PropRow key={prop.name} prop={prop} />
                    ))}
                </div>
            </div>

            {/* Permissions Section */}
            <div className="space-y-3">
                <h3 className="text-base font-semibold text-gray-900">Required Permissions</h3>
                <div className="grid gap-2">
                    {technology.permissions.map(perm => (
                        <div 
                            key={perm.name}
                            className="flex items-start gap-2 p-2 bg-white rounded-lg border border-blue-200 shadow-sm"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-sm text-gray-900">{perm.name}</h4>
                                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                        {perm.type}
                                    </Badge>
                                </div>
                                <p className="text-xs text-gray-600">{perm.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Onboarding Methods Section */}
            <div className="space-y-3">
                <h3 className="text-base font-semibold text-gray-900">Recommended Onboarding Methods</h3>
                <div className="flex flex-wrap gap-2">
                    {technology.recommendedOnboarding.map(method => (
                        <Badge 
                            key={method} 
                            variant="secondary" 
                            className="bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                            {method.toUpperCase()}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Info Note */}
            <div className="bg-white border border-blue-100 rounded-lg p-3">
                <div className="flex gap-2 text-sm text-blue-700">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm mb-2">
                            Additional Documentation and Resources
                        </p>
                        
                        <a
                            href={technology.documentationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs flex items-center gap-1 text-blue-700 hover:text-blue-800"
                        >
                            View Documentation
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <DialogFooter className="border-t border-blue-100 pt-3">
            <Button
                onClick={() => router.push(technology.documentationUrl)}
                className="bg-[#040F4B] hover:bg-[#0A1B6F]/80 text-white transition-colors duration-200"
            >
                Go to Documentation
            </Button>
        </DialogFooter>
    </DialogContent>
            </Dialog>
        );
    };

    return (
        <div className="space-y-6 min-h-[600px]">
            {/* Search and Filter Bar */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search technologies..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                    />
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button 
                            variant="outline" 
                            className="gap-2 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 w-[180px] justify-between"
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
                                    selectedCategory === 'All Technologies' ? 'bg-gray-100' : ''
                                }`}
                                onClick={() => setSelectedCategory('All Technologies')}
                            >
                                All Technologies
                            </div>
                            {categories.map((category, index) => (
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

            {/* Results Grid */}
            <div className="flex flex-col min-h-[800px] justify-between">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paginatedTechnologies.map((tech) => (
                            <TechnologyDialog key={tech.id} technology={tech} />
                        ))}
                    </div>

                    {/* No Results State */}
                    {filteredTechnologies.length === 0 && (
                        <div className="text-center py-12">
                            <h3 className="text-lg font-semibold text-gray-900">No results found</h3>
                            <p className="text-gray-600 mt-1">
                                Try adjusting your search or filter criteria
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-between mt-4">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

interface PropRowProps {
    prop: {
        name: string;
        description: string;
        required?: boolean;
        prop_name?: string;
    };
}

const PropRow = ({ prop }: PropRowProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (prop.prop_name) {
            navigator.clipboard.writeText(prop.prop_name);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div 
            onClick={handleCopy}
            className={`flex items-center w-full cursor-pointer transition-colors bg-white border border-blue-200 rounded-lg p-2 ${copied ? 'bg-green-100' : 'hover:bg-blue-50'}`}
            title="Click to copy property name"
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm text-gray-900">{prop.name}</h4>
                    {prop.required && (
                        <Badge variant="default" className="bg-blue-100 text-blue-700">
                            Required
                        </Badge>
                    )}
                </div>
                <p className="text-xs text-gray-600">{prop.description}</p>
            </div>
            {prop.prop_name && (
                <p className="text-sm text-gray-600 ml-auto pl-4 flex-shrink-0 pr-2">
                    <span className="text-blue-700 font-medium">{prop.prop_name}</span>
                    {copied && <span className="ml-2 text-green-600">Copied!</span>}
                </p>
            )}
        </div>
    );
};

export default DeviceCatalog;