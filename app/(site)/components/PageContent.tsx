'use client';

import SongItem from '@/components/SongItem';
import { Song } from '@/types';

const PageContent: React.FC<{ songs: Song[] }> = ({ songs }) => {
  if (songs.length === 0) {
    return (
      <div className="mt-4 text-neutral-400">
        <p>No songs available</p>
      </div>
    );
  }

  return (
    <div
      className="
      grid
      grid-cols-2
      md:grid-cols-3
      lg:grid-cols-4
      xl:grid-cols-5
      gap-4
      mt-4
    "
    >
      {songs.map((song) => (
        <SongItem key={song.id} onClick={() => {}} data={song} />
      ))}
    </div>
  );
};

export default PageContent;
