import { Song } from '@/types';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { EXAMPLE_RESPONSE_DEEZER } from './EXAMPLE_RESPONSE';

export interface Artist {
  id: number;
  name: string;
  link: string;
  picture: string;
  picture_small: string;
  picture_medium: string;
  picture_big: string;
  picture_xl: string;
  tracklist: string;
  type: string;
}

export interface Album {
  id: number;
  title: string;
  cover: string;
  cover_small: string;
  cover_medium: string;
  cover_big: string;
  cover_xl: string;
  md5_image: string;
  tracklist: string;
  type: string;
}

export interface DeezerData {
  id: number;
  readable: boolean;
  title: string;
  title_short: string;
  title_version: string;
  link: string;
  duration: number;
  rank: number;
  explicit_lyrics: boolean;
  explicit_content_lyrics: number;
  explicit_content_cover: number;
  preview: string;
  md5_image: string;
  artist: Artist;
  album: Album;
  type: string;
}

export interface DeezerSearchResponse {
  data: DeezerData[];
  total: number;
  next: string;
}

/** currently supports for search song by a keyword */
const deezerInserter = async (keyword: string) => {
  try {
    const supabase = createServerComponentClient({
      cookies: cookies,
    });

    const { data: check, error: checkError } = await supabase
      .from('cached_searchs')
      .select('*')
      .eq('keyword', keyword)
      .single();

    let response: DeezerSearchResponse = EXAMPLE_RESPONSE_DEEZER;

    
    // UNCOMMENT THIS TO ENABLE DEEZER API
    if (!check) {
      const url = `https://deezerdevs-deezer.p.rapidapi.com/search?q=${keyword}`;
      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
          'X-RapidAPI-Host': 'deezerdevs-deezer.p.rapidapi.com',
        },
      };
      const dataAPI: DeezerSearchResponse = await fetch(url, options).then((res) => res.json());

      const { error } = await supabase.from('cached_searchs').insert({ keyword, data: dataAPI });

      response = dataAPI;
      if (error) console.log(error);
    } else {
      response = check.data;
    } 

    const restructured: Song[] = response.data.map((song) => ({
      author: song.artist.name,
      id: song.id,
      image_path: song.album.cover_big,
      song_path: song.preview,
      title: song.title,
      user_id: '05c473ab-f121-4c20-b5a6-b34030b2c747',
    }));

    const ids = restructured.map((song) => song.id);

    const { data: existData } = await supabase.from('songs').select('*').in('id', ids);

    const existIds = existData?.map((song) => song.id);

    const filtered = restructured.filter((song) => !existIds?.includes(song.id));

    const { error } = await supabase.from('songs').insert(filtered);

    console.error(error);

    return filtered as Song[];
  } catch (error) {
    console.error(error);
  }
};

export default deezerInserter;
