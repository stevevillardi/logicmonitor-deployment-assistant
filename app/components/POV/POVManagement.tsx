'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, CalendarRange, Users, BarChart2, Laptop2, Building2, Clock, CheckCircle2, AlertCircle, Target, Search, Filter } from 'lucide-react';
import { usePOV } from '@/app/contexts/POVContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { POV, POVDecisionCriteria, DeviceScope } from '@/app/types/pov';
import { useAuth } from '@/app/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getEffectiveMemberDetails, calculateProgress } from '@/app/lib/utils';
import { formatDate } from '@/app/lib/utils';

const EmptySearchResults = ({ searchTerm, selectedStatus, onReset }: { 
    searchTerm: string; 
    selectedStatus: string;
    onReset: () => void;
}) => (
    <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="text-center">
            <div className="bg-gray-50 dark:bg-gray-800 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                No matching POVs found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm && selectedStatus !== 'All Status' 
                    ? `No POVs found matching "${searchTerm}" with status "${selectedStatus}"`
                    : searchTerm 
                    ? `No POVs found matching "${searchTerm}"`
                    : `No POVs found with status "${selectedStatus}"`}
            </p>
            <div className="mt-6">
                <Button
                    onClick={onReset}
                    className="flex items-center gap-2 mx-auto bg-white hover:bg-gray-50 text-gray-900 
                        dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                    variant="outline"
                >
                    Clear filters
                </Button>
            </div>
        </div>
    </div>
);

export default function POVManagement() {
    const router = useRouter();
    const { state } = usePOV();
    const povs = state.povs;
    const { isAuthenticated, isLoading } = useAuth();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All Status');
    const [currentPage, setCurrentPage] = useState(1);
    const povsPerPage = 5;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedStatus]);

    const filteredPOVs = povs?.filter(pov => {
        const matchesSearch = 
            pov.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pov.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = selectedStatus === 'All Status' || pov.status === selectedStatus;
        
        return matchesSearch && matchesStatus;
    });

    const indexOfLastPOV = currentPage * povsPerPage;
    const indexOfFirstPOV = indexOfLastPOV - povsPerPage;
    const currentPOVs = filteredPOVs?.slice(indexOfFirstPOV, indexOfLastPOV);
    const totalPages = Math.ceil((filteredPOVs?.length || 0) / povsPerPage);

    const uniqueStatuses = Array.from(new Set(povs?.map(pov => pov.status) || []));

    const handleCreatePOV = () => {
        router.push('/pov/new');
    };

    const handleViewPOV = (povId: string) => {
        router.push(`/pov/${povId}`);
    };

    const getStatusBadgeColor = (status: POV['status']) => {
        const colors = {
            'DRAFT': 'bg-yellow-100 text-yellow-800',
            'SUBMITTED': 'bg-yellow-100 text-yellow-800',
            'IN_PROGRESS': 'bg-blue-100 text-blue-800',
            'COMPLETE': 'bg-green-100 text-green-800',
            'BLOCKED': 'bg-red-100 text-red-800',
            'TECHNICALLY_SELECTED': 'bg-purple-100 text-purple-800',
            'NOT_SELECTED': 'bg-gray-100 text-gray-800',
        } as const;
        return colors[status as keyof typeof colors] || colors.DRAFT;
    };


    const getDeviceScopeSummary = (deviceScopes: DeviceScope[] | undefined) => {
        if (!deviceScopes?.length) return { total: 0, high: 0 };
        const total = (deviceScopes || []).reduce((sum, d) => sum + (d.count || 0), 0);
        const high = (deviceScopes || [])
            .filter(d => d.priority === 'HIGH')
            .reduce((sum, d) => sum + (d.count || 0), 0);
        return { total, high };
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedStatus('All Status');
    };

    return (
        <Card className="border border-gray-200 dark:border-gray-700 mb-4 h-full flex flex-col bg-white dark:bg-gray-900">
            <CardHeader className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-[#040F4B] dark:text-blue-400" />
                        <CardTitle className="text-gray-900 dark:text-gray-100">POV Management</CardTitle>
                    </div>
                    <Button
                        onClick={handleCreatePOV}
                        className="flex items-center gap-2 bg-[#040F4B] hover:bg-[#0A1B6F] text-white dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create POV
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-6 flex-1 bg-white dark:bg-gray-900">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Search and Filter
                        </label>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {filteredPOVs?.length || 0} POVs
                        </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <Input
                                placeholder="Search POVs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    className="gap-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 w-full sm:w-[180px] justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-4 h-4" />
                                        <span className="truncate">{selectedStatus}</span>
                                    </div>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[180px] p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                <div className="p-2">
                                    <div
                                        className={`px-2 py-1.5 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
                                            selectedStatus === 'All Status' ? 'bg-gray-100 dark:bg-gray-800' : ''
                                        }`}
                                        onClick={() => setSelectedStatus('All Status')}
                                    >
                                        All Status
                                    </div>
                                    {uniqueStatuses.map((status) => (
                                        <div
                                            key={status}
                                            className={`px-2 py-1.5 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
                                                selectedStatus === status ? 'bg-gray-100 dark:bg-gray-800' : ''
                                            }`}
                                            onClick={() => setSelectedStatus(status)}
                                        >
                                            {status.replace(/_/g, ' ')}
                                        </div>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {povs && povs.length > 0 ? (
                    filteredPOVs && filteredPOVs.length > 0 ? (
                        <div className="grid gap-4">
                            {currentPOVs?.map((pov: POV) => (
                                <div
                                    key={pov.id}
                                    className="flex flex-col p-4 border border-gray-200 dark:border-gray-700 rounded-lg 
                                        hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                                    onClick={() => handleViewPOV(pov.id)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {pov.customer_name}
                                            </h3>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {pov.title}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                <Building2 className="h-3.5 w-3.5" />
                                                <span>{pov.customer_industry}</span>
                                                <span>•</span>
                                                <span>{pov.customer_region}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusBadgeColor(pov.status)}`}>
                                                {pov.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <CalendarRange className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Timeline</p>
                                            </div>
                                            <div className="mt-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                                                    <p className="text-gray-900 dark:text-gray-100 text-sm">
                                                        Start: {formatDate(pov.start_date)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Target className="h-3.5 w-3.5 text-gray-400" />
                                                    <p className="text-gray-900 dark:text-gray-100 text-sm">
                                                        Target: {formatDate(pov.end_date)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Team</p>
                                            </div>
                                            <div className="mt-1 space-y-1">
                                                <p className="text-gray-900 dark:text-gray-100 text-sm">
                                                    {pov.team_members?.length || 0} Total Members
                                                </p>
                                                <div className="flex gap-2 text-xs">
                                                    <span className="flex items-center gap-1 text-blue-600">
                                                        <Building2 className="h-3 w-3" />
                                                        {pov.team_members?.filter(m => getEffectiveMemberDetails(m).organization === 'LM').length || 0} LM
                                                    </span>
                                                    <span className="flex items-center gap-1 text-green-600">
                                                        <Users className="h-3 w-3" />
                                                        {pov.team_members?.filter(m => getEffectiveMemberDetails(m).organization === 'CUSTOMER').length || 0} Customer
                                                    </span>
                                                    <span className="flex items-center gap-1 text-purple-600">
                                                        <Users className="h-3 w-3" />
                                                        {pov.team_members?.filter(m => getEffectiveMemberDetails(m).organization === 'PARTNER').length || 0} Partner
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <BarChart2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Progress</p>
                                            </div>
                                            <div className="mt-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                                                        <CheckCircle2 className="h-3.5 w-3.5 text-gray-400" />
                                                        Decision Criteria
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {calculateProgress(pov.decision_criteria)}%
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                                                        <AlertCircle className="h-3.5 w-3.5 text-gray-400" />
                                                        Challenges
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {pov.challenges?.filter(c => c.status === 'COMPLETED').length || 0}/{pov.challenges?.length || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Laptop2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Device Scope</p>
                                            </div>
                                            <div className="mt-1 space-y-1">
                                                {(() => {
                                                    const { total, high } = getDeviceScopeSummary(pov.device_scopes);
                                                    return (
                                                        <>
                                                            <div className="flex items-center gap-1.5">
                                                                <Laptop2 className="h-3.5 w-3.5 text-gray-400" />
                                                                <p className="text-gray-900 dark:text-gray-100 text-sm">
                                                                    {total} Total Devices
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                                                                <p className="text-red-600 dark:text-red-400 text-xs">
                                                                    {high} High Priority
                                                                </p>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                            Created on {formatDate(pov.created_at)}
                                        </p>
                                        <div className="text-xs text-gray-400 dark:text-gray-500">
                                            {pov.working_sessions?.length || 0} Working Sessions • {pov.key_business_services?.length || 0} Business Services
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptySearchResults 
                            searchTerm={searchTerm} 
                            selectedStatus={selectedStatus}
                            onReset={handleResetFilters}
                        />
                    )
                ) : (
                    <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg h-full flex items-center justify-center bg-transparent">
                        <div className="text-center px-4 py-12">
                            <div className="bg-gray-50 dark:bg-gray-800 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-6 h-6 text-[#040F4B] dark:text-blue-400" />
                            </div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                No Published Proof of Values (POVs)
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Your published POVs will appear here, create one to get started!
                            </p>
                            <div className="mt-6">
                                <Button
                                    onClick={handleCreatePOV}
                                    className="flex items-center gap-2 mx-auto bg-[#040F4B] hover:bg-[#0A1B6F] text-white 
                                        dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                                    variant="ghost"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create POV
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50 text-gray-900 dark:text-gray-100"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700 dark:text-gray-300 order-first sm:order-none">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50 text-gray-900 dark:text-gray-100"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 