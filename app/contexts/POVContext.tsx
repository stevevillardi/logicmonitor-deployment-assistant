'use client'

import { createContext, useContext, useReducer, ReactNode } from 'react';
import { POV, POVChallenge, KeyBusinessService, TeamMember, DeviceScope, WorkingSession, POVDecisionCriteria, POVActivity, POVTeamMemberWithDetails, POVDocument, POVComment } from '@/app/types/pov';
import { devLog } from '../components/Shared/utils/debug';

interface POVState {
  pov: POV | null;
  povs: POV[] | null;
  loading: boolean;
  error: string | null;
}

type POVAction = 
  | { type: 'SET_POV'; payload: POV | null }
  | { type: 'DELETE_POV'; payload: string }
  | { type: 'SET_POVS'; payload: POV[] | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  
  | { type: 'SET_BUSINESS_SERVICES'; payload: KeyBusinessService[] }
  | { type: 'SET_TEAM_MEMBERS'; payload: POVTeamMemberWithDetails[] }
  | { type: 'SET_DEVICE_SCOPES'; payload: DeviceScope[] }
  | { type: 'SET_WORKING_SESSIONS'; payload: WorkingSession[] }
  | { type: 'SET_CHALLENGES'; payload: POVChallenge[] }
  | { type: 'SET_DECISION_CRITERIA'; payload: POVDecisionCriteria[] }
  | { type: 'SET_ACTIVITIES'; payload: POVActivity[] }

  | { type: 'ADD_BUSINESS_SERVICE'; payload: KeyBusinessService }
  | { type: 'ADD_TEAM_MEMBER'; payload: POVTeamMemberWithDetails }
  | { type: 'ADD_DEVICE_SCOPE'; payload: DeviceScope }
  | { type: 'ADD_WORKING_SESSION'; payload: WorkingSession }
  | { type: 'ADD_CHALLENGE'; payload: POVChallenge }
  | { type: 'ADD_DECISION_CRITERIA'; payload: POVDecisionCriteria }
  | { type: 'ADD_ACTIVITY'; payload: POVActivity }
  
  | { type: 'UPDATE_BUSINESS_SERVICE'; payload: KeyBusinessService }
  | { type: 'UPDATE_TEAM_MEMBER'; payload: POVTeamMemberWithDetails }
  | { type: 'UPDATE_DEVICE_SCOPE'; payload: DeviceScope }
  | { type: 'UPDATE_WORKING_SESSION'; payload: WorkingSession }
  | { type: 'UPDATE_CHALLENGE'; payload: POVChallenge }
  | { type: 'UPDATE_DECISION_CRITERIA'; payload: POVDecisionCriteria }
  
  | { type: 'DELETE_BUSINESS_SERVICE'; payload: string }
  | { type: 'DELETE_TEAM_MEMBER'; payload: string }
  | { type: 'DELETE_DEVICE_SCOPE'; payload: string }
  | { type: 'DELETE_WORKING_SESSION'; payload: string }
  | { type: 'DELETE_CHALLENGE'; payload: string }
  | { type: 'DELETE_DECISION_CRITERIA'; payload: string }
  | { type: 'UPDATE_POV'; payload: POV }
  | { type: 'UPDATE_POV_IN_LIST'; payload: { id: string; updates: Partial<POV> } }
  | { type: 'ADD_DOCUMENT'; payload: POVDocument }
  | { type: 'DELETE_DOCUMENT'; payload: string }
  | { type: 'ADD_COMMENT'; payload: POVComment }
  | { type: 'UPDATE_COMMENT'; payload: POVComment }
  | { type: 'DELETE_COMMENT'; payload: string }
  | { type: 'UPDATE_DEVICE_STATUS'; payload: { deviceId: string; status: DeviceScope['status'] } }


const POVContext = createContext<{
  state: POVState;
  dispatch: React.Dispatch<POVAction>;
} | undefined>(undefined);

const initialState: POVState = {
  pov: null,
  povs: null,
  loading: false,
  error: null,
};

function povReducer(state: POVState, action: POVAction): POVState {
  switch (action.type) {
    // POV management
    case 'SET_POV':
      return {
        ...state,
        pov: action.payload ? {
          ...action.payload,
          comments: action.payload.comments || [],
          documents: action.payload.documents || [],
          activities: action.payload.activities || [],
        } : null
      };
    case 'SET_POVS':
      return { ...state, povs: action.payload };
    case 'DELETE_POV':
      return { ...state, pov: null };

    // App state
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CHALLENGES':
      return {
        ...state,
        pov: state.pov ? {
          ...state.pov,
          challenges: action.payload
        } : null
      };

    // SET operations
    case 'SET_BUSINESS_SERVICES':
      return {
        ...state,
        pov: state.pov ? {
          ...state.pov,
          key_business_services: action.payload
        } : null
      };
    case 'SET_TEAM_MEMBERS':
      return {
        ...state,
        pov: state.pov ? {
          ...state.pov,
          team_members: action.payload
        } : null
      };
    case 'SET_DEVICE_SCOPES':
      return {
        ...state,
        pov: state.pov ? {
          ...state.pov,
          device_scopes: action.payload
        } : null
      };
    case 'SET_WORKING_SESSIONS':
      return {
        ...state,
        pov: state.pov ? {
          ...state.pov,
          working_sessions: action.payload
        } : null
      };

    // ADD operations
    case 'ADD_CHALLENGE':
      return {
        ...state,
        pov: state.pov ? {
          ...state.pov,
          challenges: [...(state.pov.challenges || []), {
            ...action.payload,
            categories: action.payload.categories || [],
            outcomes: action.payload.outcomes || []
          }]
        } : null
      };
    case 'ADD_BUSINESS_SERVICE':
      return {
        ...state,
        pov: state.pov ? {
          ...state.pov,
          key_business_services: [...(state.pov.key_business_services || []), action.payload]
        } : null
      };
    case 'ADD_TEAM_MEMBER':
      return {
        ...state,
        pov: state.pov ? {
          ...state.pov,
          team_members: [...(state.pov.team_members || []), action.payload]
        } : null
      };
    case 'ADD_DEVICE_SCOPE':
      return {
        ...state,
        pov: state.pov ? {
          ...state.pov,
          device_scopes: [...(state.pov.device_scopes || []), action.payload]
        } : null
      };
    case 'ADD_WORKING_SESSION':
      return {
        ...state,
        pov: state.pov ? {
          ...state.pov,
          working_sessions: [...(state.pov.working_sessions || []), action.payload]
        } : null
      };

    // UPDATE operations
    case 'UPDATE_BUSINESS_SERVICE':
      return {
        ...state,
        pov: state.pov ? {
          ...state.pov,
          key_business_services: state.pov.key_business_services?.map((service) =>
            service.id === action.payload.id ? action.payload : service
          ) || []
        } : null
      };
    case 'UPDATE_TEAM_MEMBER':
      return {
        ...state,
        pov: state.pov ? {
          ...state.pov,
          team_members: state.pov.team_members?.map((member) =>
            member.id === action.payload.id ? action.payload : member
          ) || []
        } : null
      };
    case 'UPDATE_DEVICE_SCOPE':
      return {
        ...state,
        pov: state.pov ? {
          ...state.pov,
          device_scopes: state.pov.device_scopes?.map((device) =>
            device.id === action.payload.id ? action.payload : device
          ) || []
        } : null
      };
    case 'UPDATE_WORKING_SESSION':
      return {
        ...state,
        pov: state.pov ? {
          ...state.pov,
          working_sessions: state.pov.working_sessions?.map((session) =>
            session.id === action.payload.id ? action.payload : session
          ) || []
        } : null
      };
    case 'UPDATE_CHALLENGE':
      return {
        ...state,
        pov: state.pov ? {
          ...state.pov,
          challenges: state.pov.challenges?.map((challenge) =>
            challenge.id === action.payload.id ? {
              ...action.payload,
              categories: action.payload.categories || challenge.categories || [],
              outcomes: action.payload.outcomes || challenge.outcomes || []
            } : challenge
          ) || []
        } : null
      };

    // DELETE operations
    case 'DELETE_BUSINESS_SERVICE':
      return {
        ...state,
        pov: state.pov ? {
          ...state.pov,
          key_business_services: state.pov.key_business_services?.filter(
            (service) => service.id !== action.payload
          ) || []
        } : null
      };
    case 'DELETE_TEAM_MEMBER':
      return {
        ...state,
        pov: state.pov ? {
          ...state.pov,
          team_members: state.pov.team_members?.filter(
            (member) => member.id !== action.payload
          ) || []
        } : null
      };
    case 'DELETE_DEVICE_SCOPE':
      return {
        ...state,
        pov: state.pov ? {
          ...state.pov,
          device_scopes: state.pov.device_scopes?.filter(
            (device) => device.id !== action.payload
          ) || []
        } : null
      };
    case 'DELETE_WORKING_SESSION':
      return {
        ...state,
        pov: state.pov ? {
          ...state.pov,
          working_sessions: state.pov.working_sessions?.filter(
            (session) => session.id !== action.payload
          ) || []
        } : null
      };
    case 'DELETE_CHALLENGE':
      if (!state.pov) return state;
      return {
        ...state,
        pov: {
          ...state.pov,
          challenges: state.pov.challenges?.filter(
            challenge => challenge.id !== action.payload
          ) || []
        }
      };
    case 'DELETE_DECISION_CRITERIA':
      return {
        ...state,
        pov: state.pov ? {
          ...state.pov,
          decision_criteria: state.pov.decision_criteria?.filter(
            criteria => criteria.id !== action.payload
          ) || []
        } : null
      };

    case 'ADD_DECISION_CRITERIA':
      return {
        ...state,
        pov: state.pov ? {
          ...state.pov,
          decision_criteria: [...(state.pov.decision_criteria || []), {
            ...action.payload,
            categories: action.payload.categories || [],
            activities: action.payload.activities || []
          }]
        } : null
      };

    case 'UPDATE_DECISION_CRITERIA':
      return {
        ...state,
        pov: state.pov ? {
          ...state.pov,
          decision_criteria: state.pov.decision_criteria?.map((criteria) =>
            criteria.id === action.payload.id ? {
              ...action.payload,
              categories: action.payload.categories || criteria.categories || [],
              activities: action.payload.activities || criteria.activities || []
            } : criteria
          ) || []
        } : null
      };

    case 'UPDATE_POV':
      return {
        ...state,
        pov: action.payload,
      };

    case 'UPDATE_POV_IN_LIST':
      return {
        ...state,
        povs: state.povs ? state.povs.map(p => 
          p.id === action.payload.id 
            ? { ...p, ...action.payload.updates }
            : p
        ) : null
      };

    case 'SET_ACTIVITIES':
      return {
        ...state,
        pov: state.pov ? {
          ...state.pov,
          activities: action.payload
        } : null
      };

    case 'ADD_ACTIVITY':
      return {
        ...state,
        pov: state.pov ? {
          ...state.pov,
          activities: [action.payload, ...(state.pov.activities || [])]
        } : null
      };

    case 'ADD_DOCUMENT':
      if (!state.pov) return state;
      return {
        ...state,
        pov: {
          ...state.pov,
          documents: [...(state.pov.documents || []), action.payload]
        }
      };

    case 'DELETE_DOCUMENT':
      if (!state.pov) return state;
      return {
        ...state,
        pov: {
          ...state.pov,
          documents: state.pov.documents?.filter(d => d.id !== action.payload) || []
        }
      };

    case 'ADD_COMMENT':
      return {
        ...state,
        pov: state.pov ? {
          ...state.pov,
          comments: [
            action.payload,
            ...(state.pov.comments || [])
          ]
        } : null
      };

    case 'UPDATE_COMMENT':
      return {
        ...state,
        pov: state.pov ? {
          ...state.pov,
          comments: state.pov.comments?.map(comment => 
            comment.id === action.payload.id ? action.payload : comment
          ) || []
        } : null
      };

    case 'DELETE_COMMENT':
      return {
        ...state,
        pov: state.pov ? {
          ...state.pov,
          comments: state.pov.comments?.filter(comment => 
            comment.id !== action.payload
          ) || []
        } : null
      };

    case 'UPDATE_DEVICE_STATUS':
      if (!state.pov) return state;
      
      return {
        ...state,
        pov: {
          ...state.pov,
          device_scopes: state.pov.device_scopes?.map(device => 
            device.id === action.payload.deviceId
              ? { ...device, status: action.payload.status }
              : device
          )
        }
      };

    default:
      return state;
  }
}

export function POVProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(povReducer, initialState);
  return (
    <POVContext.Provider value={{ state, dispatch }}>
      {children}
    </POVContext.Provider>
  );
}

export function usePOV() {
  const context = useContext(POVContext);
  if (context === undefined) {
    throw new Error('usePOV must be used within a POVProvider');
  }
  return context;
} 