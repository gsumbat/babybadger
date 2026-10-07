// GENERATED from wireframe P78e-MemberYou.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 5h16v11H9l-5 4z\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"></rect><path d=\"M8 11V8a4 4 0 0 1 8 0v3\"></path></svg>"
];

/** Family member · you */
export default function WF_P78e() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> P78-FamilyMembers.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>You</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 56, height: 56, flexShrink: 0, backgroundColor: "#B86A82", borderRadius: 28 }}>
            <Text style={{ fontFamily: font.displayBold, fontSize: 22, color: "#FFFFFF" }}>SB</Text>
          </View>
          <View style={{ flexDirection: "column", gap: 2, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.display, fontSize: 20, color: "#1B2328", marginVertical: -4.02 }}>Sue Bell</Text>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>Grandma</Text>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74" }}>The Lee family · joined Oct 7</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
            <View style={{ width: 7, height: 7, backgroundColor: "#8A979D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960" }}>Family helper</Text>
          </View>
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, marginTop: 2 }}>WHAT YOU CAN DO</Text>
        <View style={{ flexDirection: "column", paddingTop: 0, paddingRight: 16, paddingBottom: 0, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, paddingTop: 12, paddingRight: 0, paddingBottom: 12, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <SvgXml xml={SVG[1]} width={20} height={20} />
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20, flexShrink: 1 }}>Ava and Leo’s care info, schedule, live shifts and updates</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, paddingTop: 12, paddingRight: 0, paddingBottom: 12, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <SvgXml xml={SVG[2]} width={20} height={20} />
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20, flexShrink: 1 }}>Message the sitter and send hearts on photos</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, paddingTop: 12, paddingRight: 0, paddingBottom: 12, paddingLeft: 0 }}>
            <SvgXml xml={SVG[3]} width={20} height={20} />
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20, flexShrink: 1 }}>Jen and Sam manage sitters, pay and the plan</Text>
          </View>
        </View>
        <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>Only a parent can change your role. Leaving keeps your account; you can be invited again.</Text>
      </View>
      <View style={{ flexDirection: "row", paddingTop: 4, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.5, borderColor: "#C3CCD5", flexShrink: 1 }}>{/* -> P1-Welcome.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#A1321F" }}>Leave family</Text>
        </View>
      </View>
    </View>
  );
}
