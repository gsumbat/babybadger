import { Empty, Screen } from '@/components/ui';

// Wireframes P10 / S37. Messaging isn't in this build yet; the tab is here so the menu matches the design.
export default function Messages() {
  return (
    <Screen title="Messages">
      <Empty icon="message-square" title="Messages are coming next">
        You’ll chat here with your family or sitter, one thread per family. For now, use your usual texting app.
      </Empty>
    </Screen>
  );
}
