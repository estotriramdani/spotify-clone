'use client';

import { Subscription, UserDetails } from '@/types';
import { User } from '@supabase/auth-helpers-nextjs';
import { useSessionContext, useUser as useSupaUser } from '@supabase/auth-helpers-react';
import { createContext, useContext, useEffect, useState } from 'react';

type UserContextType = {
  accessToken?: string | null;
  user?: User | null;
  userDetails?: UserDetails | null;
  isLoading: boolean | null;
  subscription?: Subscription | null;
};

export const UserContext = createContext<UserContextType | null>(null);

export interface Props {
  [propName: string]: any;
}

export const MyUserContextProvider = (props: Props) => {
  const { session, isLoading: isLoadingUser, supabaseClient: supabase } = useSessionContext();

  const user = useSupaUser();
  const accessToken = session?.access_token;
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const getUserDetails = () => supabase.from('users').select('*').single();
  const getSubscription = () =>
    supabase
      .from('subscriptions')
      .select('*, prices(*, products(*))')
      .in('status', ['trialing', 'active'])
      .single();

  useEffect(() => {
    if (user && !isLoadingData && !userDetails && !subscription) {
      setIsLoadingData(true);

      Promise.allSettled([getUserDetails(), getSubscription()]).then((results) => {
        const [userDetailsResult, subscriptionResult] = results;

        if (userDetailsResult.status === 'fulfilled') {
          setUserDetails(userDetailsResult.value.data as UserDetails);
        }

        if (subscriptionResult.status === 'fulfilled') {
          setSubscription(subscriptionResult.value.data as Subscription);
        }

        setIsLoadingData(false);
      });
    } else if (!user && !isLoadingData && isLoadingUser) {
      setUserDetails(null);
      setSubscription(null);
    }
  }, [user, isLoadingUser]);

  const value = {
    accessToken,
    user,
    userDetails,
    isLoading: isLoadingUser || isLoadingData,
    subscription,
  };

  return <UserContext.Provider value={value} {...props} />;
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser must be used within a MyUserContextProvider');
  }

  return context;
};
