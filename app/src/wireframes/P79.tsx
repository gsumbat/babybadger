// GENERATED from wireframe P79-AskSheet.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #FFFFFF; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #FFFFFF; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>"
];

/** Ask Maya */
export default function WF_P79() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "column", gap: 10, paddingTop: 20, paddingRight: 20, paddingBottom: 20, paddingLeft: 20, opacity: 0.35 }}>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328" }}>Maya R.</Text>
        <View style={{ height: 120, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
        </View>
        <View style={{ height: 220, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
        </View>
      </View>
      <View style={{ backgroundColor: "rgba(27,35,40,0.45)", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, flexDirection: "column" }}>
      </View>
      <View style={{ flexDirection: "column", gap: 14, left: 0, right: 0, bottom: 0, paddingTop: 12, paddingRight: 20, paddingBottom: 32, paddingLeft: 20, backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, position: "absolute" }}>
        <View style={{ alignSelf: "center", width: 40, height: 5, backgroundColor: "#C3CCD5", borderRadius: 3, flexDirection: "column" }}>
        </View>
        <View style={{ flexDirection: "column", gap: 2 }}>
          <Text style={{ fontFamily: font.display, fontSize: 24, color: "#1B2328" }}>Ask Maya for</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", lineHeight: 20 }}>She gets a notification and shares what she has. You see it here and decide if it looks good.</Text>
        </View>
        <View style={{ flexDirection: "column", paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#F3F5F8", borderRadius: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 54, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 24, height: 24, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 7 }}>
              <SvgXml xml={SVG[0]} width={16} height={16} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Background check</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Not asked yet</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 54, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 24, height: 24, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 7 }}>
              <SvgXml xml={SVG[1]} width={16} height={16} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Age 18 or older</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Asked Oct 6 · ask again</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 54 }}>
            <View style={{ width: 24, height: 24, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 7, borderWidth: 2.0, borderColor: "#C3CCD5", flexDirection: "column" }}>
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Water safety</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Nice to have · not asked</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 6 }}>
          <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Note (optional)</Text></View>
          <TextInput placeholder="" defaultValue="Any check from the last 12 months is fine." placeholderTextColor="#6B7980" style={{ paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 15, color: "#1B2328" }} />
        </View>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> P11-SitterProfile.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Send to Maya</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 40 }}>{/* -> P11-SitterProfile.dc.html */}
          <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#47698A" }}>Cancel</Text>
        </View>
      </View>
    </View>
  );
}
