// GENERATED from wireframe P76b-OwnRule.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>"
];

/** Write your own rule */
export default function WF_P76b() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> P75-AddRules.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
          <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", marginVertical: -4.62 }}>Write your own rule</Text>
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>House rule</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 10, flexGrow: 1, paddingTop: 2, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", gap: 6 }}>
          <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Rule</Text></View>
          <TextInput placeholder="" defaultValue="Shoes off inside" placeholderTextColor="#6B7980" style={{ height: 50, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: 2 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, flexShrink: 1 }}>HOW STRICT</Text>
        </View>
        <View style={{ flexDirection: "column", gap: 4, paddingTop: 4, paddingRight: 4, paddingBottom: 4, paddingLeft: 4, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#FFFFFF", borderRadius: 999, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#1B2328" }}>Must</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, borderRadius: 999, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.bodyMedium, fontSize: 13, color: "#4B5960" }}>Prefer</Text>
            </View>
          </View>
        </View>
        <View style={{ paddingTop: 0, paddingRight: 2, paddingBottom: 0, paddingLeft: 2 }}><Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", lineHeight: 17 }}>Must: sitters agree before booking. Prefer: shown as a wish, not a condition.</Text></View>
      </View>
      <View style={{ flexDirection: "row", paddingTop: 4, paddingRight: 20, paddingBottom: 26, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, flexGrow: 1, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> P74-HouseRules.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Save rule</Text>
        </View>
      </View>
    </View>
  );
}
