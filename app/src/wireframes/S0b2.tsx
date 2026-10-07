// GENERATED from wireframe S0b2-InviteLinkExpired.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z\"></path><path d=\"M8.5 12l2.5 2.5 4.5-4.5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v5l3 2\"></path></svg>"
];

/** Invite link expired */
export default function WF_S0b2() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ paddingTop: 12, paddingRight: 14, paddingBottom: 8, paddingLeft: 14, backgroundColor: "#FFFFFF", borderBottomWidth: 1.0, borderBottomColor: "#E6EAEF", flexDirection: "column" }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 34, backgroundColor: "#E8ECF1", borderRadius: 10 }}>
          <SvgXml xml={SVG[0]} width={14} height={14} />
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#1B2328" }}>babybadger.app/i/•••••</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 18, flexGrow: 1, paddingTop: 28, paddingRight: 20, paddingBottom: 16, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={{ fontFamily: font.body, fontSize: 22, color: "#1B2328", flexShrink: 1 }}><Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328" }}>BabyBadger</Text></Text>
        </View>
        <View style={{ flexDirection: "column", gap: 6 }}>
          <Text style={{ fontFamily: font.display, fontSize: 28, color: "#1B2328", marginVertical: -5.43 }}>This invite has expired</Text>
          <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", lineHeight: 22 }}>Invites work for 7 days. Ask the family to send you a new one.</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 12, paddingTop: 14, paddingRight: 14, paddingBottom: 14, paddingLeft: 14, backgroundColor: "#F6E3C6", borderRadius: 14 }}>
          <SvgXml xml={SVG[1]} width={22} height={22} />
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20, flexShrink: 1 }}>Invites work once and for 7 days, so an old link can’t open a family’s details.</Text>
        </View>
        <View style={{ flexGrow: 1, flexDirection: "column" }}>
        </View>
      </View>
    </View>
  );
}
