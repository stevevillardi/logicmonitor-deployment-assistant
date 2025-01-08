import React, { useState, useMemo, useCallback } from 'react';
import { Search, Filter, ExternalLink, ChevronRight, Info, LayoutGrid, List } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { Command, CommandGroup, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { transformCredentialData } from '../DeploymentAssistant/types/credentialData';
import { CredentialType } from '../DeploymentAssistant/types/credentials';
import { devError } from '../Shared/utils/debug';

const DeviceCatalog = () => {
    const [search, setSearch] = useState('');
    const [selectedCredential, setSelectedCredential] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const itemsPerPage = 12;
    const [currentPage, setCurrentPage] = useState(1);
    
    // Add loading state
    const [isLoading, setIsLoading] = useState(true);
    // Change to useState for credential data
    const [credentialData, setCredentialData] = useState<{ [key: string]: CredentialType }>({});

    // Load credential data on component mount
    useEffect(() => {
        const loadCredentialData = async () => {
            try {
                const data = await transformCredentialData();
                setCredentialData(data);
            } catch (error) {
                devError('Error loading credential data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        loadCredentialData();
    }, []);

    // Near the top of the component, add this categorization logic
    const categorizedCredentials = useMemo(() => {
        const allCredentials = Object.values(credentialData);
        const protocols = ['All Protocols'];
        const systems = ['All Systems'];
        
        allCredentials.forEach(cred => {
            if (cred.type === 'protocol') {
                protocols.push(cred.name);
            } else {
                systems.push(cred.name);
            }
        });
        
        return {
            protocols: protocols.sort(),
            systems: systems.sort()
        };
    }, [credentialData]);

    const filteredCredentials = useMemo(() => {
        const allCredentials = Object.values(credentialData);

        return allCredentials.filter(cred => {
            const matchesSearch = search.length === 0 ||
                cred.name.toLowerCase().includes(search.toLowerCase()) ||
                cred.tags?.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase()));

            const matchesSelected = 
                !selectedCredential || 
                selectedCredential === 'All Credentials' ||
                (selectedCredential === 'All Protocols' && cred.type === 'protocol') ||
                (selectedCredential === 'All Systems' && cred.type === 'system') ||
                cred.name === selectedCredential;

            return matchesSearch && matchesSelected;
        });
    }, [search, selectedCredential, credentialData]);

    const paginateResults = (items: CredentialType[]) => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return items.slice(startIndex, endIndex);
    };

    // Memoize handlers
    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    }, []);

    const handleCredentialSelect = useCallback((credential: string) => {
        setSelectedCredential(credential);
    }, []);

    const handleViewModeToggle = useCallback((mode: 'grid' | 'list') => {
        setViewMode(mode);
    }, []);

    const handlePageChange = useCallback((direction: 'next' | 'prev') => {
        setCurrentPage(p => direction === 'next' ? p + 1 : Math.max(1, p - 1));
    }, []);

    // Add loading state handling in the return
    if (isLoading) {
        return (
            <div className="min-h-[600px] space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-100 dark:bg-gray-800 animate-pulse h-24 rounded-lg" />
                ))}
            </div>
        );
    }

    const CredentialDialog = ({ credential }: { credential: CredentialType }) => {
        const Icon = credential.icon;

        return (
            <Dialog>
                <DialogTrigger asChild>
                    <Card className="group cursor-pointer transition-all h-full border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md relative bg-white dark:bg-gray-800">
                        <div className="absolute right-3 top-3 text-gray-400 group-hover:text-blue-500 transition-colors">
                            <ExternalLink className="w-4 h-4" />
                        </div>
                        <CardHeader className="space-y-3">
                            <div className="flex items-start gap-4">
                                {Icon && (
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                                        <Icon className="w-6 h-6 text-blue-700" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0 pr-6">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CardTitle className="text-base sm:text-lg group-hover:text-blue-700 dark:text-gray-100 dark:group-hover:text-blue-300 transition-colors">
                                            {credential.name}
                                        </CardTitle>
                                        <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                            {credential.type}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                        {credential.description}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                    {credential.category}
                                </Badge>
                                {credential.tags?.map(tag => (
                                    <Badge 
                                        key={tag} 
                                        variant="outline"
                                        className="text-xs bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </CardHeader>
                    </Card>
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] sm:max-w-lg lg:max-w-2xl bg-blue-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] mx-0 my-0">
                    <DialogHeader className="border-b border-blue-100 dark:border-blue-800 pb-3">
                        <div className="flex items-start justify-between">
                            <DialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B] dark:text-blue-100">
                                <div className="flex items-center gap-3">
                                    {Icon && <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" />}
                                    <span>{credential.name}</span>
                                </div>
                            </DialogTitle>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{credential.description}</p>
                    </DialogHeader>

                    <div className="space-y-4 py-3">
                        {/* Properties Section */}
                        <div className="space-y-3">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">Required Properties</h3>
                            <div className="grid gap-2">
                                {credential.properties.map(prop => (
                                    <PropRow key={prop.name} prop={prop} />
                                ))}
                            </div>
                        </div>

                        {/* Permissions Section */}
                        {credential.permissions && credential.permissions.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">Required Permissions</h3>
                                <div className="grid gap-2">
                                    {credential.permissions.map(perm => (
                                        <div 
                                            key={perm.name}
                                            className="flex items-start gap-2 p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-100">{perm.name}</h4>
                                                    <Badge className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800">
                                                        {perm.type}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">{perm.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Onboarding Methods Section */}
                        {credential.recommendedOnboarding && credential.recommendedOnboarding.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">
                                    Recommended Onboarding Methods
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {credential.recommendedOnboarding.map(method => (
                                        <Badge 
                                            key={method} 
                                            variant="secondary" 
                                            className="text-xs sm:text-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                                        >
                                            {method.toUpperCase()}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Documentation Link */}
                        {credential.documentationUrl && (
                            <div className="bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-800 rounded-lg p-2 sm:p-3">
                                <div className="flex gap-2 text-blue-700 dark:text-blue-400">
                                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs sm:text-sm mb-2">
                                            Additional Documentation and Resources
                                        </p>
                                        <a
                                            href={credential.documentationUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs sm:text-sm flex items-center gap-1 text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                        >
                                            View Documentation
                                            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="border-t border-blue-100 dark:border-blue-800 pt-3 flex flex-col sm:flex-row justify-end gap-3">
                        <DialogClose asChild>
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                            >
                                Close
                            </Button>
                        </DialogClose>
                        {credential.documentationUrl && (
                            <Button
                                onClick={() => window.open(credential.documentationUrl, '_blank')}
                                className="w-full sm:w-auto bg-[#040F4B] dark:bg-blue-900 hover:bg-[#0A1B6F]/80 dark:hover:bg-blue-800 text-white gap-2"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Go to Documentation
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    const CredentialListItem = ({ credential }: { credential: CredentialType }) => {
        const Icon = credential.icon;
        
        return (
            <Dialog>
                <DialogTrigger asChild>
                    <div className="group flex items-start gap-4 p-4 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md relative bg-white dark:bg-gray-800">
                        {Icon && (
                            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-800 transition-colors">
                                <Icon className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0 pr-6">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                                    {credential.name}
                                </h3>
                                <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                    {credential.category}
                                </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                {credential.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                    {credential.category}
                                </Badge>
                                {credential.tags?.map(tag => (
                                    <Badge 
                                        key={tag}
                                        variant="outline" 
                                        className="text-xs bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="absolute right-3 top-3 text-gray-400 group-hover:text-blue-500 transition-colors">
                            <ExternalLink className="w-4 h-4" />
                        </div>
                    </div>
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] sm:max-w-lg lg:max-w-2xl bg-blue-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] mx-0 my-0">
                    <DialogHeader className="border-b border-blue-100 dark:border-blue-800 pb-3">
                        <div className="flex items-start justify-between">
                            <DialogTitle className="text-lg sm:text-xl font-bold text-[#040F4B] dark:text-blue-100">
                                <div className="flex items-center gap-3">
                                    {Icon && <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" />}
                                    <span>{credential.name}</span>
                                </div>
                            </DialogTitle>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-blue-300 mt-1">{credential.description}</p>
                    </DialogHeader>

                    <div className="space-y-4 py-3">
                        {/* Properties Section */}
                        <div className="space-y-3">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">Required Properties</h3>
                            <div className="grid gap-2">
                                {credential.properties.map(prop => (
                                    <PropRow key={prop.name} prop={prop} />
                                ))}
                            </div>
                        </div>

                        {/* Permissions Section */}
                        {credential.permissions && credential.permissions.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">Required Permissions</h3>
                                <div className="grid gap-2">
                                    {credential.permissions.map(perm => (
                                        <div 
                                            key={perm.name}
                                            className="flex items-start gap-2 p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-100">{perm.name}</h4>
                                                    <Badge className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800">
                                                        {perm.type}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">{perm.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Onboarding Methods Section */}
                        {credential.recommendedOnboarding && credential.recommendedOnboarding.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">
                                    Recommended Onboarding Methods
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {credential.recommendedOnboarding.map(method => (
                                        <Badge 
                                            key={method} 
                                            variant="secondary" 
                                            className="text-xs sm:text-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                                        >
                                            {method.toUpperCase()}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Documentation Link */}
                        {credential.documentationUrl && (
                            <div className="bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-800 rounded-lg p-2 sm:p-3">
                                <div className="flex gap-2 text-blue-700 dark:text-blue-400">
                                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs sm:text-sm mb-2">
                                            Additional Documentation and Resources
                                        </p>
                                        <a
                                            href={credential.documentationUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs sm:text-sm flex items-center gap-1 text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                        >
                                            View Documentation
                                            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="border-t border-blue-100 dark:border-blue-800 pt-3 flex flex-col sm:flex-row justify-end gap-3">
                        <DialogClose asChild>
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                            >
                                Close
                            </Button>
                        </DialogClose>
                        {credential.documentationUrl && (
                            <Button
                                onClick={() => window.open(credential.documentationUrl, '_blank')}
                                className="w-full sm:w-auto bg-[#040F4B] dark:bg-blue-900 hover:bg-[#0A1B6F]/80 dark:hover:bg-blue-800 text-white gap-2"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Go to Documentation
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    return (
        <div className="space-y-6 min-h-[600px]">
            <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
                        <Info className="w-5 h-5" />
                        <span className="font-medium">Resource Credential and Property Details</span>
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                        This section contains the required properties and permissions for a list of common technologies. Click on a technology to view more details about what is required to onboard it. For the full list of LogicMontior&apos;s 3000+ supported technologies, please see the <a className="font-medium text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200" href="https://www.logicmonitor.com/integrations">Integrations</a> page.
                    </p>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input
                        placeholder="Search..."
                        value={search}
                        onChange={handleSearch}
                        className="pl-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-300 dark:focus:border-blue-600 focus:ring-blue-200 dark:focus:ring-blue-900"
                    />
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button 
                            variant="outline" 
                            className="gap-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 w-[180px] justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                <span className="truncate dark:text-gray-200">{selectedCredential || 'All Credentials'}</span>
                            </div>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[220px] p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-h-[400px] overflow-y-auto">
                        <Command>
                            <CommandList>
                                <CommandGroup heading="Protocols">
                                    <CommandItem
                                        onSelect={() => setSelectedCredential('All Credentials')}
                                        className={`px-2 py-1.5 cursor-pointer text-gray-900 dark:text-gray-200 data-[selected=true]:bg-blue-50 dark:data-[selected=true]:bg-blue-900/50 data-[selected=true]:text-blue-900 dark:data-[selected=true]:text-blue-200 hover:bg-gray-50 dark:hover:bg-gray-700`}
                                    >
                                        All Credentials
                                    </CommandItem>
                                    {categorizedCredentials.protocols.map((name) => (
                                        <CommandItem
                                            key={`protocol-${name}`}
                                            onSelect={() => setSelectedCredential(name)}
                                            className={`px-2 py-1.5 cursor-pointer text-gray-900 dark:text-gray-200 data-[selected=true]:bg-blue-50 dark:data-[selected=true]:bg-blue-900/50 data-[selected=true]:text-blue-900 dark:data-[selected=true]:text-blue-200 hover:bg-gray-50 dark:hover:bg-gray-700`}
                                        >
                                            {name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>

                                <CommandSeparator />

                                <CommandGroup heading="Systems">
                                    {categorizedCredentials.systems.map((name) => (
                                        <CommandItem
                                            key={`system-${name}`}
                                            onSelect={() => setSelectedCredential(name === 'All Systems' ? 'All Credentials' : name)}
                                            className={`px-2 py-1.5 cursor-pointer text-gray-900 dark:text-gray-200 data-[selected=true]:bg-blue-50 dark:data-[selected=true]:bg-blue-900/50 data-[selected=true]:text-blue-900 dark:data-[selected=true]:text-blue-200 hover:bg-gray-50 dark:hover:bg-gray-700`}
                                        >
                                            {name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {/* View Toggle and Results Count */}
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {filteredCredentials.length} results
                </p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className={`gap-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 ${
                            viewMode === 'grid' ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' : 'text-gray-600 dark:text-gray-400'
                        }`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        <span className="hidden sm:inline">Grid</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className={`gap-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 ${
                            viewMode === 'list' ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' : 'text-gray-600 dark:text-gray-400'
                        }`}
                    >
                        <List className="w-4 h-4" />
                        <span className="hidden sm:inline">List</span>
                    </Button>
                </div>
            </div>

            {/* Combined Results View */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white dark:bg-gray-800">
                    {paginateResults(filteredCredentials).map((credential) => (
                        <CredentialDialog 
                            key={credential.id} 
                            credential={credential} 
                        />
                    ))}
                </div>
            ) : (
                <div className="space-y-2 bg-white dark:bg-gray-800">
                    {paginateResults(filteredCredentials).map((credential) => (
                        <CredentialListItem 
                            key={credential.id} 
                            credential={credential} 
                        />
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {filteredCredentials.length > itemsPerPage && (
                <div className="mt-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50 text-gray-700 dark:text-gray-300"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700 dark:text-gray-300 order-first sm:order-none">
                            Page {currentPage} of {Math.ceil(filteredCredentials.length / itemsPerPage)}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => p + 1)}
                            disabled={currentPage >= Math.ceil(filteredCredentials.length / itemsPerPage)}
                            className="w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50 text-gray-700 dark:text-gray-300"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

interface PropRowProps {
    prop: {
        name: string;
        description: string;
        required?: boolean;
        defaultValue?: string;
        validValues?: string[];
    };
}

const PropRow = ({ prop }: PropRowProps) => {
    const [copied, setCopied] = useState(false);

    // Memoize the copy handler
    const handleCopy = useCallback(() => {
        if (prop.name) {
            navigator.clipboard.writeText(prop.name);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [prop.name]);

    return (
        <div 
            onClick={handleCopy}
            className={`flex items-center w-full cursor-pointer transition-colors bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded-lg p-2 ${
                copied ? 'bg-green-50 dark:bg-green-900/50' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            title="Click to copy property name"
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-300">
                        {prop.name}
                    </h4>
                    {prop.required && (
                        <Badge variant="default" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                            Required
                        </Badge>
                    )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{prop.description}</p>
            </div>
            <div className="ml-auto pl-4 flex-shrink-0 w-24 text-center">
                <span className="text-xs">
                    {copied ? (
                        <span className="text-green-600 dark:text-green-400 font-medium">Copied!</span>
                    ) : (
                        <span className="text-blue-600 dark:text-blue-400">click to copy</span>
                    )}
                </span>
            </div>
        </div>
    );
};

export default DeviceCatalog;