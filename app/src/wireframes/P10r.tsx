// GENERATED from wireframe P10r-MessagesReadOnly.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #47698A; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 4h3.5l2 5-2.5 1.5a11 11 0 0 0 5.5 5.5l1.5-2.5 5 2V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #FFFFFF; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12h14M13 6l6 6-6 6\"></path></svg>"
];

/** Messages with Maya · read only */
export default function WF_P10r() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 20, paddingBottom: 12, paddingLeft: 20, backgroundColor: "#FFFFFF", borderBottomWidth: 1.0, borderBottomColor: "#E6EAEF" }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> P4-Live.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, backgroundColor: "#47698A", borderRadius: 20, flexShrink: 1 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 16, color: "#FFFFFF" }}>M</Text>
        </View>
        <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328" }}>Maya</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ width: 8, height: 8, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#1B6B3D" }}>On shift until 7:00 PM</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, backgroundColor: "#DCE7F1", borderRadius: 22, flexShrink: 1 }}>
          <SvgXml xml={SVG[1]} width={20} height={20} />
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 10, flexGrow: 1, paddingTop: 16, paddingRight: 20, paddingBottom: 16, paddingLeft: 20 }}>
        <Text style={{ fontFamily: font.body, fontSize: 13, color: "#5F6D74", alignSelf: "center" }}>Today</Text>
        <View style={{ alignSelf: "center", paddingTop: 6, paddingRight: 12, paddingBottom: 6, paddingLeft: 12, backgroundColor: "#DCEEE3", borderRadius: 999 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B6B3D" }}>Maya clocked in · 3:02 PM</Text></View>
        <View style={{ alignSelf: "flex-end", maxWidth: 260, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#47698A", borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomRightRadius: 6, borderBottomLeftRadius: 18 }}><Text style={{ fontFamily: font.body, fontSize: 15, color: "#FFFFFF", lineHeight: 21 }}>Ava has a loose tooth, no apples today please</Text></View>
        <View style={{ alignSelf: "flex-start", maxWidth: 260, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 18, borderBottomRightRadius: 18, borderBottomLeftRadius: 6, ...cardShadow }}><Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", lineHeight: 21 }}>Got it! Switching to yogurt for snack</Text></View>
        <View style={{ flexDirection: "column", alignSelf: "flex-start", gap: 4, maxWidth: 220 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 150, backgroundColor: "#F3E1E3", borderRadius: 18, borderWidth: 1.0, borderColor: "#D5DCE4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>[Photo from Maya]</Text>
          </View>
          <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74" }}>Ava at soccer · 4:31 PM</Text>
        </View>
        <View style={{ alignSelf: "center", paddingTop: 6, paddingRight: 12, paddingBottom: 6, paddingLeft: 12, backgroundColor: "#DCE7F1", borderRadius: 999 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#47698A" }}>Trip: arrived at soccer · 4:27 PM</Text></View>
      </View>
      <View style={{ flexDirection: "column", gap: 10, paddingTop: 10, paddingRight: 16, paddingBottom: 28, paddingLeft: 16, backgroundColor: "#FFFFFF", borderTopWidth: 1.0, borderTopColor: "#E6EAEF" }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ height: 36, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1, justifyContent: "center" }}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Ask for a photo</Text></View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ width: 1, height: 1, position: "absolute", overflow: "hidden", flexShrink: 1, minHeight: 0, justifyContent: "center" }}><Text style={{ fontFamily: font.body, fontSize: 16, color: "#1B2328" }}>Message Maya</Text></View>
          <TextInput placeholder="Message Maya" defaultValue="" placeholderTextColor="#6B7980" style={{ height: 48, flexGrow: 1, paddingTop: 0, paddingRight: 16, paddingBottom: 0, paddingLeft: 16, borderRadius: 24, borderWidth: 1.0, borderColor: "#C3CCD5", flexShrink: 1, fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 48, height: 48, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, backgroundColor: "#47698A", borderRadius: 24, flexShrink: 1 }}>
            <SvgXml xml={SVG[2]} width={22} height={22} />
          </View>
        </View>
      </View>
    </View>
  );
}
