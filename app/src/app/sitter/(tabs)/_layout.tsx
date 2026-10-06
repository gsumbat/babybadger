import { AppTabs } from '@/components/tabs';

export default function SitterTabs() {
  return (
    <AppTabs
      tabs={[
        { name: 'index', title: 'Home', icon: 'home' },
        { name: 'calendar', title: 'Calendar', icon: 'calendar' },
        { name: 'families', title: 'Families', icon: 'users' },
        { name: 'messages', title: 'Messages', icon: 'message-square' },
        { name: 'me', title: 'Me', icon: 'user' },
      ]}
    />
  );
}
