// GENERATED from wireframe P47-PoolBooked.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"44\" height=\"44\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #1F8A4D; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>"
];

/** Priya took the shift */
export default function WF_P47() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "column", gap: 14, flexGrow: 1, paddingTop: 64, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", alignItems: "center", gap: 10, paddingBottom: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 84, height: 84, backgroundColor: "#DCEEE3", borderRadius: 42 }}>
            <SvgXml xml={SVG[0]} width={44} height={44} />
          </View>
          <Text style={{ fontFamily: font.display, fontSize: 28, color: "#1B2328", marginVertical: -6.43, textAlign: "center" }}>Priya took the shift</Text>
          <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", textAlign: "center" }}>Sat, Oct 10 · 6:00 – 10:00 PM</Text>
        </View>
        <View style={{ paddingTop: 4, paddingRight: 16, paddingBottom: 4, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 64, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, flexShrink: 0, backgroundColor: "#5E7F6A", borderRadius: 20 }}>
              <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>P</Text>
            </View>
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Priya K.</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>First shift with your family</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>Confirmed</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 48, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Kids</Text>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", textAlign: "right", flexShrink: 1 }}>Ava, Leo</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 48, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Care plan</Text>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", textAlign: "right", flexShrink: 1 }}>Shared with Priya</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 48 }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Location sharing</Text>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", textAlign: "right", flexShrink: 1 }}>Starts when she clocks in</Text>
          </View>
        </View>
        <View style={{ paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#E8ECF1", borderRadius: 16 }}><Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", lineHeight: 20 }}>Maya was told the shift is filled. Nothing for her to do.</Text></View>
        <View style={{ flexDirection: "row", gap: 10, marginTop: "auto" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>{/* -> P10-Messages.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#47698A" }}>Message Priya</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> P6-Calendar.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Done</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
