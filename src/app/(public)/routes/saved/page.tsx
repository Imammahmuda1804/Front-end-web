import { SavedRoutesClient } from '@/features/routes';

export const metadata = {
  title: 'Rute Tersimpan - RANAHINSIGHT',
  description: 'Pantau rute wisata yang disimpan dan tandai lokasi yang sudah dikunjungi.',
};

export default function SavedRoutesPage() {
  return <SavedRoutesClient />;
}
