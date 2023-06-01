'use client';

import uniqid from 'uniqid';
import { useState } from 'react';
import { useForm, FieldValues, SubmitHandler } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';

import { useUser } from '@/hooks/useUser';
import useUploadModal from '@/hooks/useUploadModal';

import Modal from './Modal';
import Input from './Input';
import Button from './Button';

const UploadModal = () => {
  const uploadModal = useUploadModal();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const supabaseClient = useSupabaseClient();

  const { reset, register, handleSubmit } = useForm<FieldValues>({
    defaultValues: {
      author: '',
      title: '',
      song: null,
      image: null,
    },
  });

  const onChange = (open: boolean) => {
    if (!open) {
      reset();
      uploadModal.onClose();
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    try {
      setIsLoading(true);

      const imageFile = values.image?.[0];
      const songFile = values.song?.[0];

      if (!imageFile || !songFile || !user) {
        return toast.error('Please select a song and an image');
      }

      const uniqueId = uniqid();

      // Upload song
      const { data: songData, error: songError } = await supabaseClient.storage
        .from('songs')
        .upload(`song-${values.title}-${uniqueId}`, songFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (songError) {
        setIsLoading(false);
        return toast.error('Error uploading song');
      }

      // Upload image
      const { data: imageData, error: imageError } = await supabaseClient.storage
        .from('images')
        .upload(`image-${values.title}-${uniqueId}`, imageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (imageError) {
        setIsLoading(false);
        return toast.error('Error uploading image');
      }

      const { error: supabaseError } = await supabaseClient.from('songs').insert({
        title: values.title,
        author: values.author,
        image_path: imageData.path,
        song_path: songData.path,
        user_id: user.id,
      });

      if (supabaseError) {
        setIsLoading(false);
        return toast.error(supabaseError.message);
      }

      router.refresh();
      toast.success('Song uploaded successfully');
      reset();
      uploadModal.onClose();
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Add a Song"
      description="Upload an mp3 file to add to your library"
      isOpen={uploadModal.isOpen}
      onChange={onChange}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
        <Input
          id="title"
          disabled={isLoading}
          placeholder="Song title"
          {...register('title', { required: true })}
        />
        <Input
          id="author"
          disabled={isLoading}
          placeholder="Song author"
          {...register('author', { required: true })}
        />
        <div>
          <p className="pb-1">Select a song file</p>
          <Input
            id="song"
            type="file"
            disabled={isLoading}
            accept=".mp3"
            {...register('song', { required: true })}
          />
        </div>
        <div>
          <p className="pb-1">Select an image</p>
          <Input
            id="image"
            type="file"
            disabled={isLoading}
            accept="image/*"
            {...register('image', { required: true })}
          />
        </div>
        <Button disabled={isLoading} type="submit">
          Create
        </Button>
      </form>
    </Modal>
  );
};

export default UploadModal;
