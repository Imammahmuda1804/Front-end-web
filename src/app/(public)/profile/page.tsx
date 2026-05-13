import { Metadata } from 'next';
import ProfileClient from '@/components/profile/ProfileClient';

export const metadata: Metadata = {
  title: 'Profil & Preferensi - RANAHINSIGHT',
  description: 'Kelola detail profil dan lihat destinasi favorit Anda',
};

export default function ProfilePage() {
  return <ProfileClient />;
}
