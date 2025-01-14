'use client'

import { usePOV } from '@/app/contexts/POVContext';
import { supabaseBrowser } from '@/app/lib/supabase/client';
import { POV, POVChallenge, KeyBusinessService, TeamMember, DeviceScope, WorkingSession, POVDecisionCriteria, POVActivity, POVComment } from '@/app/types/pov';
import { devLog } from '../components/Shared/utils/debug';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

interface TeamMemberWithPOV extends Partial<TeamMember> {
  pov_id?: string;
}

interface ChallengeWithRelations extends Omit<Partial<POVChallenge>, 'categories' | 'outcomes'> {
  categories?: string[];
  outcomes?: Array<{ outcome: string; order_index: number }>;
}

interface DecisionCriteriaWithRelations extends Omit<Partial<POVDecisionCriteria>, 'categories' | 'activities'> {
  categories?: string[];
  activities?: Array<{ id?: string; activity: string; order_index: number }>;
}

interface InvalidSection {
  name: string;
  tabName: string;
  href: string;
}

export function usePOVOperations() {
  const { dispatch, state } = usePOV();

  const createPOV = async (data: Partial<POV>): Promise<POV> => {
    return toast.promise(
        (async () => {
            const { data: { user }, error: userError } = await supabaseBrowser.auth.getUser();
            if (userError || !user) throw new Error('Unauthorized');

            // First create the POV
            const { data: newPov, error } = await supabaseBrowser
                .from('pov')
                .insert({
                    ...data,
                    created_by: user.id,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .select('*')
                .single();

            if (error) {
                devLog('Supabase error:', error);
                throw new Error(error.message);
            }

            if (!newPov) {
                throw new Error('Failed to create POV: No data returned');
            }

            // First check if team member exists
            const { data: existingMember, error: existingError } = await supabaseBrowser
                .from('team_members')
                .select('*')
                .eq('email', user.email)
                .single();

            // If no existing member, create one
            const teamMember = existingMember || await (async () => {
                const { data: newMember, error: memberError } = await supabaseBrowser
                    .from('team_members')
                    .insert({
                        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'LM User',
                        email: user.email,
                        role: 'POV Owner',
                        organization: 'LM',
                        created_at: new Date().toISOString(),
                    })
                    .select('*')
                    .single();

                if (memberError) throw memberError;
                return newMember;
            })();

            if (!teamMember) throw new Error('Failed to get or create team member');

            // Then create the POV-TeamMember relationship
            const { error: povMemberError } = await supabaseBrowser
                .from('pov_team_members')
                .insert({
                    pov_id: newPov.id,
                    team_member_id: teamMember.id,
                    name: teamMember.name,
                    email: teamMember.email,
                    role: teamMember.role,
                    organization: teamMember.organization,
                    created_by: user.id,
                    updated_by: user.id,
                    updated_at: new Date().toISOString(),
                });

            if (povMemberError) {
                console.error('Error adding creator as team member:', povMemberError);
                throw povMemberError;
            }

            dispatch({ type: 'SET_POV', payload: newPov });

            // Add activity for new POV
            await addActivity(
                newPov.id,
                'STATUS',
                'POV Created',
                `POV "${newPov.title}" created for ${newPov.customer_name} by ${user.user_metadata?.full_name || user.email?.split('@')[0] || 'LM User'}`,
                newPov.id
            );

            return newPov;
        })(),
        {
            loading: 'Creating POV...',
            success: (newPov) => `POV "${newPov.title}" created successfully`,
            error: (err) => err.message || 'Failed to create POV'
        }
    );
  };

  const createTemplateChallenge = async (challengeData: ChallengeWithRelations) => {
    return toast.promise(
        (async () => {
            const { data: { user }, error: userError } = await supabaseBrowser.auth.getUser();
            if (userError || !user) throw new Error('Unauthorized');

            // Create the challenge in the content library
            const { data: newChallenge, error: challengeError } = await supabaseBrowser
                .from('challenges')
                .insert({
                    title: challengeData.title,
                    challenge_description: challengeData.challenge_description,
                    business_impact: challengeData.business_impact,
                    example: challengeData.example,
                    metadata: {},
                    created_by: user.id,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select('*')
                .single();

            if (challengeError) throw challengeError;
            if (!newChallenge) throw new Error('Failed to create challenge in library');

            // Create the POV challenge instance with its relationships
            const { data: povChallenge, error: povChallengeError } = await supabaseBrowser
                .from('pov_challenges')
                .insert({
                    pov_id: challengeData.pov_id,
                    challenge_id: newChallenge.id,
                    title: challengeData.title,
                    challenge_description: challengeData.challenge_description,
                    business_impact: challengeData.business_impact,
                    example: challengeData.example,
                    created_by: user.id,
                    status: challengeData.status || 'OPEN',
                    created_at: new Date().toISOString()
                })
                .select('*')
                .single();

            if (povChallengeError) throw povChallengeError;

            // Add categories if provided
            if (challengeData.categories?.length) {
                await supabaseBrowser
                    .from('pov_challenge_categories')
                    .insert(
                        challengeData.categories.map(category => ({
                            pov_challenge_id: povChallenge.id,
                            category
                        }))
                    );
            }

            // Add outcomes if provided
            if (challengeData.outcomes?.length) {
                await supabaseBrowser
                    .from('pov_challenge_outcomes')
                    .insert(
                        challengeData.outcomes.map(outcome => ({
                            pov_challenge_id: povChallenge.id,
                            outcome: outcome.outcome,
                            order_index: outcome.order_index
                        }))
                    );
            }

            dispatch({ type: 'ADD_CHALLENGE', payload: povChallenge });
            return povChallenge;
        })(),
        {
            loading: 'Creating template challenge...',
            success: (challenge) => `Challenge "${challenge.title}" created and added to library`,
            error: (err) => err.message || 'Failed to create template challenge'
        }
    );
  };

  const addChallenge = async (challengeData: ChallengeWithRelations & {
    addToLibrary?: boolean;
    selectedTemplateId?: string | null;
  }) => {
    try {
      const { data: { user }, error: userError } = await supabaseBrowser.auth.getUser();
      if (userError || !user) throw new Error('Unauthorized');

      try {
        if (challengeData.addToLibrary) {
          return createTemplateChallenge(challengeData);
        }

        // Create POV challenge entry
        const { data: newChallenge, error: challengeError } = await supabaseBrowser
          .from('pov_challenges')
          .insert({
            pov_id: challengeData.pov_id,
            challenge_id: challengeData.selectedTemplateId || null,
            title: challengeData.title,
            challenge_description: challengeData.challenge_description,
            business_impact: challengeData.business_impact,
            example: challengeData.example,
            created_by: user.id,
            status: challengeData.status || 'OPEN',
            created_at: new Date().toISOString()
          })
          .select('*')
          .single();

        if (challengeError) throw challengeError;
        if (!newChallenge) throw new Error('Failed to create POV challenge');

        // Add categories and outcomes
        await Promise.all([
          // Add categories
          challengeData.categories?.length ?
            supabaseBrowser
              .from('pov_challenge_categories')
              .insert(
                challengeData.categories.map(category => ({
                  pov_challenge_id: newChallenge.id,
                  category
                }))
              ) : Promise.resolve(),
          // Add outcomes
          challengeData.outcomes?.length ?
            supabaseBrowser
              .from('pov_challenge_outcomes')
              .insert(
                challengeData.outcomes.map(outcome => ({
                  pov_challenge_id: newChallenge.id,
                  outcome: outcome.outcome,
                  order_index: outcome.order_index
                }))
              ) : Promise.resolve()
        ]);

        // Fetch complete challenge with relations
        const { data: completeChallenge } = await supabaseBrowser
          .from('pov_challenges')
          .select(`
            *,
            categories:pov_challenge_categories(*),
            outcomes:pov_challenge_outcomes(*)
          `)
          .eq('id', newChallenge.id)
          .single();

        if (completeChallenge) {
          dispatch({ type: 'ADD_CHALLENGE', payload: completeChallenge });

          // Add activity for new challenge
          if (!challengeData.pov_id) throw new Error('POV ID is required');
          await addActivity(
            challengeData.pov_id,
            'CHALLENGE',
            'Challenge Added',
            `"${challengeData.title}" challenge created`,
            completeChallenge.id
          );

          toast.success('Challenge added successfully');
          return completeChallenge;
        }

        throw new Error('Failed to fetch complete challenge');
      } catch (error) {
        console.error('Error in addChallenge:', error);
        throw error;
      }
    } catch (error: any) {
      console.error('Error adding challenge:', error);
      toast.error(error.message || 'Failed to add challenge');
      throw error;
    }
  };

  const updateChallenge = async (challengeId: string, challengeData: ChallengeWithRelations) => {
    return toast.promise(
        (async () => {
            // Update main challenge data
            const { data: updatedChallenge, error } = await supabaseBrowser
                .from('pov_challenges')
                .update({
                    title: challengeData.title,
                    challenge_description: challengeData.challenge_description,
                    business_impact: challengeData.business_impact,
                    example: challengeData.example,
                    status: challengeData.status
                })
                .eq('id', challengeId)
                .select()
                .single();

            if (error) throw error;
            if (!updatedChallenge) throw new Error('Failed to update challenge');

            // Update categories and outcomes
            await Promise.all([
                // Update categories
                (async () => {
                    if (challengeData.categories) {
                        await supabaseBrowser
                            .from('pov_challenge_categories')
                            .delete()
                            .eq('pov_challenge_id', challengeId);

                        if (challengeData.categories.length) {
                            await supabaseBrowser
                                .from('pov_challenge_categories')
                                .insert(
                                    challengeData.categories.map(category => ({
                                        pov_challenge_id: challengeId,
                                        category
                                    }))
                                );
                        }
                    }
                })(),
                // Update outcomes
                (async () => {
                    if (challengeData.outcomes) {
                        await supabaseBrowser
                            .from('pov_challenge_outcomes')
                            .delete()
                            .eq('pov_challenge_id', challengeId);

                        if (challengeData.outcomes.length) {
                            await supabaseBrowser
                                .from('pov_challenge_outcomes')
                                .insert(
                                    challengeData.outcomes.map(outcome => ({
                                        pov_challenge_id: challengeId,
                                        outcome: outcome.outcome,
                                        order_index: outcome.order_index
                                    }))
                                );
                        }
                    }
                })()
            ]);

            // Fetch the complete updated challenge with relations
            const { data: completeChallenge } = await supabaseBrowser
                .from('pov_challenges')
                .select(`
                    *,
                    categories:pov_challenge_categories(*),
                    outcomes:pov_challenge_outcomes(*)
                `)
                .eq('id', challengeId)
                .single();

            if (completeChallenge) {
                dispatch({ type: 'UPDATE_CHALLENGE', payload: completeChallenge });

                if (!challengeData.pov_id) throw new Error('POV ID is required');
                await addActivity(
                    challengeData.pov_id,
                    'CHALLENGE',
                    'Challenge Updated',
                    `"${challengeData.title}" challenge ${getStatusMessage(challengeData.status)}`,
                    challengeId
                );

                return completeChallenge;
            }

            throw new Error('Failed to fetch updated challenge');
        })(),
        {
            loading: 'Updating challenge...',
            success: (challenge) => `Challenge "${challenge.title}" updated successfully`,
            error: (err) => err.message || 'Failed to update challenge'
        }
    );
  };

  const addBusinessService = async (serviceData: Partial<KeyBusinessService>) => {
    return toast.promise(
        (async () => {
            const { data: { user }, error: userError } = await supabaseBrowser.auth.getUser();
            if (userError || !user) throw new Error('Unauthorized');

            const { data: newService, error } = await supabaseBrowser
                .from('pov_key_business_services')
                .insert({
                    ...serviceData,
                    created_by: user.id,
                    created_at: new Date().toISOString(),
                })
                .select('*')
                .single();

            if (error) throw error;
            if (!newService) throw new Error('Failed to create business service');

            dispatch({ type: 'ADD_BUSINESS_SERVICE', payload: newService });

            if (!serviceData.pov_id) throw new Error('POV ID is required');
            await addActivity(
                serviceData.pov_id,
                'STATUS',
                'Business Service Added',
                `Added "${serviceData.name}" business service`,
                newService.id
            );

            return newService;
        })(),
        {
            loading: 'Adding business service...',
            success: (service) => `Business service "${service.name}" added successfully`,
            error: (err) => err.message || 'Failed to add business service'
        }
    );
  };

  const updateBusinessService = async (serviceId: string, serviceData: Partial<KeyBusinessService>) => {
    return toast.promise(
        (async () => {
            const { data: updatedService, error } = await supabaseBrowser
                .from('pov_key_business_services')
                .update(serviceData)
                .eq('id', serviceId)
                .select('*')
                .single();

            if (error) throw error;
            if (!updatedService) throw new Error('Failed to update business service');

            dispatch({ type: 'UPDATE_BUSINESS_SERVICE', payload: updatedService });
            return updatedService;
        })(),
        {
            loading: 'Updating business service...',
            success: (service) => `Business service "${service.name}" updated successfully`,
            error: (err) => err.message || 'Failed to update business service'
        }
    );
  };

  const deleteBusinessService = async (serviceId: string) => {
    return toast.promise(
        (async () => {
            const { error } = await supabaseBrowser
                .from('pov_key_business_services')
                .delete()
                .eq('id', serviceId);

            if (error) throw error;

            dispatch({ type: 'DELETE_BUSINESS_SERVICE', payload: serviceId });
        })(),
        {
            loading: 'Deleting business service...',
            success: 'Business service deleted successfully',
            error: (err) => err.message || 'Failed to delete business service'
        }
    );
  };

  const addTeamMember = async (memberData: TeamMemberWithPOV) => {
    return toast.promise(
        (async () => {
            const { data: { user }, error: userError } = await supabaseBrowser.auth.getUser();
            if (userError || !user) throw new Error('Unauthorized');

            // First upsert the team member
            const { data: newMember, error: memberError } = await supabaseBrowser
                .from('team_members')
                .upsert({
                    id: memberData.id, // Will be undefined for new members
                    name: memberData.name,
                    email: memberData.email,
                    role: memberData.role,
                    organization: memberData.organization,
                    created_at: new Date().toISOString(),
                }, {
                    onConflict: 'email', // Use email as the unique constraint
                    ignoreDuplicates: false, // Update existing records
                })
                .select('*')
                .single();

            if (memberError) throw memberError;
            if (!newMember) throw new Error('Failed to create/update team member');

            // Then create the POV-TeamMember relationship if it doesn't exist
            const { error: povMemberError } = await supabaseBrowser
                .from('pov_team_members')
                .upsert({
                    pov_id: memberData.pov_id,
                    team_member_id: newMember.id,
                    name: memberData.name,
                    email: memberData.email,
                    role: memberData.role,
                    organization: memberData.organization,
                    updated_by: user.id,
                    updated_at: new Date().toISOString(),
                    created_by: user.id,
                }, {
                    onConflict: 'pov_id,team_member_id',
                    ignoreDuplicates: true, // Skip if relationship already exists
                });

            if (povMemberError) throw povMemberError;

            dispatch({ type: 'ADD_TEAM_MEMBER', payload: newMember });

            // Add activity for new team member
            if (!memberData.pov_id) throw new Error('POV ID is required');
            await addActivity(
                memberData.pov_id,
                'TEAM',
                'Team Member Added',
                `"${memberData.name}" added to team`,
                newMember.id
            );

            return newMember;
        })(),
        {
            loading: 'Adding team member...',
            success: (member) => `Team member "${member.name}" added successfully`,
            error: (err) => err.message || 'Failed to add team member'
        }
    );
  };

  const updateTeamMember = async (memberId: string, memberData: TeamMemberWithPOV) => {
    return toast.promise(
        (async () => {
            const { data: { user }, error: userError } = await supabaseBrowser.auth.getUser();
            if (userError || !user) throw new Error('Unauthorized');

            const { data: updatedMember, error } = await supabaseBrowser
                .from('pov_team_members')
                .update({
                    name: memberData.name,
                    email: memberData.email,
                    role: memberData.role,
                    organization: memberData.organization,
                    updated_by: user.id,
                    updated_at: new Date().toISOString()
                })
                .eq('team_member_id', memberId)
                .select('*')
                .single();

            if (error) throw error;
            if (!updatedMember) throw new Error('Failed to update team member');

            dispatch({ type: 'UPDATE_TEAM_MEMBER', payload: updatedMember });

            if (!memberData.pov_id) throw new Error('POV ID is required');
            await addActivity(
                memberData.pov_id,
                'TEAM',
                'Team Member Updated',
                `"${memberData.name}" team member details updated`,
                memberId
            );

            return updatedMember;
        })(),
        {
            loading: 'Updating team member...',
            success: (member) => `Team member "${member.name}" updated successfully`,
            error: (err) => err.message || 'Failed to update team member'
        }
    );
  };

  const deleteTeamMember = async (memberId: string) => {
    return toast.promise(
        (async () => {
            const { error: junctionError } = await supabaseBrowser
                .from('pov_team_members')
                .delete()
                .eq('id', memberId)
                .eq('pov_id', state.pov?.id);

            if (junctionError) throw junctionError;
            dispatch({ type: 'DELETE_TEAM_MEMBER', payload: memberId });
        })(),
        {
            loading: 'Removing team member...',
            success: 'Team member removed successfully',
            error: (err) => err.message || 'Failed to remove team member'
        }
    );
  };

  const addDeviceScope = async (deviceData: Partial<DeviceScope>) => {
    return toast.promise(
        (async () => {
            const { data: { user }, error: userError } = await supabaseBrowser.auth.getUser();
            if (userError || !user) throw new Error('Unauthorized');

            const { data: newDevice, error } = await supabaseBrowser
                .from('pov_device_scopes')
                .insert({
                    ...deviceData,
                    created_by: user.id,
                    created_at: new Date().toISOString(),
                })
                .select('*')
                .single();

            if (error) throw error;
            if (!newDevice) throw new Error('Failed to create device scope');

            dispatch({ type: 'ADD_DEVICE_SCOPE', payload: newDevice });

            if (!deviceData.pov_id) throw new Error('POV ID is required');
            await addActivity(
                deviceData.pov_id,
                'STATUS',
                'Device Scope Added',
                `Added ${deviceData.device_type} device scope with ${deviceData.count} devices`,
                newDevice.id
            );

            return newDevice;
        })(),
        {
            loading: 'Adding device scope...',
            success: (device) => `Device scope ${device.device_type} added successfully`,
            error: (err) => err.message || 'Failed to add device scope'
        }
    );
  };

  const updateDeviceScope = async (deviceId: string, deviceData: Partial<DeviceScope>) => {
    return toast.promise(
        (async () => {
            const { data: updatedDevice, error } = await supabaseBrowser
                .from('pov_device_scopes')
                .update(deviceData)
                .eq('id', deviceId)
                .select('*')
                .single();

            if (error) throw error;
            if (!updatedDevice) throw new Error('Failed to update device scope');

            dispatch({ type: 'UPDATE_DEVICE_SCOPE', payload: updatedDevice });
            return updatedDevice;
        })(),
        {
            loading: 'Updating device scope...',
            success: 'Device scope updated successfully',
            error: (err) => err.message || 'Failed to update device scope'
        }
    );
  };

  const deleteDeviceScope = async (deviceId: string) => {
    return toast.promise(
        (async () => {
            const { error } = await supabaseBrowser
                .from('pov_device_scopes')
                .delete()
                .eq('id', deviceId);

            if (error) throw error;

            dispatch({ type: 'DELETE_DEVICE_SCOPE', payload: deviceId });
        })(),
        {
            loading: 'Deleting device scope...',
            success: 'Device scope deleted successfully',
            error: (err) => err.message || 'Failed to delete device scope'
        }
    );
  };

  const addWorkingSession = async (sessionData: Partial<WorkingSession>) => {
    return toast.promise(
        (async () => {
            const { data: { user }, error: userError } = await supabaseBrowser.auth.getUser();
            if (userError || !user) throw new Error('Unauthorized');

            const { data: newSession, error } = await supabaseBrowser
                .from('pov_working_sessions')
                .insert({
                    title: sessionData.title,
                    status: sessionData.status,
                    session_date: sessionData.session_date,
                    duration: sessionData.duration,
                    notes: sessionData.notes,
                    pov_id: sessionData.pov_id,
                    created_by: user.id,
                    created_at: new Date().toISOString(),
                })
                .select('*')
                .single();

            if (error) throw error;
            if (!newSession) throw new Error('Failed to create working session');

            // Add activities if any
            if (sessionData.session_activities?.length) {
                const { error: activitiesError } = await supabaseBrowser
                    .from('pov_session_activities')
                    .insert(
                        sessionData.session_activities.map((activity, index) => ({
                            session_id: newSession.id,
                            decision_criteria_activity_id: activity.decision_criteria_activity_id,
                            activity: activity.activity,
                            status: activity.status,
                            notes: activity.notes,
                            display_order: index
                        }))
                    );

                if (activitiesError) throw activitiesError;
            }

            // Fetch complete session
            const { data: completeSession } = await supabaseBrowser
                .from('pov_working_sessions')
                .select(`
                    *,
                    session_activities:pov_session_activities(
                        id,
                        decision_criteria_activity_id,
                        activity,
                        status,
                        notes,
                        display_order
                    )
                `)
                .eq('id', newSession.id)
                .single();

            if (completeSession) {
                dispatch({ type: 'ADD_WORKING_SESSION', payload: completeSession });
            }

            if (!sessionData.pov_id) throw new Error('POV ID is required');
            await addActivity(
                sessionData.pov_id,
                'SESSION',
                'Working Session Created',
                `"${sessionData.title}" session scheduled`,
                newSession.id
            );

            return completeSession;
        })(),
        {
            loading: 'Creating working session...',
            success: (session) => `Working session "${session.title}" created successfully`,
            error: (err) => err.message || 'Failed to create working session'
        }
    );
  };

  const updateWorkingSession = async (sessionId: string, sessionData: Partial<WorkingSession>) => {
    return toast.promise(
        (async () => {
            // First update the working session
            const { data: updatedSession, error } = await supabaseBrowser
                .from('pov_working_sessions')
                .update({
                    ...(sessionData.title && { title: sessionData.title }),
                    ...(sessionData.status && { status: sessionData.status }),
                    ...(sessionData.session_date && { session_date: sessionData.session_date }),
                    ...(sessionData.duration && { duration: sessionData.duration }),
                    ...(sessionData.notes && { notes: sessionData.notes }),
                    updated_at: new Date().toISOString()
                })
                .eq('id', sessionId)
                .select('*')
                .single();

            if (error) throw error;
            if (!updatedSession) throw new Error('Failed to update working session');

            // Then handle the activities
            if (sessionData.session_activities) {
                // Find the activity that changed (compare with current activities)
                const currentSession = state.pov?.working_sessions?.find(s => s.id === sessionId);
                const changedActivity = sessionData.session_activities.find((newActivity, index) => {
                    const oldActivity = currentSession?.session_activities?.[index];
                    return oldActivity && oldActivity.status !== newActivity.status;
                });

                // If there's a changed activity, update the pov_decision_criteria_activities table
                if (changedActivity?.decision_criteria_activity_id) {
                    const { error: dcActivityError, data: updatedCriteria } = await supabaseBrowser
                        .from('pov_decision_criteria_activities')
                        .update({ status: changedActivity.status })
                        .eq('id', changedActivity.decision_criteria_activity_id)
                        .select('*')
                        .single();

                    if (dcActivityError) throw dcActivityError;
                    // Update decision criteria in state
                    if (updatedCriteria) {
                        console.log('updatedCriteria', updatedCriteria);
                        dispatch({ type: 'UPDATE_DECISION_CRITERIA_ACTIVITY_STATUS', payload: { id: updatedCriteria.id, status: updatedCriteria.status } });
                    }
                }

                // Delete existing activities for this session
                await supabaseBrowser
                    .from('pov_session_activities')
                    .delete()
                    .eq('session_id', sessionId);

                // Insert new activities with their order
                if (sessionData.session_activities.length > 0) {
                    const { error: activitiesError } = await supabaseBrowser
                        .from('pov_session_activities')
                        .insert(
                            sessionData.session_activities.map((activity, index) => ({
                                session_id: sessionId,
                                decision_criteria_activity_id: activity.decision_criteria_activity_id,
                                activity: activity.activity,
                                status: activity.status,
                                notes: activity.notes,
                                display_order: index
                            }))
                        );

                    if (activitiesError) throw activitiesError;
                }

                // Add activity log for status change if we found a changed activity
                if (changedActivity && state.pov?.id) {
                    const activityName = changedActivity.activity || 
                        state.pov.decision_criteria?.find(dc => 
                            dc.activities?.some(a => a.id === changedActivity.decision_criteria_activity_id)
                        )?.activities?.find(a => a.id === changedActivity.decision_criteria_activity_id)?.activity || 
                        'Activity';

                    await addActivity(
                        state.pov.id,
                        'SESSION',
                        'Activity Status Updated',
                        `"${activityName}" marked as ${changedActivity.status.toLowerCase().replace('_', ' ')}`,
                        sessionId
                    );
                }
            }

            // Fetch the complete updated session with activities
            const { data: completeSession } = await supabaseBrowser
                .from('pov_working_sessions')
                .select(`
                    *,
                    session_activities:pov_session_activities(
                        id,
                        decision_criteria_activity_id,
                        activity,
                        status,
                        notes,
                        display_order
                    )
                `)
                .eq('id', sessionId)
                .single();

            if (completeSession) {
                dispatch({ type: 'UPDATE_WORKING_SESSION', payload: completeSession });
            }

            if (sessionData.pov_id) {
                await addActivity(
                    sessionData.pov_id,
                    'SESSION',
                    'Working Session Updated',
                    `"${sessionData.title || completeSession.title}" session ${sessionData.status === 'COMPLETED' ? 'completed' : 'updated'}`,
                    sessionId
                );
            }

            return completeSession;
        })(),
        {
            loading: 'Updating working session...',
            success: (session) => `Working session "${session.title}" updated successfully`,
            error: (err) => err.message || 'Failed to update working session'
        }
    );
  };

  const deleteWorkingSession = async (sessionId: string) => {
    return toast.promise(
        (async () => {
            const { error } = await supabaseBrowser
                .from('pov_working_sessions')
                .delete()
                .eq('id', sessionId);

            if (error) throw error;

            dispatch({ type: 'DELETE_WORKING_SESSION', payload: sessionId });
        })(),
        {
            loading: 'Deleting working session...',
            success: 'Working session deleted successfully',
            error: (err) => err.message || 'Failed to delete working session'
        }
    );
  };

  const deletePOV = async (povId: string) => {
    return toast.promise(
        (async () => {
            const { error } = await supabaseBrowser
                .from('pov')
                .delete()
                .eq('id', povId);

            if (error) throw error;

            dispatch({ type: 'DELETE_POV', payload: povId });
        })(),
        {
            loading: 'Deleting POV...',
            success: 'POV deleted successfully',
            error: (err) => err.message || 'Failed to delete POV'
        }
    );
  };

  const fetchPOV = async (povId: string) => {
    try {
      if (state.pov?.id === povId) {
        return state.pov;
      }

      const { data: pov, error } = await supabaseBrowser
        .from('pov')
        .select(`
          *,
          challenges:pov_challenges(
            *,
            categories:pov_challenge_categories(*),
            outcomes:pov_challenge_outcomes(*)
          ),
          key_business_services:pov_key_business_services(*),
          team_members:pov_team_members(*,
            team_member:team_members(*)
          ),
          device_scopes:pov_device_scopes(*),
          working_sessions:pov_working_sessions(
            *,
            session_activities:pov_session_activities(*)
          ),
          decision_criteria:pov_decision_criteria(
            *,
            categories:pov_decision_criteria_categories(*),
            activities:pov_decision_criteria_activities(*)
          ),
          comments:pov_comments(*),
          documents:pov_documents(*)
        `)
        .eq('id', povId)
        .single();

      if (error) {
        console.error('Error fetching POV:', error);
        return null;
      }

      // Then fetch activities separately
      const { data: activities } = await supabaseBrowser
        .from('pov_activities')
        .select('*')
        .eq('pov_id', povId)
        .order('created_at', { ascending: false });

      // Combine the data
      const povWithActivities = {
        ...pov,
        activities: activities || []
      };

      if (povWithActivities) {
        dispatch({ type: 'SET_POV', payload: povWithActivities });
      }

      return povWithActivities;
    } catch (error) {
      console.error('Error in fetchPOV:', error);
      return null;
    }
  };

  const deleteChallenge = async (challengeId: string) => {
    return toast.promise(
        (async () => {
            const { error } = await supabaseBrowser
                .from('pov_challenges')
                .delete()
                .eq('id', challengeId);

            if (error) throw error;

            dispatch({ type: 'DELETE_CHALLENGE', payload: challengeId });
        })(),
        {
            loading: 'Deleting challenge...',
            success: 'Challenge deleted successfully',
            error: (err) => err.message || 'Failed to delete challenge'
        }
    );
  };

  const deleteDecisionCriteria = async (criteriaId: string) => {
    return toast.promise(
        (async () => {
            // First check if any activities are used in sessions
            const { data: activities } = await supabaseBrowser
                .from('pov_decision_criteria_activities')
                .select('id')
                .eq('pov_decision_criteria_id', criteriaId);

            if (activities?.length) {
                const { data: usedActivities } = await supabaseBrowser
                    .from('pov_session_activities')
                    .select('decision_criteria_activity_id')
                    .in('decision_criteria_activity_id', activities.map(a => a.id));

                if (usedActivities?.length) {
                    throw new Error(
                        'This decision criteria contains activities that are being used in working sessions. ' +
                        'Please remove these activities from your working sessions before deleting.'
                    );
                }
            }

            // If no activities are used, proceed with deletion
            const { error } = await supabaseBrowser
                .from('pov_decision_criteria')
                .delete()
                .eq('id', criteriaId);

            if (error) throw error;

            dispatch({ type: 'DELETE_DECISION_CRITERIA', payload: criteriaId });
        })(),
        {
            loading: 'Deleting decision criteria...',
            success: 'Decision criteria deleted successfully',
            error: (err) => err.message || 'Failed to delete decision criteria'
        }
    );
  };

  const addDecisionCriteria = async (criteriaData: DecisionCriteriaWithRelations & {
    addToLibrary?: boolean;
  }) => {
    return toast.promise(
        (async () => {
            const { data: { user }, error: userError } = await supabaseBrowser.auth.getUser();
            if (userError || !user) throw new Error('Unauthorized');

            // Create POV decision criteria entry
            const { data: newCriteria, error: criteriaError } = await supabaseBrowser
                .from('pov_decision_criteria')
                .insert({
                    pov_id: criteriaData.pov_id,
                    title: criteriaData.title,
                    success_criteria: criteriaData.success_criteria,
                    use_case: criteriaData.use_case,
                    status: criteriaData.status || 'PENDING',
                    created_by: user.id,
                    created_at: new Date().toISOString()
                })
                .select('*')
                .single();

            if (criteriaError) throw criteriaError;
            if (!newCriteria) throw new Error('Failed to create decision criteria');

            // Add categories and activities
            await Promise.all([
                // Add categories
                criteriaData.categories?.length ?
                    supabaseBrowser
                        .from('pov_decision_criteria_categories')
                        .insert(
                            criteriaData.categories.map(category => ({
                                pov_decision_criteria_id: newCriteria.id,
                                category
                            }))
                        ) : Promise.resolve(),
                // Add activities
                criteriaData.activities?.length ?
                    supabaseBrowser
                        .from('pov_decision_criteria_activities')
                        .insert(
                            criteriaData.activities.map(activity => ({
                                pov_decision_criteria_id: newCriteria.id,
                                activity: activity.activity,
                                order_index: activity.order_index,
                                status: 'NOT_STARTED',  // Add default status
                                created_at: new Date().toISOString()  // Add created_at timestamp
                            }))
                        ) : Promise.resolve()
            ]);

            // Fetch complete criteria with relations
            const { data: completeCriteria } = await supabaseBrowser
                .from('pov_decision_criteria')
                .select(`
                    *,
                    categories:pov_decision_criteria_categories(*),
                    activities:pov_decision_criteria_activities(*)
                `)
                .eq('id', newCriteria.id)
                .single();

            if (completeCriteria) {
                dispatch({ type: 'ADD_DECISION_CRITERIA', payload: completeCriteria });

                // Add activity for new decision criteria
                if (!criteriaData.pov_id) throw new Error('POV ID is required');
                await addActivity(
                    criteriaData.pov_id,
                    'CRITERIA',
                    'Decision Criteria Added',
                    `"${criteriaData.title}" criteria created`,
                    completeCriteria.id
                );

                return completeCriteria;
            }

            throw new Error('Failed to fetch complete criteria');
        })(),
        {
            loading: 'Adding decision criteria...',
            success: (criteria) => `Decision criteria "${criteria.title}" added successfully`,
            error: (err) => err.message || 'Failed to add decision criteria'
        }
    );
  };

  const updateDecisionCriteria = async (criteriaId: string, criteriaData: DecisionCriteriaWithRelations) => {
    return toast.promise(
        (async () => {
            try {
                const { data: { user }, error: userError } = await supabaseBrowser.auth.getUser();
                if (userError || !user) throw new Error('Unauthorized');

                // First update the main criteria
                const { data: updatedCriteria, error } = await supabaseBrowser
                    .from('pov_decision_criteria')
                    .update({
                        title: criteriaData.title,
                        success_criteria: criteriaData.success_criteria,
                        use_case: criteriaData.use_case,
                        status: criteriaData.status
                    })
                    .eq('id', criteriaId)
                    .select('*')
                    .single();

                if (error) throw error;
                if (!updatedCriteria) throw new Error('Failed to update criteria');

                // Update categories
                await supabaseBrowser
                    .from('pov_decision_criteria_categories')
                    .delete()
                    .eq('pov_decision_criteria_id', criteriaId);

                if (criteriaData.categories?.length) {
                    await supabaseBrowser
                        .from('pov_decision_criteria_categories')
                        .insert(
                            criteriaData.categories.map(category => ({
                                pov_decision_criteria_id: criteriaId,
                                category
                            }))
                        );
                }

                // Handle activities update carefully
                if (criteriaData.activities?.length) {
                    // Get existing activities
                    const { data: existingActivities } = await supabaseBrowser
                        .from('pov_decision_criteria_activities')
                        .select('id, activity')
                        .eq('pov_decision_criteria_id', criteriaId);

                    // Get activities used in sessions
                    const { data: usedActivities } = await supabaseBrowser
                        .from('pov_session_activities')
                        .select('decision_criteria_activity_id')
                        .in('decision_criteria_activity_id', existingActivities?.map(a => a.id) || []);

                    const usedActivityIds = new Set(usedActivities?.map(a => a.decision_criteria_activity_id));

                    // Delete only activities that aren't used in any sessions
                    if (existingActivities) {
                        const unusedActivities = existingActivities.filter(a => !usedActivityIds.has(a.id));
                        if (unusedActivities.length > 0) {
                            await supabaseBrowser
                                .from('pov_decision_criteria_activities')
                                .delete()
                                .eq('pov_decision_criteria_id', criteriaId)
                                .in('id', unusedActivities.map(a => a.id));
                        }
                    }

                    // Insert or update activities
                    await supabaseBrowser
                        .from('pov_decision_criteria_activities')
                        .upsert(
                            criteriaData.activities.map(activity => ({
                                ...(activity.id ? { id: activity.id } : {}), // Only include id if it exists
                                pov_decision_criteria_id: criteriaId,
                                activity: activity.activity,
                                order_index: activity.order_index,
                                status: 'NOT_STARTED'
                            })),
                            {
                                onConflict: 'id',
                                ignoreDuplicates: false
                            }
                        );
                }

                // Fetch complete updated criteria
                const { data: completeCriteria } = await supabaseBrowser
                    .from('pov_decision_criteria')
                    .select(`
                        *,
                        categories:pov_decision_criteria_categories(*),
                        activities:pov_decision_criteria_activities(*)
                    `)
                    .eq('id', criteriaId)
                    .single();

                if (completeCriteria) {
                    dispatch({ type: 'UPDATE_DECISION_CRITERIA', payload: completeCriteria });

                    if (criteriaData.pov_id) {
                        await addActivity(
                            criteriaData.pov_id,
                            'CRITERIA',
                            'Decision Criteria Updated',
                            `"${criteriaData.title}" criteria ${criteriaData.status === 'MET' ? 'marked as complete' : 'updated'}`,
                            criteriaId
                        );
                    }

                    return completeCriteria;
                }

                throw new Error('Failed to fetch updated criteria');
            } catch (error) {
                console.error('Error updating decision criteria:', error);
                throw error;
            }
        })(),
        {
            loading: 'Updating decision criteria...',
            success: (criteria) => `Decision criteria "${criteria.title}" updated successfully`,
            error: (err) => err.message || 'Failed to update decision criteria'
        }
    );
  };

  const updatePOV = async (povId: string, data: Partial<POV>) => {
    return toast.promise(
        (async () => {
            const { data: updatedPOV, error } = await supabaseBrowser
                .from('pov')
                .update(data)
                .eq('id', povId)
                .select()
                .single();

            if (error) throw error;

            dispatch({ type: 'UPDATE_POV', payload: updatedPOV });

            await addActivity(
                povId,
                'STATUS',
                'POV Status Updated',
                `POV status updated to ${data.status || 'new status'}`,
                povId
            );

            return updatedPOV;
        })(),
        {
            loading: 'Updating POV...',
            success: 'POV updated successfully',
            error: (err) => err.message || 'Failed to update POV'
        }
    );
  };

  const fetchActivities = async (povId: string) => {
    const { data, error } = await supabaseBrowser
      .from('pov_activities')
      .select('*')
      .eq('pov_id', povId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    dispatch({ type: 'SET_ACTIVITIES', payload: data });
  };

  const addActivity = async (
    povId: string,
    type: POVActivity['type'],
    title: string,
    description: string,
    referenceId: string | null = null
  ) => {
    const { data: { user }, error: userError } = await supabaseBrowser.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    // Insert the new activity
    const { data: newActivity, error } = await supabaseBrowser
      .from('pov_activities')
      .insert({
        pov_id: povId,
        type,
        title,
        description,
        reference_id: referenceId,
        created_by: user.id,
        created_by_email: user.email || 'Unknown User'
      })
      .select('*')  // Get the created activity
      .single();

    if (error) throw error;
    if (!newActivity) throw new Error('Failed to create activity');

    // Add email to activity before dispatching
    dispatch({ 
      type: 'ADD_ACTIVITY', 
      payload: { ...newActivity } 
    });

    return newActivity;
  };

  const getStatusMessage = (status: string | undefined) => {
    if (!status) return 'updated';

    switch (status) {
      case 'COMPLETED':
        return 'marked as complete';
      case 'IN_PROGRESS':
        return 'marked as in progress';
      case 'UNABLE_TO_COMPLETE':
        return 'marked as unable to complete';
      case 'WAIVED':
        return 'marked as waived';
      case 'OPEN':
        return 'reset to open';
      default:
        return 'updated';
    }
  };

  const uploadDocument = async (file: File, description: string) => {
    return toast.promise(
        (async () => {
            if (!state.pov?.id) throw new Error('No active POV');
            const { data: { user }, error: userError } = await supabaseBrowser.auth.getUser();
            if (userError || !user) throw new Error('Unauthorized');

            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExt}`;
            const filePath = `${state.pov.id}/${fileName}`;

            // Upload file to storage
            const { error: uploadError } = await supabaseBrowser
                .storage
                .from('pov-documents')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Create document record
            const { data: document, error: dbError } = await supabaseBrowser
                .from('pov_documents')
                .insert({
                    pov_id: state.pov.id,
                    name: file.name,
                    description,
                    storage_path: filePath,
                    file_type: file.type,
                    file_size: file.size,
                    bucket_id: 'pov-documents',
                    created_by: user.id,
                    created_by_email: user.email
                })
                .select('*')
                .single();

            if (dbError) throw dbError;
            if (!document) throw new Error('Failed to create document record');

            dispatch({ type: 'ADD_DOCUMENT', payload: document });

            await addActivity(
                state.pov.id,
                'DOCUMENT',
                'Document Uploaded',
                `Uploaded document: ${document.name}`,
                document.id
            );

            return document;
        })(),
        {
            loading: 'Uploading document...',
            success: (doc) => `Document "${doc.name}" uploaded successfully`,
            error: (err) => err.message || 'Failed to upload document'
        }
    );
  };

  const deleteDocument = async (documentId: string) => {
    return toast.promise(
        (async () => {
            if (!state.pov?.id) throw new Error('No active POV');

            const doc = state.pov.documents?.find(d => d.id === documentId);
            if (!doc) throw new Error('Document not found');

            const { error: storageError } = await supabaseBrowser
                .storage
                .from(doc.bucket_id)
                .remove([doc.storage_path]);

            if (storageError) throw storageError;

            const { error: dbError } = await supabaseBrowser
                .from('pov_documents')
                .delete()
                .eq('id', doc.id);

            if (dbError) throw dbError;

            dispatch({ type: 'DELETE_DOCUMENT', payload: documentId });

            await addActivity(
                state.pov.id,
                'DOCUMENT',
                'Document Deleted',
                `Deleted document: ${doc.name}`,
                doc.id
            );
        })(),
        {
            loading: 'Deleting document...',
            success: 'Document deleted successfully',
            error: (err) => err.message || 'Failed to delete document'
        }
    );
  };

  const downloadDocument = async (documentId: string) => {
    return toast.promise(
        (async () => {
            if (!state.pov?.id) throw new Error('No active POV');

            const doc = state.pov.documents?.find(d => d.id === documentId);
            if (!doc) throw new Error('Document not found');

            const { data, error } = await supabaseBrowser
                .storage
                .from(doc.bucket_id)
                .download(doc.storage_path);

            if (error) throw error;

            return { data, document: doc };
        })(),
        {
            loading: 'Downloading document...',
            success: (result) => `Document "${result.document.name}" download started`,
            error: (err) => err.message || 'Failed to download document'
        }
    );
  };

  const addComment = async (content: string) => {
    return toast.promise(
        (async () => {
            if (!state.pov?.id) throw new Error('No active POV');

            const { data: { user }, error: userError } = await supabaseBrowser.auth.getUser();
            if (userError || !user) throw new Error('Unauthorized');

            const { data: comment, error } = await supabaseBrowser
                .from('pov_comments')
                .insert({
                    pov_id: state.pov.id,
                    content,
                    created_by: user.id,
                    created_by_email: user.email
                })
                .select('*')
                .single();

            if (error) throw error;
            if (!comment) throw new Error('Failed to create comment');

            dispatch({ type: 'ADD_COMMENT', payload: comment });

            await addActivity(
                state.pov.id,
                'COMMENT',
                'Comment Added',
                `Added a new comment`,
                comment.id
            );

            return comment;
        })(),
        {
            loading: 'Adding comment...',
            success: 'Comment added successfully',
            error: (err) => err.message || 'Failed to add comment'
        }
    );
  };

  const updateComment = async (commentId: string, content: string) => {
    return toast.promise(
        (async () => {
            if (!state.pov?.id) throw new Error('No active POV');

            const { data: comment, error } = await supabaseBrowser
                .from('pov_comments')
                .update({ 
                    content, 
                    updated_at: new Date().toISOString() 
                })
                .eq('id', commentId)
                .select('*')
                .single();

            if (error) throw error;
            if (!comment) throw new Error('Failed to update comment');

            dispatch({ type: 'UPDATE_COMMENT', payload: comment });

            await addActivity(
                state.pov.id,
                'COMMENT',
                'Comment Updated',
                `Updated a comment`,
                comment.id
            );

            return comment;
        })(),
        {
            loading: 'Updating comment...',
            success: 'Comment updated successfully',
            error: (err) => err.message || 'Failed to update comment'
        }
    );
  };

  const deleteComment = async (commentId: string) => {
    return toast.promise(
        (async () => {
            if (!state.pov?.id) throw new Error('No active POV');
            
            const comment = state.pov.comments?.find(c => c.id === commentId);
            
            const { error } = await supabaseBrowser
                .from('pov_comments')
                .delete()
                .eq('id', commentId);

            if (error) throw error;

            dispatch({ type: 'DELETE_COMMENT', payload: commentId });
            
            if (comment) {
                await addActivity(
                    state.pov.id,
                    'COMMENT',
                    'Comment Deleted',
                    `Deleted a comment`,
                    commentId
                );
            }
        })(),
        {
            loading: 'Deleting comment...',
            success: 'Comment deleted successfully',
            error: (err) => err.message || 'Failed to delete comment'
        }
    );
  };

  const updateDeviceStatus = async (deviceId: string, status: DeviceScope['status']) => {
    return toast.promise(
        (async () => {
            if (!state.pov?.id) throw new Error('No active POV');

            const { data, error } = await supabaseBrowser
                .from('pov_device_scopes')
                .update({ status })
                .eq('id', deviceId)
                .select()
                .single();

            if (error) throw error;

            dispatch({
                type: 'UPDATE_DEVICE_STATUS',
                payload: { deviceId, status }
            });

            await addActivity(
                state.pov.id,
                'STATUS',
                'Device Status Updated',
                `Device status updated to ${status.replace(/_/g, ' ')}`,
                deviceId
            );

            return data;
        })(),
        {
            loading: 'Updating device status...',
            success: (data) => `Device status updated to ${status.toLowerCase().replace('_', ' ')}`,
            error: (err) => err.message || 'Failed to update device status'
        }
    );
  };

  const updatePOVStatus = async (povId: string, status: POV['status']) => {
    return toast.promise(
        (async () => {
            const { data: updatedPOV, error } = await supabaseBrowser
                .from('pov')
                .update({ 
                    status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', povId)
                .select()
                .single();

            if (error) throw error;

            // Update the local state with the complete POV data
            if (updatedPOV) {
                dispatch({ type: 'UPDATE_POV_STATUS', payload: updatedPOV.status });
            }

            await addActivity(
                povId,
                'STATUS',
                'POV Status Updated',
                `POV status updated to ${status}`,
                povId
            );

            return updatedPOV;
        })(),
        {
            loading: 'Updating POV status...',
            success: (pov) => `POV status updated to ${status.toLowerCase()}`,
            error: (err) => err.message || 'Failed to update POV status'
        }
    );
  };

  const updateDecisionCriteriaStatus = async (criteriaId: string, status: POVDecisionCriteria['status']) => {
    return toast.promise(
      (async () => {
        const { data: updatedCriteria, error } = await supabaseBrowser
          .from('pov_decision_criteria')
          .update({ status })
          .eq('id', criteriaId)
          .select('*')
          .single();

        if (error) throw error;
        if (!updatedCriteria) throw new Error('Failed to update criteria status');

        dispatch({ 
          type: 'UPDATE_DECISION_CRITERIA_STATUS', 
          payload: { id: criteriaId, status } 
        });

        if (!state.pov?.id) throw new Error('POV ID is required');
        await addActivity(
          state.pov.id,
          'CRITERIA',
          'Decision Criteria Updated',
          `Decision criteria status updated to ${status.toLowerCase()}`,
          criteriaId
        );

        return updatedCriteria;
      })(),
      {
        loading: 'Updating decision criteria status...',
        success: 'Status updated successfully',
        error: (err) => err.message || 'Failed to update status'
      }
    );
  };

  return {
    createPOV,
    addChallenge,
    updateChallenge,
    addBusinessService,
    updateBusinessService,
    deleteBusinessService,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    addDeviceScope,
    updateDeviceScope,
    deleteDeviceScope,
    addWorkingSession,
    updateWorkingSession,
    deleteWorkingSession,
    deletePOV,
    fetchPOV,
    deleteChallenge,
    deleteDecisionCriteria,
    addDecisionCriteria,
    updateDecisionCriteria,
    updatePOV,
    fetchActivities,
    addActivity,
    uploadDocument,
    deleteDocument,
    downloadDocument,
    addComment,
    updateComment,
    deleteComment,
    updateDeviceStatus,
    updatePOVStatus,
    updateDecisionCriteriaStatus,
  };
} 