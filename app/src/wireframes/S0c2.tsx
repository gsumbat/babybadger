// GENERATED from wireframe S0c2-InviteOtherEmail.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  
];

/** Invite for another email */
export default function WF_S0c2() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "column", gap: 18, flexGrow: 1, paddingTop: 28, paddingRight: 20, paddingBottom: 16, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={{ fontFamily: font.body, fontSize: 22, color: "#1B2328", flexShrink: 1 }}><Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328" }}>BabyBadger</Text></Text>
        </View>
        <View style={{ flexDirection: "column", gap: 6 }}>
          <Text style={{ fontFamily: font.display, fontSize: 28, color: "#1B2328", lineHeight: 34 }}>This invite is for another email</Text>
          <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", lineHeight: 22 }}>This invite was sent to m•••@email.com. Sign in with that email, or ask Jen to resend it.</Text>
        </View>
        <View style={{ flexGrow: 1, flexDirection: "column" }}>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, backgroundColor: "#47698A", borderRadius: 999 }}>{/* -> S0c0-ConfirmEmail.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Use another email</Text>
        </View>
      </View>
    </View>
  );
}
