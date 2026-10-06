// GENERATED from wireframe P74b-HouseRulesEmpty.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>"
];

/** House rules · none yet */
export default function WF_P74b() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> P12-Settings.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
          <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", marginVertical: -4.62 }}>House rules</Text>
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>What every sitter agrees to</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 8, flexGrow: 1, paddingTop: 2, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 46, flexShrink: 0, borderRadius: 999, borderWidth: 2.0, borderColor: "#C9D3DD", borderStyle: "dashed" }}>{/* -> P75-AddRules.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#47698A" }}>+ Add rules</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", paddingTop: 4, paddingRight: 20, paddingBottom: 26, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, flexGrow: 1, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> P12b-SettingsAccount.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Save</Text>
        </View>
      </View>
    </View>
  );
}
