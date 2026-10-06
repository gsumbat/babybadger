// GENERATED from wireframe S25-ExtendShift.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  
];

/** Extend shift */
export default function WF_S25() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "column", gap: 12, paddingTop: 20, paddingRight: 20, paddingBottom: 20, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 }}>
            <View style={{ width: 10, height: 10, backgroundColor: "#2F6FD6", borderRadius: 5, flexShrink: 1, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Lee family · on shift</Text>
          </View>
          <Text style={{ fontFamily: font.display, fontSize: 22, color: "#47698A", flexShrink: 1 }}>3:52:10</Text>
        </View>
        <View style={{ height: 120, backgroundColor: "#FFFFFF", borderRadius: 24, opacity: 0.4, flexDirection: "column", ...cardShadow }}>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 14, paddingTop: 18, paddingRight: 18, paddingBottom: 18, paddingLeft: 18, marginRight: 20, marginLeft: 20, backgroundColor: "#FFFFFF", borderRadius: 24, borderWidth: 2.0, borderColor: "#47698A", ...cardShadow }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 48, height: 48, flexShrink: 0, backgroundColor: "#1B2328", borderRadius: 24 }}>
            <Text style={{ fontFamily: font.display, fontSize: 21, color: "#FFFFFF" }}>J</Text>
          </View>
          <View style={{ flexDirection: "column", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328" }}>Jen · 6:48 PM</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Shift ends at 7:00 PM</Text>
          </View>
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", lineHeight: 28 }}>Stuck in a meeting. Can you stay until 7:45?</Text>
        <View style={{ flexDirection: "column", paddingTop: 4, paddingRight: 14, paddingBottom: 4, paddingLeft: 14, backgroundColor: "#F3F5F8", borderRadius: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 46, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", flexShrink: 1 }}>New end time</Text>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", textAlign: "right", flexShrink: 1 }}>7:45 PM</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 46, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", flexShrink: 1 }}>Extra time</Text>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", textAlign: "right", flexShrink: 1 }}>45 min</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 46 }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", flexShrink: 1 }}>Extra pay</Text>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", textAlign: "right", flexShrink: 1 }}>[RATE] × 0.75 hr</Text>
          </View>
        </View>
        <View style={{ paddingTop: 10, paddingRight: 14, paddingBottom: 10, paddingLeft: 14, backgroundColor: "#F6E3C6", borderRadius: 12 }}><Text style={{ fontFamily: font.body, fontSize: 13, color: "#5C4310", lineHeight: 18 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#7A4E0E", lineHeight: 18 }}>Tight:</Text> your Ortiz shift starts 7:30 PM. Staying past 7:15 makes you late there.</Text></View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 1.5, borderColor: "#47698A", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#47698A" }}>✓ Until 7:15</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Until 7:45</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Custom</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#C3CCD5", flexShrink: 1 }}>{/* -> S4-ActiveShift.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328" }}>Can’t stay</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> S4-ActiveShift.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Stay till 7:15</Text>
          </View>
        </View>
      </View>
      <View style={{ flexGrow: 1, flexDirection: "column" }}>
      </View>
      <View style={{ paddingTop: 0, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}><Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18, textAlign: "center" }}>Location sharing keeps running until you clock out, then stops.</Text></View>
    </View>
  );
}
