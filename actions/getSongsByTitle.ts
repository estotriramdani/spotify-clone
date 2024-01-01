import { Song } from '@/types';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import deezerInserter from './deezerInserter';

const getSongsByTitle = async (title?: string): Promise<Song[]> => {
  const supabase = createServerComponentClient({
    cookies: cookies,
  });

  if (!title) {
    return [];
  }

  const fromDeezer = await deezerInserter(title);

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .ilike('title', `%${title}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.log(error);
    return [];
  }

  return [...(data as any), ...(fromDeezer || [])] || [...(fromDeezer || [])];
};

export default getSongsByTitle;
