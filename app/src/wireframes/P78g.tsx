// GENERATED from wireframe P78g-MemberFull.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>"
];

/** Family member · full access */
export default function WF_P78g() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> P78-FamilyMembers.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Sam Lee</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 56, height: 56, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 28 }}>
            <Text style={{ fontFamily: font.displayBold, fontSize: 22, color: "#FFFFFF" }}>SL</Text>
          </View>
          <View style={{ flexDirection: "column", gap: 2, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.display, fontSize: 20, color: "#1B2328", marginVertical: -4.02 }}>Sam Lee</Text>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>Dad</Text>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74" }}>Joined Oct 1</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCE7F1", borderRadius: 999 }}>
            <View style={{ width: 7, height: 7, backgroundColor: "#47698A", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#34526E" }}>Full access</Text>
          </View>
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, marginTop: 2 }}>ACCESS</Text>
        <View style={{ flexDirection: "column", paddingTop: 0, paddingRight: 16, paddingBottom: 0, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 58, paddingTop: 12, paddingRight: 0, paddingBottom: 12, paddingLeft: 0 }}>
            <View style={{ flexDirection: "column", gap: 2, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Full access</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>Can book shifts, edit the care plan and manage sitters.</Text>
            </View>
            <View style={{ width: 50, height: 30, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 15, flexDirection: "column" }}>
              <View style={{ width: 24, height: 24, top: 3, right: 3, backgroundColor: "#FFFFFF", borderRadius: 12, position: "absolute", flexDirection: "column" }}>
              </View>
            </View>
          </View>
        </View>
        <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>Changes right away. Sam keeps his account; removing him only takes him out of your family.</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 8, paddingTop: 4, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>{/* -> P78t-MakeOwner.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#47698A" }}>Make Sam the owner</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.5, borderColor: "#C3CCD5", flexShrink: 1 }}>{/* -> P78-FamilyMembers.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#A1321F" }}>Remove from family</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
