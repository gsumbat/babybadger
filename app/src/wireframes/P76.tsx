// GENERATED from wireframe P76-RuleDetail.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z\"></path><path d=\"M8.5 12l2.5 2.5 4.5-4.5\"></path></svg>"
];

/** House rule: phone use */
export default function WF_P76() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> P74-HouseRules.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
          <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", marginVertical: -4.62 }}>Sitter’s phone use</Text>
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>House rule</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 10, minHeight: 0, flexGrow: 1, paddingTop: 2, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: 2 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, flexShrink: 1 }}>PERSONAL PHONE DURING A SHIFT</Text>
        </View>
        <View style={{ paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 52, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 22, height: 22, flexShrink: 0, borderRadius: 11, borderWidth: 2.0, borderColor: "#47698A" }}>
              <View style={{ width: 10, height: 10, backgroundColor: "#47698A", borderRadius: 5, flexShrink: 1, flexDirection: "column" }}>
              </View>
            </View>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328" }}>Emergencies and messages with us</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Calls, BabyBadger, texts with Jen or Sam</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 52, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 22, height: 22, flexShrink: 0, borderRadius: 11, borderWidth: 2.0, borderColor: "#C3CCD5" }}>
            </View>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyMedium, fontSize: 15, color: "#1B2328" }}>OK during naps and quiet time</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Not while the kids are awake and playing</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 52 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 22, height: 22, flexShrink: 0, borderRadius: 11, borderWidth: 2.0, borderColor: "#C3CCD5" }}>
            </View>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyMedium, fontSize: 15, color: "#1B2328" }}>No limit</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Use your judgment</Text>
            </View>
          </View>
        </View>
        <View style={{ paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 54, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>No social media on shift</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>No scrolling Instagram, TikTok and similar</Text>
            </View>
            <View style={{ width: 50, height: 30, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 15, flexDirection: "column" }}>
              <View style={{ width: 24, height: 24, top: 3, right: 3, backgroundColor: "#FFFFFF", borderRadius: 12, position: "absolute", flexDirection: "column" }}>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 54 }}>
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Never post photos of the kids</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Anywhere, even after the shift</Text>
            </View>
            <View style={{ width: 50, height: 30, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 15, flexDirection: "column" }}>
              <View style={{ width: 24, height: 24, top: 3, right: 3, backgroundColor: "#FFFFFF", borderRadius: 12, position: "absolute", flexDirection: "column" }}>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: 2 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, flexShrink: 1 }}>HOW STRICT</Text>
        </View>
        <View style={{ flexDirection: "column", gap: 4, paddingTop: 4, paddingRight: 4, paddingBottom: 4, paddingLeft: 4, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#FFFFFF", borderRadius: 999, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#1B2328" }}>Must</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, borderRadius: 999, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.bodyMedium, fontSize: 13, color: "#4B5960" }}>Prefer</Text>
            </View>
          </View>
        </View>
        <View style={{ paddingTop: 0, paddingRight: 2, paddingBottom: 0, paddingLeft: 2 }}><Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", lineHeight: 17 }}>Must: sitters agree before booking. Prefer: shown as a wish, not a condition.</Text></View>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 16 }}>
          <SvgXml xml={SVG[1]} width={20} height={20} />
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#1B2328", lineHeight: 18, flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#34526E", lineHeight: 18 }}>This is an agreement, not tracking.</Text> BabyBadger doesn’t watch the sitter’s phone. She agrees once and sees it at the start of every shift.</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 2, paddingTop: 4, paddingRight: 20, paddingBottom: 26, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> P74-HouseRules.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Save rule</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 38 }}>{/* -> P74-HouseRules.dc.html */}
          <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#A1321F" }}>Remove rule</Text>
        </View>
      </View>
    </View>
  );
}
