import { Metadata } from 'next';

import ProfileClient from '@/components/profile/ProfileClient';

export const metadata: Metadata = {
  title: 'Favorit Saya - RANAHINSIGHT',
  description: 'Kelola dan bandingkan destinasi favorit Anda',
};

export default function FavoritesPage() {
  return <ProfileClient initialView="favorites" />;
}
