import { AppTabs } from '@/components/tabs';

export default function SitterTabs() {
  return (
    <AppTabs
      tabs={[
        { name: 'index', title: 'Home', icon: 'home' },
        { name: 'families', title: 'Families', icon: 'users' },
        { name: 'me', title: 'Me', icon: 'user' },
      ]}
    />
  );
}
