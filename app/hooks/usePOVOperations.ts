'use client'

import { usePOV } from '@/app/contexts/POVContext';
import { supabaseBrowser } from '@/app/lib/supabase/client';
import { POV, POVChallenge, KeyBusinessService } from '@/app/types/pov';

export function usePOVOperations() {
  const { dispatch } = usePOV();

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
      console.error('Supabase error:', error);
      throw new Error(error.message);
    }
    
    if (!newPov) {
      throw new Error('Failed to create POV: No data returned');
    }

    dispatch({ type: 'SET_POV', payload: newPov });
    
    return newPov;
  };

  const addChallenge = async (challengeData: Partial<POVChallenge>) => {
    // Implementation
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

  // Add other operations...

  return {
    createPOV,
    addChallenge,
    addBusinessService,
    updateBusinessService,
    deleteBusinessService,
  };
} 