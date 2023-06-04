import { useSupabaseClient } from '@supabase/auth-helpers-react';

import { Song } from '@/types';

const useLoadSongUrl = (song?: Song) => {
  const supabaseClient = useSupabaseClient();

  if (!song || !song?.song_path) return '';

  const { data } = supabaseClient.storage.from('songs').getPublicUrl(song.song_path);

  return data.publicUrl;
};

export default useLoadSongUrl;
