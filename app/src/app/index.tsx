import { Redirect } from 'expo-router';

import { useHomeRoute } from '@/lib/home-route';

export default function Index() {
  return <Redirect href={useHomeRoute()} />;
}
