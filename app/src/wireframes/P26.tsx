// GENERATED from wireframe P26-InviteAccepted.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #FFFFFF; stroke-width: 2.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>"
];

/** Invite accepted */
export default function WF_P26() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "column", gap: 16, flexGrow: 1, paddingTop: 60, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", alignItems: "center", gap: 12 }}>
          <View style={{ width: 112, height: 112, flexDirection: "column" }}>
            <View style={{ backgroundColor: "#DCE7F1", borderRadius: 56, position: "absolute", top: 0, left: 0, right: 0, bottom: 0, flexDirection: "column" }}>
            </View>
            <View style={{ top: 18, left: 18, position: "absolute", flexDirection: "column" }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 76, height: 76, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 38 }}>
                <Text style={{ fontFamily: font.display, fontSize: 33, color: "#FFFFFF", textAlign: "center" }}>M</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 34, height: 34, right: 2, bottom: 4, backgroundColor: "#1F8A4D", borderRadius: 17, borderWidth: 3.0, borderColor: "#F3F5F8", position: "absolute" }}>
              <SvgXml xml={SVG[0]} width={18} height={18} />
            </View>
          </View>
          <Text style={{ fontFamily: font.display, fontSize: 28, color: "#1B2328", marginVertical: -5.43, textAlign: "center" }}>Maya joined your family</Text>
          <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", textAlign: "center" }}>Accepted today at 6:04 PM</Text>
        </View>
        <View style={{ flexDirection: "column", paddingTop: 0, paddingRight: 16, paddingBottom: 0, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 48, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Location consent</Text>
            <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>Signed</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 48, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Monitoring notice</Text>
            <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>Signed</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 48, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Requirements</Text>
            <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>All 4 met</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 48 }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Can look after</Text>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Ava, Leo</Text>
          </View>
        </View>
        <View style={{ paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 14 }}><Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#34526E", lineHeight: 20 }}>Nothing is shared yet.</Text> Location sharing starts only when Maya clocks in for a shift.</Text></View>
        <View style={{ flexGrow: 1, flexDirection: "column" }}>
        </View>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> P6-Calendar.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Book her first shift</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, flexGrow: 1, flexBasis: 0, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>{/* -> P11-SitterProfile.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#47698A" }}>See her profile</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
