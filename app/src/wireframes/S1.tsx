// GENERATED from wireframe S1-Invite.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  
];

/** Family invite */
export default function WF_S1() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ paddingTop: 24, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}><Text style={{ fontFamily: font.body, fontSize: 16, color: "#1B2328" }}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#4B5960" }}>New invite</Text></Text></View>
      <View style={{ flexDirection: "column", gap: 14, flexGrow: 1, paddingTop: 8, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", gap: 14, paddingTop: 20, paddingRight: 20, paddingBottom: 20, paddingLeft: 20, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 52, height: 52, backgroundColor: "#1B2328", borderRadius: 26, borderWidth: 3.0, borderColor: "#FFFFFF", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 16, color: "#FFFFFF" }}>JL</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 52, height: 52, marginLeft: -14, backgroundColor: "#E8B9BE", borderRadius: 26, borderWidth: 3.0, borderColor: "#FFFFFF", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 16, color: "#8A3F5A" }}>A</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 52, height: 52, marginLeft: -14, backgroundColor: "#2F6FD6", borderRadius: 26, borderWidth: 3.0, borderColor: "#FFFFFF", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 16, color: "#FFFFFF" }}>L</Text>
            </View>
          </View>
          <View style={{ flexDirection: "column", gap: 4 }}>
            <Text style={{ fontFamily: font.display, fontSize: 24, color: "#1B2328", marginVertical: -4.22 }}>The Lee family invited you</Text>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960" }}>Rate: [RATE] per hour</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", height: 32, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#F3E1E3", borderRadius: 999, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Ava, 7</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", height: 32, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#F3E1E3", borderRadius: 999, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Leo, 4</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 10, width: "100%" }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flexDirection: "column", gap: 8, paddingTop: 14, paddingRight: 14, paddingBottom: 14, paddingLeft: 14, backgroundColor: "#DCEEE3", borderRadius: 16, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B6B3D" }}>They can see</Text>
              <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20 }}>Your location while clocked in</Text>
              <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20 }}>Hours you log</Text>
              <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20 }}>Tasks, meals, notes, photos</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 8, paddingTop: 14, paddingRight: 14, paddingBottom: 14, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#4B5960" }}>They never see</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20 }}>Where you are between shifts</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20 }}>Other families you work for</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 10, paddingTop: 12, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, backgroundColor: "#47698A", borderRadius: 999 }}>{/* -> S27-FamilyRequirements.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Review and accept</Text>
        </View>
        <View style={{ height: 48, backgroundColor: "transparent", borderRadius: 999, justifyContent: "center" }}><Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#4B5960" }}>Decline</Text></View>
      </View>
    </View>
  );
}
