// GENERATED from wireframe P78s-InviteMemberSent.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #1B6B3D; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>"
];

/** Family member invite sent */
export default function WF_P78s() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> P78-FamilyMembers.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Invite sent</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 48, height: 48, flexShrink: 0, backgroundColor: "#DCEEE3", borderRadius: 24 }}>
            <SvgXml xml={SVG[1]} width={28} height={28} />
          </View>
          <View style={{ flexDirection: "column", gap: 2, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.display, fontSize: 20, color: "#1B2328", marginVertical: -4.02 }}>Invite sent to Sue</Text>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>Grandma · Family helper</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", paddingTop: 0, paddingRight: 16, paddingBottom: 0, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 48, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>To</Text>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Sue · sue@example.com</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 48, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Link works</Text>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Until Oct 14</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 48 }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Family</Text>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>3 of 4 with Sue</Text>
          </View>
        </View>
        <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>Sue opens the link and signs in with sue@example.com. She joins right away, covered by your plan. We’ll let you know.</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 8, paddingTop: 4, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> P78-FamilyMembers.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Done</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, flexGrow: 1, flexBasis: 0, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#47698A" }}>Send again</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, flexGrow: 1, flexBasis: 0, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#47698A" }}>Copy link</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
