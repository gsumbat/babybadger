// GENERATED from wireframe P10b-MessagesEmpty.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"26\" height=\"26\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 5h16v11H9l-5 4z\"></path></svg>"
];

/** Messages · no sitters yet */
export default function WF_P10b() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ paddingTop: 20, paddingRight: 20, paddingBottom: 10, paddingLeft: 20, backgroundColor: "#FFFFFF", borderBottomWidth: 1.0, borderBottomColor: "#E6EAEF" }}><Text style={{ fontFamily: font.body, fontSize: 16, color: "#1B2328" }}><Text style={{ fontFamily: font.display, fontSize: 24, color: "#1B2328" }}>Messages</Text></Text></View>
      <View style={{ flexGrow: 1, paddingTop: 0, paddingRight: 20, paddingBottom: 0, paddingLeft: 20, flexDirection: "column" }}>
        <View style={{ flexDirection: "column", alignItems: "center", gap: 10, paddingTop: 48, paddingRight: 24, paddingBottom: 48, paddingLeft: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 56, height: 56, backgroundColor: "#DCE7F1", borderRadius: 28 }}>
            <SvgXml xml={SVG[0]} width={26} height={26} />
          </View>
          <Text style={{ fontFamily: font.display, fontSize: 20, color: "#1B2328", textAlign: "center" }}>No sitters yet</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", lineHeight: 20, textAlign: "center" }}>Once a sitter joins and signs your notice, you can message her here.</Text>
        </View>
      </View>
      {/* tab bar: drawn by the app's tab navigator */}
    </View>
  );
}
