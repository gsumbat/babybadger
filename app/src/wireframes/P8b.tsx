// GENERATED from wireframe P8b-TripAsk.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"390\" height=\"520\" viewBox=\"0 0 390 520\" style=\"position: absolute; left: 0; top: 0\"><rect x=\"250\" y=\"60\" width=\"120\" height=\"110\" rx=\"12\" style=\"fill: #D7EAD9\"></rect><path d=\"M0 380 C60 360 90 420 160 440 L160 520 L0 520z\" style=\"fill: #D3E1EC\"></path><path d=\"M0 130H390M0 300H390M0 450H390M100 0V520M230 0V520M340 0V520\" style=\"stroke: #FFFFFF; stroke-width: 12; fill: none\"></path><circle cx=\"100\" cy=\"440\" r=\"56\" style=\"fill: #47698A; fill-opacity: 0.12; stroke: #47698A; stroke-width: 2; stroke-dasharray: 6 6\"></circle><rect x=\"88\" y=\"428\" width=\"24\" height=\"24\" rx=\"6\" style=\"fill: #FFFFFF; stroke: #1B2328; stroke-width: 2\"></rect><circle cx=\"128\" cy=\"418\" r=\"24\" style=\"fill: #47698A; fill-opacity: 0.16\"></circle><circle cx=\"128\" cy=\"418\" r=\"10\" style=\"fill: #47698A; stroke: #FFFFFF; stroke-width: 3\"></circle></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>"
];

/** Trip · Waiting for You */
export default function WF_P8b() {
  return (
    <View style={{ flex: 1, backgroundColor: "#E7EDEB", flexDirection: "column", overflow: "hidden" }}>
      <SvgXml xml={SVG[0]} width={390} height={520} />
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", top: 16, left: 16, right: 16, position: "absolute" }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, backgroundColor: "#FFFFFF", borderRadius: 22, flexShrink: 1 }}>{/* -> P4-Live.dc.html */}
          <SvgXml xml={SVG[1]} width={22} height={22} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 32, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 1.0, borderColor: "#FFFFFF", flexShrink: 1 }}>
          <View style={{ width: 8, height: 8, backgroundColor: "#47698A", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
          </View>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#47698A" }}>Waiting for you</Text>
        </View>
      </View>
      <View style={{ top: 452, left: 120, paddingTop: 4, paddingRight: 10, paddingBottom: 4, paddingLeft: 10, backgroundColor: "#FFFFFF", borderRadius: 8, position: "absolute" }}><Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>Home</Text></View>
      <View style={{ flexDirection: "column", gap: 14, left: 0, right: 0, bottom: 0, paddingTop: 12, paddingRight: 20, paddingBottom: 32, paddingLeft: 20, backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, position: "absolute" }}>
        <View style={{ alignSelf: "center", width: 40, height: 5, backgroundColor: "#C3CCD5", borderRadius: 3, flexDirection: "column" }}>
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "column", gap: 2, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.display, fontSize: 20, color: "#1B2328" }}>Asks to go to the library</Text>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>Maya with Ava and Leo · on foot</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 0 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <View style={{ flexDirection: "column", alignItems: "center", width: 16, flexShrink: 1 }}>
              <View style={{ width: 12, height: 12, marginTop: 4, borderRadius: 6, borderWidth: 2.0, borderColor: "#1F8A4D", flexDirection: "column" }}>
              </View>
              <View style={{ width: 2, height: 28, backgroundColor: "#DDE3EA", flexDirection: "column" }}>
              </View>
            </View>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>At home</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#5F6D74" }}>You’ll get an alert when she leaves</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <View style={{ flexDirection: "column", alignItems: "center", width: 16, flexShrink: 1 }}>
              <View style={{ width: 12, height: 12, marginTop: 4, borderRadius: 6, borderWidth: 2.0, borderColor: "#E8B9BE", flexDirection: "column" }}>
              </View>
            </View>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>the library</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#5F6D74" }}>Not a saved place: no arrival alert</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 10 }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 48, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P4-Live.dc.html */}
              <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#47698A" }}>Not now</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 48, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P8-Trip.dc.html */}
              <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#FFFFFF" }}>Let Maya go</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
