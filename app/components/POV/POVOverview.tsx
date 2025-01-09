'use client'

import { usePOV } from '@/app/contexts/POVContext';
import { Card } from '@/components/ui/card';

export default function POVOverview() {
  const { state } = usePOV();
  const { pov, challenges, keyBusinessServices, teamMembers } = state;

  if (!pov) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Challenges</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {challenges.length}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Business Services</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {keyBusinessServices.length}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Team Members</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {teamMembers.length}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-medium text-gray-900">Recent Challenges</h3>
          <div className="mt-4 space-y-4">
            {challenges.slice(0, 3).map((challenge) => (
              <div key={challenge.id} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{challenge.title}</span>
                <span className={`text-xs px-2 py-1 rounded-full
                  ${challenge.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 
                   challenge.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                   'bg-yellow-100 text-yellow-800'}`}>
                  {challenge.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-medium text-gray-900">Key Business Services</h3>
          <div className="mt-4 space-y-4">
            {keyBusinessServices.slice(0, 3).map((service) => (
              <div key={service.id} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{service.name}</span>
                <span className="text-sm text-gray-500">{service.tech_owner}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
} 