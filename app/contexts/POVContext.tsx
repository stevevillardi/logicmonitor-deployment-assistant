'use client'

import { createContext, useContext, useReducer, ReactNode } from 'react';
import { POV, POVChallenge, KeyBusinessService, TeamMember, DeviceScope, WorkingSession } from '@/app/types/pov';
import { devLog } from '../components/Shared/utils/debug';

interface POVState {
  pov: POV | null;
  povs: POV[];
  challenges: POVChallenge[];
  keyBusinessServices: KeyBusinessService[];
  teamMembers: TeamMember[];
  deviceScopes: DeviceScope[];
  workingSessions: WorkingSession[];
  loading: boolean;
  error: string | null;
}

type POVAction = 
  | { type: 'SET_POV'; payload: POV }
  | { type: 'SET_CHALLENGES'; payload: POVChallenge[] }
  | { type: 'ADD_CHALLENGE'; payload: POVChallenge }
  | { type: 'SET_BUSINESS_SERVICES'; payload: KeyBusinessService[] }
  | { type: 'ADD_BUSINESS_SERVICE'; payload: KeyBusinessService }
  | { type: 'SET_TEAM_MEMBERS'; payload: TeamMember[] }
  | { type: 'SET_DEVICE_SCOPES'; payload: DeviceScope[] }
  | { type: 'SET_WORKING_SESSIONS'; payload: WorkingSession[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_POVS'; payload: POV[] }
  | { type: 'UPDATE_BUSINESS_SERVICE'; payload: KeyBusinessService }
  | { type: 'DELETE_BUSINESS_SERVICE'; payload: string }
  | { type: 'ADD_TEAM_MEMBER'; payload: TeamMember }
  | { type: 'UPDATE_TEAM_MEMBER'; payload: TeamMember }
  | { type: 'DELETE_TEAM_MEMBER'; payload: string }
  | { type: 'ADD_DEVICE_SCOPE'; payload: DeviceScope }
  | { type: 'UPDATE_DEVICE_SCOPE'; payload: DeviceScope }
  | { type: 'DELETE_DEVICE_SCOPE'; payload: string }
  | { type: 'ADD_WORKING_SESSION'; payload: WorkingSession }
  | { type: 'UPDATE_WORKING_SESSION'; payload: WorkingSession }
  | { type: 'DELETE_WORKING_SESSION'; payload: string }
  | { type: 'DELETE_POV'; payload: string };

const POVContext = createContext<{
  state: POVState;
  dispatch: React.Dispatch<POVAction>;
} | undefined>(undefined);

const initialState: POVState = {
  pov: null,
  povs: [],
  challenges: [],
  keyBusinessServices: [],
  teamMembers: [],
  deviceScopes: [],
  workingSessions: [],
  loading: false,
  error: null,
};

function povReducer(state: POVState, action: POVAction): POVState {
  switch (action.type) {
    case 'SET_POV':
      return { 
        ...state, 
        pov: action.payload,
        keyBusinessServices: action.payload?.key_business_services || [] 
      };
    case 'SET_CHALLENGES':
      return { ...state, challenges: action.payload };
    case 'ADD_CHALLENGE':
      return { ...state, challenges: [...state.challenges, action.payload] };
    case 'SET_POVS':
      return { ...state, povs: action.payload };
    case 'ADD_BUSINESS_SERVICE':
      return {
        ...state,
        keyBusinessServices: [...state.keyBusinessServices, action.payload],
        pov: state.pov ? {
          ...state.pov,
          key_business_services: [...(state.pov.key_business_services || []), action.payload]
        } : state.pov
      };
    case 'UPDATE_BUSINESS_SERVICE':
      return {
        ...state,
        keyBusinessServices: state.keyBusinessServices.map((service) =>
          service.id === action.payload.id ? action.payload : service
        ),
        pov: state.pov ? {
          ...state.pov,
          key_business_services: state.pov.key_business_services?.map((service) =>
            service.id === action.payload.id ? action.payload : service
          ) || []
        } : state.pov
      };
    case 'DELETE_BUSINESS_SERVICE':
      return {
        ...state,
        keyBusinessServices: state.keyBusinessServices.filter(
          (service) => service.id !== action.payload
        ),
        pov: state.pov ? {
          ...state.pov,
          key_business_services: state.pov.key_business_services?.filter(
            (service) => service.id !== action.payload
          ) || []
        } : state.pov
      };
    case 'ADD_TEAM_MEMBER':
      return {
        ...state,
        teamMembers: [...state.teamMembers, action.payload],
        pov: state.pov ? {
          ...state.pov,
          team_members: [...(state.pov.team_members || []), action.payload]
        } : state.pov
      };
    case 'UPDATE_TEAM_MEMBER':
      return {
        ...state,
        teamMembers: state.teamMembers.map((member) =>
          member.id === action.payload.id ? action.payload : member
        ),
        pov: state.pov ? {
          ...state.pov,
          team_members: state.pov.team_members?.map((member) =>
            member.id === action.payload.id ? action.payload : member
          ) || []
        } : state.pov
      };
    case 'DELETE_TEAM_MEMBER':
      return {
        ...state,
        teamMembers: state.teamMembers.filter(
          (member) => member.id !== action.payload
        ),
        pov: state.pov ? {
          ...state.pov,
          team_members: state.pov.team_members?.filter(
            (member) => member.id !== action.payload
          ) || []
        } : state.pov
      };
    case 'SET_TEAM_MEMBERS':
      devLog('Setting team members:', action.payload);
      return { ...state, teamMembers: action.payload };
    case 'SET_DEVICE_SCOPES':
      return { ...state, deviceScopes: action.payload };
    case 'ADD_DEVICE_SCOPE':
      return {
        ...state,
        deviceScopes: [...state.deviceScopes, action.payload],
        pov: state.pov ? {
          ...state.pov,
          device_scopes: [...(state.pov.device_scopes || []), action.payload]
        } : state.pov
      };
    case 'UPDATE_DEVICE_SCOPE':
      return {
        ...state,
        deviceScopes: state.deviceScopes.map((device) =>
          device.id === action.payload.id ? action.payload : device
        ),
        pov: state.pov ? {
          ...state.pov,
          device_scopes: state.pov.device_scopes?.map((device) =>
            device.id === action.payload.id ? action.payload : device
          ) || []
        } : state.pov
      };
    case 'DELETE_DEVICE_SCOPE':
      return {
        ...state,
        deviceScopes: state.deviceScopes.filter(
          (device) => device.id !== action.payload
        ),
        pov: state.pov ? {
          ...state.pov,
          device_scopes: state.pov.device_scopes?.filter(
            (device) => device.id !== action.payload
          ) || []
        } : state.pov
      };
    case 'SET_WORKING_SESSIONS':
      return { ...state, workingSessions: action.payload };
    case 'ADD_WORKING_SESSION':
      return {
        ...state,
        workingSessions: [...state.workingSessions, action.payload],
        pov: state.pov ? {
          ...state.pov,
          working_sessions: [...(state.pov.working_sessions || []), action.payload]
        } : state.pov
      };
    case 'UPDATE_WORKING_SESSION':
      return {
        ...state,
        workingSessions: state.workingSessions.map((session) =>
          session.id === action.payload.id ? action.payload : session
        ),
        pov: state.pov ? {
          ...state.pov,
          working_sessions: state.pov.working_sessions?.map((session) =>
            session.id === action.payload.id ? action.payload : session
          ) || []
        } : state.pov
      };
    case 'DELETE_WORKING_SESSION':
      return {
        ...state,
        workingSessions: state.workingSessions.filter(
          (session) => session.id !== action.payload
        ),
        pov: state.pov ? {
          ...state.pov,
          working_sessions: state.pov.working_sessions?.filter(
            (session) => session.id !== action.payload
          ) || []
        } : state.pov
      };
    case 'DELETE_POV':
      return {
        ...state,
        pov: null,
        povs: state.povs.filter(p => p.id !== action.payload)
      };
    // Add other cases...
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