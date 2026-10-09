// GENERATED from wireframe P5j-DoctorSummary.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>"
];

/** Ava’s report · doctor visit summary */
export default function WF_P5j() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> P55-ChildProfile.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", marginVertical: -4.62, flexShrink: 1 }}>Ava’s report</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 10, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 20, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", gap: 6, flexShrink: 0, paddingTop: 0, paddingRight: 20, paddingBottom: 0, paddingLeft: 20, marginRight: -20, marginLeft: -20, overflow: "hidden", minHeight: 0 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, flexShrink: 0, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF" }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>Today</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, flexShrink: 0, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 1.5, borderColor: "#47698A" }}>
            <SvgXml xml={SVG[1]} width={16} height={16} />
            <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#34526E" }}>Week</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, flexShrink: 0, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF" }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>Month</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, flexShrink: 0, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF" }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>3 months</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, flexShrink: 0, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF" }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>6 months</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, flexShrink: 0, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF" }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>1 year</Text>
          </View>
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, marginTop: 4 }}>DOCTOR VISIT SUMMARY</Text>
        <View style={{ flexDirection: "column", gap: 8, paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960", lineHeight: 20 }}>AVA · OCT 2 – 8 · FROM 3 SITTER SHIFTS</Text>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", lineHeight: 20, marginTop: 4 }}>Eating</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20 }}>• 12 meals and snacks, about 2 a day. Ate all or most at 10 of them.</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20 }}>• Skipped dinner once (Tue), said her tooth hurt.</Text>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", lineHeight: 20, marginTop: 4 }}>Sleep</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20 }}>• Lights out between 7:55 and 8:20 PM on all 3 evenings.</Text>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", lineHeight: 20, marginTop: 4 }}>Activity and mood</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20 }}>• Outside every shift (park, soccer). Happy and settled in sitter notes.</Text>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", lineHeight: 20, marginTop: 4 }}>Worth mentioning</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20 }}>• Loose front tooth, soft foods asked for since Oct 5.</Text>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", lineHeight: 20, marginTop: 4 }}>Questions to ask</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20 }}>• When should the loose tooth come out on its own?</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20 }}>• Is one skipped meal a week anything to watch?</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20 }}>• Is 8 PM a good bedtime at 7?</Text>
        </View>
        <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", lineHeight: 17, textAlign: "center" }}>Written by AI from sitter logs. Not medical advice: share it with your pediatrician.</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 50, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#47698A" }}>Copy</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 50, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#FFFFFF" }}>Share</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
