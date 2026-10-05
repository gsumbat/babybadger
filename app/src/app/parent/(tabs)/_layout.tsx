import { AppTabs } from '@/components/tabs';

export default function ParentTabs() {
  return (
    <AppTabs
      tabs={[
        { name: 'index', title: 'Home', icon: 'home' },
        { name: 'shifts', title: 'Shifts', icon: 'calendar' },
        { name: 'sitters', title: 'Sitters', icon: 'users' },
        { name: 'family', title: 'Family', icon: 'settings' },
      ]}
    />
  );
}
