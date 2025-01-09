'use client'

import { usePOV } from '@/app/contexts/POVContext';
import { supabaseBrowser } from '@/app/lib/supabase/client';
import { POV, POVChallenge, KeyBusinessService, TeamMember, DeviceScope, WorkingSession } from '@/app/types/pov';
import { devLog } from '../components/Shared/utils/debug';

interface TeamMemberWithPOV extends Partial<TeamMember> {
  pov_id?: string;
}

export function usePOVOperations() {
  const { dispatch, state } = usePOV();

  const createPOV = async (data: Partial<POV>): Promise<POV> => {
    const { data: { user }, error: userError } = await supabaseBrowser.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

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

    dispatch({ type: 'SET_POV', payload: newPov });
    
    return newPov;
  };

  const createTemplateChallenge = async (challengeData: Partial<POVChallenge>) => {
    const { data: { user }, error: userError } = await supabaseBrowser.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    // First create the challenge template
    const { data: newChallenge, error: challengeError } = await supabaseBrowser
      .from('challenges')
      .insert({
        title: challengeData.title,
        challenge_description: challengeData.challenge_description,
        business_impact: challengeData.business_impact,
        example: challengeData.example || '',
        status: 'APPROVED',
        created_by: user.id,
        created_at: new Date().toISOString(),
        is_template: true,
        metadata: {}
      })
      .select('*')
      .single();

    if (challengeError) throw challengeError;
    if (!newChallenge) throw new Error('Failed to create challenge template');

    // Then create the POV challenge instance
    const { data: povChallenge, error: povChallengeError } = await supabaseBrowser
      .from('pov_challenges')
      .insert({
        pov_id: challengeData.pov_id,
        title: challengeData.title,
        challenge_description: challengeData.challenge_description,
        business_impact: challengeData.business_impact,
        status: challengeData.status,
        created_by: user.id,
        created_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (povChallengeError) throw povChallengeError;
    
    dispatch({ type: 'ADD_CHALLENGE', payload: povChallenge });
    return povChallenge;
  };

  const addChallenge = async (challengeData: Partial<POVChallenge> & { saveAsTemplate?: boolean }) => {
    if (challengeData.saveAsTemplate) {
      return createTemplateChallenge(challengeData);
    }

    // Regular POV challenge creation
    const { data: { user }, error: userError } = await supabaseBrowser.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    const { data: newChallenge, error } = await supabaseBrowser
      .from('pov_challenges')
      .insert({
        pov_id: challengeData.pov_id,
        title: challengeData.title,
        challenge_description: challengeData.challenge_description,
        business_impact: challengeData.business_impact,
        status: challengeData.status,
        created_by: user.id,
        created_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) throw error;
    if (!newChallenge) throw new Error('Failed to create challenge');

    dispatch({ type: 'ADD_CHALLENGE', payload: newChallenge });
    return newChallenge;
  };

  const updateChallenge = async (challengeId: string, challengeData: Partial<POVChallenge>) => {
    const { data: updatedChallenge, error } = await supabaseBrowser
      .from('pov_challenges')
      .update(challengeData)
      .eq('id', challengeId)
      .select('*')
      .single();

    if (error) throw error;
    if (!updatedChallenge) throw new Error('Failed to update challenge');

    dispatch({ type: 'UPDATE_CHALLENGE', payload: updatedChallenge });
    return updatedChallenge;
  };

  const addBusinessService = async (serviceData: Partial<KeyBusinessService>) => {
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
    return newService;
  };

  const updateBusinessService = async (serviceId: string, serviceData: Partial<KeyBusinessService>) => {
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
  };

  const deleteBusinessService = async (serviceId: string) => {
    const { error } = await supabaseBrowser
      .from('pov_key_business_services')
      .delete()
      .eq('id', serviceId);

    if (error) throw error;

    dispatch({ type: 'DELETE_BUSINESS_SERVICE', payload: serviceId });
  };

  const addTeamMember = async (memberData: TeamMemberWithPOV) => {
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
        created_at: new Date().toISOString(),
      }, {
        onConflict: 'pov_id,team_member_id',
        ignoreDuplicates: true, // Skip if relationship already exists
      });

    if (povMemberError) throw povMemberError;

    dispatch({ type: 'ADD_TEAM_MEMBER', payload: newMember });
    return newMember;
  };

  const updateTeamMember = async (memberId: string, memberData: TeamMemberWithPOV) => {
    const { data: updatedMember, error } = await supabaseBrowser
      .from('pov_team_members')
      .update(memberData)
      .eq('id', memberId)
      .select('*')
      .single();

    if (error) throw error;
    if (!updatedMember) throw new Error('Failed to update team member');

    dispatch({ type: 'UPDATE_TEAM_MEMBER', payload: updatedMember });
    return updatedMember;
  };

  const deleteTeamMember = async (memberId: string) => {
    // Only delete the junction table entry for this specific POV
    const { error: junctionError } = await supabaseBrowser
      .from('pov_team_members')
      .delete()
      .eq('team_member_id', memberId)
      .eq('pov_id', state.pov?.id); // Add POV ID constraint

    if (junctionError) throw junctionError;

    // Remove from state but don't delete the actual team member record
    dispatch({ type: 'DELETE_TEAM_MEMBER', payload: memberId });
  };

  const addDeviceScope = async (deviceData: Partial<DeviceScope>) => {
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
    return newDevice;
  };

  const updateDeviceScope = async (deviceId: string, deviceData: Partial<DeviceScope>) => {
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
  };

  const deleteDeviceScope = async (deviceId: string) => {
    const { error } = await supabaseBrowser
      .from('pov_device_scopes')
      .delete()
      .eq('id', deviceId);

    if (error) throw error;

    dispatch({ type: 'DELETE_DEVICE_SCOPE', payload: deviceId });
  };

  const addWorkingSession = async (sessionData: Partial<WorkingSession>) => {
    const { data: { user }, error: userError } = await supabaseBrowser.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    const { data: newSession, error } = await supabaseBrowser
      .from('pov_working_sessions')
      .insert({
        ...sessionData,
        created_by: user.id,
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) throw error;
    if (!newSession) throw new Error('Failed to create working session');

    dispatch({ type: 'ADD_WORKING_SESSION', payload: newSession });
    return newSession;
  };

  const updateWorkingSession = async (sessionId: string, sessionData: Partial<WorkingSession>) => {
    const { data: updatedSession, error } = await supabaseBrowser
      .from('pov_working_sessions')
      .update(sessionData)
      .eq('id', sessionId)
      .select('*')
      .single();

    if (error) throw error;
    if (!updatedSession) throw new Error('Failed to update working session');

    dispatch({ type: 'UPDATE_WORKING_SESSION', payload: updatedSession });
    return updatedSession;
  };

  const deleteWorkingSession = async (sessionId: string) => {
    const { error } = await supabaseBrowser
      .from('pov_working_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;

    dispatch({ type: 'DELETE_WORKING_SESSION', payload: sessionId });
  };

  const deletePOV = async (povId: string) => {
    const { error } = await supabaseBrowser
      .from('pov')
      .delete()
      .eq('id', povId);

    if (error) throw error;

    dispatch({ type: 'DELETE_POV', payload: povId });
  };

  const fetchPOV = async (povId: string) => {
    const { data: pov, error } = await supabaseBrowser
      .from('pov')
      .select(`
        *,
        challenges:pov_challenges(
          *,
          template:challenge_id(*),
          categories:pov_challenge_categories(*),
          outcomes:pov_challenge_outcomes(*)
        ),
        key_business_services:pov_key_business_services(*),
        team_members:pov_team_members(
          team_member:team_members(*)
        ),
        device_scopes:pov_device_scopes(*),
        working_sessions:pov_working_sessions(*),
        decision_criteria:pov_decision_criteria(
          *,
          activities:pov_decision_criteria_activities(*)
        )
      `)
      .eq('id', povId)
      .single();

    if (error) {
      console.error('Error fetching POV:', error);
      return null;
    }

    if (pov) {
      // Transform team members data structure
      const transformedPov = {
        ...pov,
        team_members: (pov.team_members || [])
          .map((tm: any) => tm.team_member)
          .filter(Boolean)
      };
      
      dispatch({ type: 'SET_POV', payload: transformedPov });
    }

    return pov;
  };

  const deleteChallenge = async (challengeId: string) => {
    if (!challengeId) return;

    try {
      // Delete from supabase
      const { error } = await supabaseBrowser
        .from('pov_challenges')
        .delete()
        .eq('id', challengeId);

      if (error) throw error;

      // Update local state
      dispatch({ 
        type: 'DELETE_CHALLENGE', 
        payload: challengeId 
      });

    } catch (error) {
      console.error('Error deleting challenge:', error);
      throw error;
    }
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
  };
} 