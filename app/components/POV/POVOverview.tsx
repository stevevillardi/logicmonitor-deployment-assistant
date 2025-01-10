'use client'

import { usePOV } from '@/app/contexts/POVContext';
import { Card } from '@/components/ui/card';
import { CalendarDays, Users, Building2, Laptop2, Clock, AlertCircle, Calendar, CheckSquare, Monitor, Target } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface TimelineEvent {
  date: Date;
  title: string;
  description?: string;
  status: string;
  type: 'session';
}

const formatDateOnly = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

      <div className="space-y-6 ml-12">
        {events.map((event, index) => (
          <div key={index} className="relative">
            {/* Dot on timeline - Adjusted positioning */}
            <div className="absolute -left-[2.85rem] top-1.5 flex items-center justify-center">
              <div className="border-4 border-white dark:border-gray-900 rounded-full">
                <div className="h-4 w-4 rounded-full bg-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                  <Calendar className="h-4 w-4" />
                  <time>{formatDateOnly(event.date.toISOString())}</time>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium
                  ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                {event.title}
              </h3>
              {event.description && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {event.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status.toUpperCase()) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400';
    case 'SCHEDULED':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400';
    default:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400';
  }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
}

export default function POVOverview() {
  const { state } = usePOV();
  const { pov } = state;
  const router = useRouter();

  if (!pov) return null;

  const calculateDuration = () => {
    if (!pov.start_date || !pov.end_date) return 'Dates not set';
    
    const start = new Date(pov.start_date);
    const end = new Date(pov.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
    
    const weeks = Math.ceil(diffDays/7);
    if (diffDays < 30) return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
    
    const months = Math.ceil(diffDays/30);
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  };

  const stats = [
    {
      name: 'Challenges',
      value: (pov.challenges || []).length,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      name: 'Business Services',
      value: (pov.key_business_services || []).length,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Team Members',
      value: (pov.team_members || []).length,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Device Scope',
      value: (pov.device_scopes || []).length,
      icon: Laptop2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Working Sessions',
      value: (pov.working_sessions || []).length,
      icon: Clock,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    }
  ];

  const prepareTimelineEvents = (): TimelineEvent[] => {
    if (!pov.working_sessions) return [];
    
    return pov.working_sessions
      .map(session => ({
        date: new Date(session.session_date),
        title: session.title,
        description: session.notes,
        status: session.status,
        type: 'session' as const
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const navigateToTab = (tab: string) => {
    router.push(`/pov/${pov?.id}/${tab}`);
  };

  // Empty state components
  const EmptyTeamSection = () => (
    <div className="text-center py-8">
      <Users className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No team members</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Start by adding team members to your POV
      </p>
    </div>
  );

  const EmptyDevicesSection = () => (
    <div className="text-center py-8">
      <Monitor className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No devices added</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Define your device scope to get started
      </p>
    </div>
  );

  const EmptySessionsSection = () => (
    <div className="text-center py-8">
      <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No sessions scheduled</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Schedule working sessions to track progress
      </p>
    </div>
  );

  const EmptyCriteriaSection = () => (
    <div className="text-center py-8">
      <Target className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No decision criteria</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Define success criteria for your POV
      </p>
    </div>
  );

  const EmptyBusinessServicesSection = () => (
    <div className="text-center py-8">
      <Building2 className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No business services</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Add key business services to track
      </p>
    </div>
  );

  const EmptyChallengesSection = () => (
    <div className="text-center py-8">
      <AlertCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No challenges identified</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Document challenges to address
      </p>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* POV Header Info */}
      <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold text-blue-950 dark:text-blue-50">
              {pov.customer_name}
            </h2>
            <div className="mt-2 space-y-2">
              <p className="text-lg text-blue-800 dark:text-blue-200">
                {pov.title}
              </p>
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <Building2 className="h-4 w-4" />
                <span>{pov.customer_industry}</span>
                <span>•</span>
                <span>{pov.customer_region}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-blue-700 dark:text-blue-300">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <span>
                    {pov.start_date ? formatDateOnly(pov.start_date) : 'Start: TBD'} 
                    {' → '} 
                    {pov.end_date ? formatDateOnly(pov.end_date) : 'End: TBD'}
                  </span>
                </div>
                <div className="font-medium">
                  Duration: {calculateDuration()}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex -space-x-2">
              {(pov.team_members || []).map((member) => (
                <TooltipProvider key={member.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-800 shadow-sm hover:scale-105 transition-transform cursor-pointer">
                        <AvatarFallback 
                          className={`${
                            member.organization === 'LM' 
                              ? 'bg-blue-100 text-blue-700' :
                            member.organization === 'CUSTOMER' 
                              ? 'bg-green-100 text-green-700' :
                            member.organization === 'PARTNER'
                              ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          } text-xs`}
                        >
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                      <div className="text-sm">
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                        <p className="text-xs text-gray-500">
                          {member.organization === 'LM' ? 'Lockheed Martin' :
                           member.organization === 'CUSTOMER' ? 'Customer' :
                           member.organization === 'PARTNER' ? 'Partner' :
                           member.organization}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            <span className="text-xs text-blue-600 dark:text-blue-300 font-medium">
              {pov.team_members?.length || 0} Team Members
            </span>
          </div>
        </div>
      </Card>

      {/* Stats Grid - Make each card clickable */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card 
            key={stat.name} 
            className="p-4 cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            onClick={() => navigateToTab(stat.name.toLowerCase().replace(' ', '-'))}
          >
            <div className="flex items-center space-x-4">
              <div className={`${stat.bgColor} dark:bg-opacity-10 p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color} dark:text-opacity-90`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Device Scope and Business Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card 
          className="p-6 lg:col-span-3 cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
          onClick={() => navigateToTab('device-scope')}
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Device Scope Summary
            <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">(Click to view all)</span>
          </h3>
          {pov.device_scopes?.length ? (
            <div className="grid grid-cols-2 gap-4">
              {/* Categories Summary */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Categories</h4>
                <div className="space-y-2">
                  {Array.from(new Set((pov.device_scopes || []).map(device => device.category)))
                    .map(category => {
                      const devicesInCategory = pov.device_scopes?.filter(d => d.category === category) || [];
                      const totalCount = devicesInCategory.reduce((sum, d) => sum + d.count, 0);
                      
                      return (
                        <div key={category} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
                          <span className="text-sm text-gray-600 dark:text-gray-300">{category}</span>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400">{totalCount} devices</Badge>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Priority Summary */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Priority Distribution</h4>
                <div className="space-y-2">
                  {['HIGH', 'MEDIUM', 'LOW'].map(priority => {
                    const devicesWithPriority = pov.device_scopes?.filter(d => d.priority === priority) || [];
                    const totalCount = devicesWithPriority.reduce((sum, d) => sum + d.count, 0);
                    
                    return (
                      <div key={priority} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-300">{priority}</span>
                        <Badge variant="secondary" className={
                          priority === 'HIGH' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400' :
                          priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400' :
                          'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                        }>
                          {totalCount} devices
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <EmptyDevicesSection />
          )}
        </Card>

        <Card 
          className="p-6 cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
          onClick={() => navigateToTab('business-services')}
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Key Business Services
            <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">(Click to view all)</span>
          </h3>
          {pov.key_business_services?.length ? (
            <div className="space-y-3">
              {(pov.key_business_services || []).slice(0, 3).map((service) => (
                <div key={service.id} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <Building2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{service.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{service.tech_owner}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyBusinessServicesSection />
          )}
        </Card>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          className="p-6 cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
          onClick={() => navigateToTab('challenges')}
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Identified Challenges
            <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">(Click to view all)</span>
          </h3>
          {pov.challenges?.length ? (
            <div className="space-y-4">
              {(pov.challenges || []).slice(0, 3).map((challenge) => (
                <div key={challenge.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{challenge.title}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium
                    ${challenge.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' : 
                     challenge.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400' :
                     'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400'}`}>
                    {challenge.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyChallengesSection />
          )}
        </Card>

        <Card 
          className="p-6 cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
          onClick={() => navigateToTab('decision-criteria')}
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Decision Criteria
            <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">(Click to view all)</span>
          </h3>
          {pov.decision_criteria?.length ? (
            <div className="space-y-4">
              {(pov.decision_criteria || []).slice(0, 3).map((criteria) => (
                <div key={criteria.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <CheckSquare className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{criteria.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Success Criteria: {criteria.success_criteria}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    criteria.status === 'MET' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' : 
                    criteria.status === 'NOT_MET' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400' :
                    criteria.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-400'
                  }`}>
                    {criteria.status?.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyCriteriaSection />
          )}
        </Card>
      </div>

      {/* Timeline Section */}
      <Card 
        className="p-6 cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
        onClick={() => navigateToTab('working-sessions')}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            POV Timeline
            <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">(Click to view all)</span>
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {pov.working_sessions?.length || 0} Working Sessions
          </span>
        </div>
        
        {pov.working_sessions?.length ? (
          <Timeline events={prepareTimelineEvents()} />
        ) : (
          <EmptySessionsSection />
        )}
      </Card>
    </div>
  );
} 