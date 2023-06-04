import { useSupabaseClient } from '@supabase/auth-helpers-react';

import { Song } from '@/types';

const useLoadImage = (song: Song) => {
  const supabaseClient = useSupabaseClient();

  if (!song) {
    return null;
  }

  if (song.image_path.startsWith('https://e-cdns') || song.image_path.endsWith('jpg')) {
    return song.image_path;
  }

  const { data } = supabaseClient.storage.from('images').getPublicUrl(song.image_path);

  return data.publicUrl;
};

export default useLoadImage;
