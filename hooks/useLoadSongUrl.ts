import { useSupabaseClient } from '@supabase/auth-helpers-react';

import { Song } from '@/types';

const useLoadSongUrl = (song?: Song) => {
  const supabaseClient = useSupabaseClient();

  if (!song || !song?.song_path) return '';

  if (song.song_path.startsWith('https://cdns-preview') || song.song_path.endsWith('mp3')) {
    return song.song_path;
  }

  const { data } = supabaseClient.storage.from('songs').getPublicUrl(song.song_path);

  return data.publicUrl;
};

export default useLoadSongUrl;
