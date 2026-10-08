// GENERATED from wireframe S0e-ExistingSitter.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  
];

/** Existing sitter */
export default function WF_S0e() {
  return (
    <View style={{ flex: 1, backgroundColor: "#22384B", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "column", gap: 10, flexGrow: 1, paddingTop: 70, paddingRight: 14, paddingBottom: 24, paddingLeft: 14 }}>
        <View style={{ flexDirection: "column", alignItems: "center" }}>
          <Text style={{ fontFamily: font.bodySemi, fontSize: 16, color: "#FFFFFF", opacity: 0.85 }}>Thursday, October 1</Text>
          <Text style={{ fontFamily: font.body, fontSize: 76, color: "#FFFFFF", lineHeight: 84 }}>5:43</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 12, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "rgba(255,255,255,0.88)", borderRadius: 20 }}>{/* -> S1-Invite.dc.html */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 38, height: 38, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 9, overflow: "hidden", minHeight: 0 }}>
            <Text numberOfLines={1} style={{ fontFamily: font.display, fontSize: 6.1, color: "#FFFFFF", marginVertical: -1.84, flexShrink: 1 }}>BabyBadger</Text>
          </View>
          <View style={{ flexDirection: "column", gap: 2, flexGrow: 1, flexShrink: 1 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#1B2328", flexShrink: 1 }}>BabyBadger</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", flexShrink: 1 }}>now</Text>
            </View>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328" }}>New family invite</Text>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 19 }}>The Lee family invited you to sit for Ava and Leo. Tap to review.</Text>
          </View>
        </View>
        <View style={{ flexGrow: 1, flexDirection: "column" }}>
        </View>
        <View style={{ paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "rgba(255,255,255,0.14)", borderRadius: 16 }}><Text style={{ fontFamily: font.body, fontSize: 13, color: "#FFFFFF", lineHeight: 18 }}>Already a BabyBadger sitter? No download or sign-up. The invite lands in the app, and the cards on her profile are ready to share when the family asks.</Text></View>
      </View>
    </View>
  );
}
