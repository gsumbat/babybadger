// GENERATED from wireframe P19v-CareSafetyView.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"9\" cy=\"8\" r=\"3.5\"></circle><path d=\"M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.8.7 3 2.3 3 4.7\"></path></svg>"
];

/** Keeping Ava safe · read only */
export default function WF_P19v() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> P55h-ChildProfileHelper.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Keeping Ava safe</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 8, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", gap: 4 }}>
          <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", lineHeight: 22 }}>What sitters see on every shift.</Text>
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6 }}>FOOD TO AVOID</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#F6DCD6", borderRadius: 999, borderWidth: 1.5, borderColor: "#C2412D", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#A1321F" }}>Whole nuts</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#F6DCD6", borderRadius: 999, borderWidth: 1.5, borderColor: "#C2412D", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#A1321F" }}>Popcorn</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", paddingTop: 0, paddingRight: 16, paddingBottom: 0, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "column", gap: 2, paddingTop: 12, paddingRight: 0, paddingBottom: 12, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Allergies</Text>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", lineHeight: 21 }}>None</Text>
          </View>
          <View style={{ flexDirection: "column", gap: 2, paddingTop: 12, paddingRight: 0, paddingBottom: 12, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Medicine and health notes</Text>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", lineHeight: 21 }}>Loose tooth this week, soft snacks please. Children’s Tylenol in the kitchen cabinet; ask us first.</Text>
          </View>
          <View style={{ flexDirection: "column", gap: 2, paddingTop: 12, paddingRight: 0, paddingBottom: 12, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Pediatrician</Text>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", lineHeight: 21 }}>Dr. Patel · (813) 555-0142</Text>
          </View>
          <View style={{ flexDirection: "column", gap: 2, paddingTop: 12, paddingRight: 0, paddingBottom: 12, paddingLeft: 0 }}>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Comfort item</Text>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", lineHeight: 21 }}>Blue bunny</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 12, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
          <SvgXml xml={SVG[1]} width={22} height={22} />
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#1B2328", lineHeight: 18, flexShrink: 1 }}>Jen manages Ava’s profile.</Text>
        </View>
      </View>
    </View>
  );
}
