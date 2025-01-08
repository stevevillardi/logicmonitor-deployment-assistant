import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout, LibraryBig, Info, ExternalLink } from 'lucide-react';
import DecisionCriteriaExplorer from './DecisionCriteriaExplorer';
import ChallengesExplorer from './ChallengesExplorer';

const POVLibrary = () => {
    const [activeTab, setActiveTab] = useState('decision-criteria');
    const [isLoading, setIsLoading] = useState(false);

    const handleTabChange = (value: string) => {
        setIsLoading(true);
        setActiveTab(value);
    };

    return (
        <div className="space-y-6 mb-4">
            <Card className="border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[800px] dark:bg-gray-800">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                        <LibraryBig className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                        <CardTitle className="text-gray-900 dark:text-gray-100">Content Library</CardTitle>
                    </div>
                </CardHeader>
                <div className="mt-4 mx-4 bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-950 dark:to-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6">
                    <div className="flex gap-3 sm:gap-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0">
                            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
                        </div>
                        <div className="space-y-3">
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-100">Proof of Value Content Library</h3>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                    Access curated content to help build and deliver successful POVs:
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex items-start gap-2 p-2">
                                    <div className="w-5 h-5 rounded bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mt-0.5">
                                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">1</span>
                                    </div>
                                    <span className="text-sm text-blue-700 dark:text-blue-300">
                                        Use <span className="font-medium">Decision Criteria</span> to understand and document key customer requirements
                                    </span>
                                </div>
                                <div className="flex items-start gap-2 p-2">
                                    <div className="w-5 h-5 rounded bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mt-0.5">
                                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">2</span>
                                    </div>
                                    <span className="text-sm text-blue-700 dark:text-blue-300">
                                        Review common <span className="font-medium">Challenges</span> and their solutions to address customer concerns
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-700" />
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Need help? Post a messgage in the Sales Engineering Slack channel.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <Tabs defaultValue="decision-criteria" className="w-full dark:bg-gray-800" onValueChange={handleTabChange}>
                    <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-lg mx-4 mt-4 overflow-hidden">
                        <TabsTrigger
                            value="decision-criteria"
                            className="rounded px-4 py-2 text-gray-600 dark:text-gray-300 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/30 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400"
                        >
                            Decision Criteria
                        </TabsTrigger>
                        <TabsTrigger
                            value="challenges"
                            className="rounded px-4 py-2 text-gray-600 dark:text-gray-300 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/30 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400"
                        >
                            Challenges
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent 
                        value="decision-criteria" 
                        className="px-4 pb-4 bg-white dark:bg-gray-800"
                        key="decision-criteria"
                    >
                        <DecisionCriteriaExplorer 
                            parentLoading={isLoading}
                            onLoadingComplete={() => setIsLoading(false)}
                        />
                    </TabsContent>
                    <TabsContent 
                        value="challenges" 
                        className="px-4 pb-4 bg-white dark:bg-gray-800"
                        key="challenges"
                    >
                        <ChallengesExplorer 
                            parentLoading={isLoading}
                            onLoadingComplete={() => setIsLoading(false)}
                        />
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    );
};

export default POVLibrary; 