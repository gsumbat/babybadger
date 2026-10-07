// GENERATED from wireframe S0a-InviteText.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  
];

/** Invite text */
export default function WF_S0a() {
  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "column", alignItems: "center", gap: 4, paddingTop: 14, paddingRight: 16, paddingBottom: 10, paddingLeft: 16, backgroundColor: "#FFFFFF", borderBottomWidth: 1.0, borderBottomColor: "#DCE3E5" }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, backgroundColor: "#DCE3E5", borderRadius: 22 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328" }}>JL</Text>
        </View>
        <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>Jen Lee</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 8, flexGrow: 1, paddingTop: 16, paddingRight: 14, paddingBottom: 16, paddingLeft: 14, backgroundColor: "#FFFFFF" }}>
        <Text style={{ fontFamily: font.body, fontSize: 11, color: "#5F6D74", textAlign: "center" }}>Today 5:42 PM</Text>
        <View style={{ alignSelf: "flex-start", maxWidth: "78%", paddingTop: 10, paddingRight: 14, paddingBottom: 10, paddingLeft: 14, backgroundColor: "#ECEEF0", borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomRightRadius: 18, borderBottomLeftRadius: 6 }}><Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", lineHeight: 21 }}>Hi Maya! It’s Jen. We’re using BabyBadger for Ava and Leo’s schedule. Here’s your invite:</Text></View>
        <View style={{ alignSelf: "flex-start", width: "78%", borderRadius: 16, borderWidth: 1.0, borderColor: "#DCE3E5", overflow: "hidden", flexShrink: 1, minHeight: 0, flexDirection: "column" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, height: 110, backgroundColor: "#47698A" }}>
            <Text style={{ fontFamily: font.body, fontSize: 24, color: "#FFFFFF", flexShrink: 1 }}><Text style={{ fontFamily: font.display, fontSize: 24, color: "#FFFFFF" }}>BabyBadger</Text></Text>
          </View>
          <View style={{ flexDirection: "column", gap: 2, paddingTop: 10, paddingRight: 12, paddingBottom: 10, paddingLeft: 12, backgroundColor: "#F4F6F5" }}>{/* -> S0b-InviteLink.dc.html */}
            <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328" }}>Join the Lee family on BabyBadger</Text>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>babybadger.app</Text>
          </View>
        </View>
        <View style={{ paddingLeft: 6 }}><Text style={{ fontFamily: font.body, fontSize: 11, color: "#5F6D74" }}>Sent from Jen’s phone</Text></View>
        <View style={{ flexGrow: 1, flexDirection: "column" }}>
        </View>
        <View style={{ paddingTop: 10, paddingRight: 12, paddingBottom: 10, paddingLeft: 12, backgroundColor: "#DCE7F1", borderRadius: 14 }}><Text style={{ fontFamily: font.body, fontSize: 13, color: "#34526E", lineHeight: 18 }}>Design note: the text goes from the parent’s own number (share sheet), so the sitter recognizes who it’s from.</Text></View>
      </View>
      <View style={{ paddingTop: 10, paddingRight: 14, paddingBottom: 30, paddingLeft: 14, backgroundColor: "#FFFFFF", borderTopWidth: 1.0, borderTopColor: "#DCE3E5", flexDirection: "column" }}>
        <View style={{ flexDirection: "row", alignItems: "center", height: 38, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, borderRadius: 19, borderWidth: 1.0, borderColor: "#DCE3E5" }}>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#5F6D74" }}>Message</Text>
        </View>
      </View>
    </View>
  );
}
