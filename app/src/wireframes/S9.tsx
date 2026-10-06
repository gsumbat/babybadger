// GENERATED from wireframe S9-EndShift.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>"
];

/** End shift */
export default function WF_S9() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> S4-ActiveShift.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <View style={{ flexDirection: "column", flexShrink: 1 }}>
          <Text style={{ fontFamily: font.display, fontSize: 20, color: "#1B2328" }}>Wrap up the shift</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>The Lee family</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 0, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "column", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Time worked</Text>
            <Text style={{ fontFamily: font.display, fontSize: 32, color: "#1B2328", marginVertical: -6.63 }}>4 h 02 m</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#5F6D74" }}>3:02 – 7:04 PM</Text>
          </View>
          <View style={{ height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1, justifyContent: "center" }}><Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#47698A" }}>Fix times</Text></View>
        </View>
        <View style={{ flexDirection: "column", gap: 8 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flexDirection: "column", gap: 2, paddingTop: 12, paddingRight: 12, paddingBottom: 12, paddingLeft: 12, backgroundColor: "#DCEEE3", borderRadius: 16, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.display, fontSize: 20, color: "#1B6B3D" }}>4 / 4</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#1B6B3D" }}>Tasks done</Text>
            </View>
            <View style={{ flexDirection: "column", gap: 2, paddingTop: 12, paddingRight: 12, paddingBottom: 12, paddingLeft: 12, backgroundColor: "#F3E1E3", borderRadius: 16, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.display, fontSize: 20, color: "#1B2328" }}>2</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Meals</Text>
            </View>
            <View style={{ flexDirection: "column", gap: 2, paddingTop: 12, paddingRight: 12, paddingBottom: 12, paddingLeft: 12, backgroundColor: "#DCE7F1", borderRadius: 16, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.display, fontSize: 20, color: "#34526E" }}>2</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#34526E" }}>Trips</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 8 }}>
          <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>How did it go?</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <View style={{ height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 2.0, borderColor: "#47698A", flexShrink: 1, justifyContent: "center" }}><Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#47698A" }}>Great day</Text></View>
            <View style={{ height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1, justifyContent: "center" }}><Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Bit tired</Text></View>
            <View style={{ height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1, justifyContent: "center" }}><Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Upset tummy</Text></View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 6 }}>
          <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Note for Jen</Text></View>
          <TextInput placeholder="Anything parents should know" defaultValue="" placeholderTextColor="#6B7980" style={{ height: 96, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 52, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#C2412D", borderStyle: "dashed" }}>{/* -> S24-Incident.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 15, color: "#A1321F" }}>Report an injury or illness</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 8, paddingTop: 8, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, backgroundColor: "#47698A", borderRadius: 999 }}>{/* -> S3-Today.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Clock out and send report</Text>
        </View>
        <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", textAlign: "center" }}>Location sharing stops the moment you clock out.</Text>
      </View>
    </View>
  );
}
