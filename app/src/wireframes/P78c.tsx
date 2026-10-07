// GENERATED from wireframe P78c-Member.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>"
];

/** Family member */
export default function WF_P78c() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> P78-FamilyMembers.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Sue Bell</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 56, height: 56, flexShrink: 0, backgroundColor: "#B86A82", borderRadius: 28 }}>
            <Text style={{ fontFamily: font.displayBold, fontSize: 22, color: "#FFFFFF" }}>SB</Text>
          </View>
          <View style={{ flexDirection: "column", gap: 2, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.display, fontSize: 20, color: "#1B2328", marginVertical: -4.02 }}>Sue Bell</Text>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>Grandma</Text>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74" }}>Joined Oct 7</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
            <View style={{ width: 7, height: 7, backgroundColor: "#8A979D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960" }}>Family helper</Text>
          </View>
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, marginTop: 2 }}>ROLE</Text>
        <View style={{ flexDirection: "column", gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1.0, borderColor: "#E6EAEF" }}>
            <View style={{ width: 22, height: 22, flexShrink: 0, borderRadius: 11, borderWidth: 2.0, borderColor: "#C3CCD5", flexDirection: "column" }}>
            </View>
            <View style={{ flexDirection: "column", gap: 2, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328" }}>Parent</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>Everything you can do: sitters, pay and the plan.</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 2.0, borderColor: "#47698A" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 22, height: 22, flexShrink: 0, borderRadius: 11, borderWidth: 2.0, borderColor: "#47698A" }}>
              <View style={{ width: 10, height: 10, backgroundColor: "#47698A", borderRadius: 5, flexShrink: 1, flexDirection: "column" }}>
              </View>
            </View>
            <View style={{ flexDirection: "column", gap: 2, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328" }}>Family helper</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>Sees the kids, the schedule and updates. Messages the sitter.</Text>
            </View>
          </View>
        </View>
        <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>Changes right away. Sue keeps her account; removing her only takes her out of your family.</Text>
      </View>
      <View style={{ flexDirection: "row", paddingTop: 4, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.5, borderColor: "#C3CCD5", flexShrink: 1 }}>{/* -> P78-FamilyMembers.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#A1321F" }}>Remove from family</Text>
        </View>
      </View>
    </View>
  );
}
