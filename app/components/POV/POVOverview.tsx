'use client'

import { usePOV } from '@/app/contexts/POVContext';
import { Card } from '@/components/ui/card';
import { CalendarDays, Users, Building2, Laptop2, Clock, AlertCircle, Calendar, CheckSquare } from 'lucide-react';
import { formatDate } from '@/lib/utils';

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
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200 dark:bg-blue-800" />

      <div className="space-y-6 ml-12">
        {events.map((event, index) => (
          <div key={index} className="relative">
            {/* Dot on timeline */}
            <div className="absolute -left-[2.85rem] mt-1.5">
              <div className="border-4 border-white dark:border-gray-900">
                <div className="h-4 w-4 rounded-full bg-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-gray-700 p-4 shadow-sm">
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

export default function POVOverview() {
  const { state } = usePOV();
  const { pov } = state;

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

  return (
    <div className="space-y-6 p-6">
      {/* POV Header Info */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50">
        <h2 className="text-2xl font-semibold text-blue-900 dark:text-blue-100">{pov.title}</h2>
        <div className="mt-2 text-blue-600 dark:text-blue-300">
          <p className="text-sm">{pov.customer_name} • {pov.customer_industry}</p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <p className="text-sm">
                {pov.start_date ? new Date(pov.start_date).toLocaleDateString() : 'Start: TBD'} 
                {' → '} 
                {pov.end_date ? new Date(pov.end_date).toLocaleDateString() : 'End: TBD'}
              </p>
            </div>
            <div className="text-sm font-medium">
              Duration: {calculateDuration()}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-4">
            <div className="flex items-center space-x-4">
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Key Business Services */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Key Business Services</h3>
        <div className="space-y-4">
          {(pov.key_business_services || []).slice(0, 3).map((service) => (
            <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <Building2 className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{service.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{service.tech_owner}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Activity - Challenges and Decision Criteria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Identified Challenges</h3>
          <div className="space-y-4">
            {(pov.challenges || []).slice(0, 3).map((challenge) => (
              <div key={challenge.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Decision Criteria</h3>
          <div className="space-y-4">
            {(pov.decision_criteria || []).slice(0, 3).map((criteria) => (
              <div key={criteria.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
        </Card>
      </div>

      {/* Timeline Section - Moved to bottom */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            POV Timeline
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {pov.working_sessions?.length || 0} Working Sessions
          </span>
        </div>
        
        {pov.working_sessions && pov.working_sessions.length > 0 ? (
          <Timeline events={prepareTimelineEvents()} />
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No working sessions scheduled yet</p>
          </div>
        )}
      </Card>
    </div>
  );
} 