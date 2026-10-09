// GENERATED from wireframe S37t-ThreadFromShift.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #FFFFFF; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>"
];

/** Messages · thread opened from a shift */
export default function WF_S37t() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 20, paddingBottom: 12, paddingLeft: 20, backgroundColor: "#FFFFFF", borderBottomWidth: 1.0, borderBottomColor: "#E6EAEF" }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> S4b-BeforeShift.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>{/* -> S10-Family.dc.html */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, flexShrink: 0, backgroundColor: "#1B2328", borderRadius: 20 }}>
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>JL</Text>
          </View>
          <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328" }}>Lee family</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Jen, Dan</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={{ width: 8, height: 8, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#1B6B3D" }}>You're on shift until 7:00 PM</Text>
            </View>
          </View>
          <SvgXml xml={SVG[1]} width={20} height={20} />
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 10, flexGrow: 1, paddingTop: 16, paddingRight: 20, paddingBottom: 16, paddingLeft: 20 }}>
        <Text style={{ fontFamily: font.body, fontSize: 13, color: "#6B7980", alignSelf: "center" }}>Today</Text>
        <View style={{ alignSelf: "center", paddingTop: 6, paddingRight: 12, paddingBottom: 6, paddingLeft: 12, backgroundColor: "#DCEEE3", borderRadius: 999 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B6B3D" }}>You clocked in · 3:02 PM</Text></View>
        <View style={{ alignSelf: "flex-start", maxWidth: 260, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#FFFFFF", borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomRightRadius: 18, borderBottomLeftRadius: 6, ...cardShadow }}><Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", lineHeight: 21 }}>Ava has a loose tooth, no apples today please</Text></View>
        <View style={{ alignSelf: "flex-end", maxWidth: 260, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#47698A", borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomRightRadius: 6, borderBottomLeftRadius: 18 }}><Text style={{ fontFamily: font.body, fontSize: 15, color: "#FFFFFF", lineHeight: 21 }}>Got it! Switching to yogurt for snack</Text></View>
        <View style={{ flexDirection: "column", alignItems: "flex-end", alignSelf: "flex-end", gap: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 200, height: 130, backgroundColor: "#F3E1E3", borderRadius: 18 }}>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>[Photo of Ava at soccer]</Text>
          </View>
          <Text style={{ fontFamily: font.body, fontSize: 12, color: "#6B7980" }}>Sent 4:31 PM · seen</Text>
        </View>
        <View style={{ alignSelf: "center", paddingTop: 6, paddingRight: 12, paddingBottom: 6, paddingLeft: 12, backgroundColor: "#DCE7F1", borderRadius: 999 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#34526E" }}>Trip: arrived at soccer · 4:27 PM</Text></View>
        <View style={{ alignSelf: "flex-start", maxWidth: 260, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#FFFFFF", borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomRightRadius: 18, borderBottomLeftRadius: 6, ...cardShadow }}><Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", lineHeight: 21 }}>Thank you! Can you stay until 7:30 tonight?</Text></View>
        <View style={{ alignSelf: "flex-start" }}><Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#47698A", textDecorationLine: "underline" }}>Review extend request</Text></View>
      </View>
      <View style={{ flexDirection: "column", gap: 10, paddingTop: 10, paddingRight: 16, paddingBottom: 12, paddingLeft: 16, backgroundColor: "#FFFFFF", borderTopWidth: 1.0, borderTopColor: "#E6EAEF" }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, flexShrink: 0, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF" }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>Running late</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, flexShrink: 0, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF" }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>Send a photo</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, flexShrink: 0, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF" }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>All good here</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ width: 1, height: 1, position: "absolute", overflow: "hidden", flexShrink: 1, minHeight: 0, justifyContent: "center" }}><Text style={{ fontFamily: font.body, fontSize: 16, color: "#1B2328" }}>Message Jen</Text></View>
          <TextInput placeholder="Message Jen" defaultValue="" placeholderTextColor="#6B7980" style={{ height: 48, minWidth: 0, flexGrow: 1, paddingTop: 0, paddingRight: 16, paddingBottom: 0, paddingLeft: 16, borderRadius: 24, borderWidth: 1.0, borderColor: "#C3CCD5", flexShrink: 1, fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 48, height: 48, flexShrink: 0, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, backgroundColor: "#47698A", borderRadius: 24 }}>
            <SvgXml xml={SVG[2]} width={22} height={22} />
          </View>
        </View>
      </View>
    </View>
  );
}
