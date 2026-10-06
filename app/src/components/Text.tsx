import type { ComponentProps, Ref } from 'react';
import { Text as RNText, TextInput as RNTextInput } from 'react-native';

// Text sizes follow the wireframes exactly. iOS "Larger Text" would otherwise grow the copy but not the boxes
// around it, so scaling is capped at 1×. Import Text and TextInput from here, not from react-native.
export function Text(props: ComponentProps<typeof RNText>) {
  return <RNText maxFontSizeMultiplier={1} {...props} />;
}

export function TextInput(props: ComponentProps<typeof RNTextInput> & { ref?: Ref<RNTextInput> }) {
  return <RNTextInput maxFontSizeMultiplier={1} {...props} />;
}
/** The instance type, for refs: useRef<TextInput>(null). */
// eslint-disable-next-line @typescript-eslint/no-redeclare -- value and type share the name, like react-native.
export type TextInput = RNTextInput;
