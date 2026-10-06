// GENERATED from wireframe S22d-ClockInApproved.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"350\" height=\"250\" viewBox=\"0 0 350 250\" style=\"position: absolute; inset: 0\"><path d=\"M0 70 L350 40 M0 180 L350 200 M90 0 L120 250 M250 0 L230 250\" style=\"stroke: #FFFFFF; stroke-width: 12; fill: none\"></path><circle cx=\"245\" cy=\"70\" r=\"46\" style=\"fill: rgba(20,90,107,0.12); stroke: #47698A; stroke-width: 2; stroke-dasharray: 5 5\"></circle><path d=\"M245 70 L110 185\" style=\"stroke: #5F6D74; stroke-width: 2.5; stroke-dasharray: 2 6; stroke-linecap: round; fill: none\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #FFFFFF; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z\"></path><circle cx=\"12\" cy=\"10\" r=\"2.5\"></circle></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z\"></path><circle cx=\"12\" cy=\"10\" r=\"2.5\"></circle></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>"
];

/** Clock-in Blocked · Approved */
export default function WF_S22d() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> S3-Today.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Clock in</Text>
      </View>
      <View style={{ height: 250, marginTop: 4, marginRight: 20, marginLeft: 20, backgroundColor: "#E7EDEB", borderRadius: 20, overflow: "hidden", flexShrink: 1, minHeight: 0, flexDirection: "column" }}>
        <SvgXml xml={SVG[1]} width={350} height={250} />
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 34, height: 34, top: 52, left: 228, backgroundColor: "#2F6FD6", borderRadius: 17, borderWidth: 3.0, borderColor: "#FFFFFF", position: "absolute" }}>
          <SvgXml xml={SVG[2]} width={16} height={16} />
        </View>
        <View style={{ width: 24, height: 24, top: 173, left: 98, backgroundColor: "#47698A", borderRadius: 12, borderWidth: 4.0, borderColor: "#FFFFFF", position: "absolute", flexDirection: "column", ...cardShadow }}>
        </View>
        <View style={{ top: 124, left: 196, paddingTop: 4, paddingRight: 8, paddingBottom: 4, paddingLeft: 8, backgroundColor: "#FFFFFF", borderRadius: 8, position: "absolute" }}><Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B2328" }}>Lee home</Text></View>
        <View style={{ top: 208, left: 22, paddingTop: 4, paddingRight: 8, paddingBottom: 4, paddingLeft: 8, backgroundColor: "#FFFFFF", borderRadius: 8, position: "absolute" }}><Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B2328" }}>You · 1.2 mi away</Text></View>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 14, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <Text style={{ fontFamily: font.display, fontSize: 24, color: "#1B2328", lineHeight: 28 }}>You're not at the Lee home yet</Text>
        <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", lineHeight: 22 }}>Clock-in opens when you're within 150 m of the family's address.</Text>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "column", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Clock in when I arrive</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Starts the timer at the door</Text>
          </View>
          <View style={{ width: 50, height: 30, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 15, flexDirection: "column" }}>
            <View style={{ width: 24, height: 24, top: 3, right: 3, backgroundColor: "#FFFFFF", borderRadius: 12, position: "absolute", flexDirection: "column" }}>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>{/* -> S4-ActiveShift.dc.html */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
            <SvgXml xml={SVG[3]} width={22} height={22} />
          </View>
          <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Jen said yes</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Tap to clock in where you are.</Text>
          </View>
          <SvgXml xml={SVG[4]} width={18} height={18} />
        </View>
      </View>
      <View style={{ flexDirection: "row", paddingTop: 4, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>{/* -> S21-RunningLate.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#47698A" }}>Running late</Text>
        </View>
      </View>
    </View>
  );
}
