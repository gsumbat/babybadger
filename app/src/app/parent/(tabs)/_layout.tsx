import { AppTabs } from '@/components/tabs';

export default function ParentTabs() {
  return (
    <AppTabs
      tabs={[
        { name: 'index', title: 'Home', icon: 'home' },
        { name: 'calendar', title: 'Calendar', icon: 'calendar' },
        { name: 'sitters', title: 'Sitters', icon: 'users' },
        { name: 'messages', title: 'Messages', icon: 'message-square' },
        { name: 'settings', title: 'Settings', icon: 'settings' },
      ]}
    />
  );
}
