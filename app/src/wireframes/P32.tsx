// GENERATED from wireframe P32-ReqReview.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z\"></path><path d=\"M8.5 12l2.5 2.5 4.5-4.5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #C2412D; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z\"></path><path d=\"M12 10v5M9.5 12.5h5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 16v-4l2-5h12l2 5v4z\"></path><circle cx=\"7.5\" cy=\"16.5\" r=\"1.8\"></circle><circle cx=\"16.5\" cy=\"16.5\" r=\"1.8\"></circle></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M5.6 5.6l12.8 12.8M7 13h6M16 13h1\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 9l-1.5-4L7 6.5M19 9l1.5-4L17 6.5\"></path><path d=\"M6 9.5c0-2.5 2.7-4 6-4s6 1.5 6 4V14a6 6 0 0 1-12 0z\"></path><path d=\"M10 12h0M14 12h0M11 15.5h2\"></path></svg>"
];

/** Requirements review */
export default function WF_P32() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "column", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> P29-ReqBuilder.dc.html */}
            <SvgXml xml={SVG[0]} width={22} height={22} />
          </View>
          <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#4B5960", flexGrow: 1, flexShrink: 1 }}>Sitter requirements · 4 of 4</Text>
        </View>
        <View style={{ height: 6, backgroundColor: "#DDE3EA", borderRadius: 3, overflow: "hidden", flexShrink: 1, minHeight: 0, flexDirection: "column" }}>
          <View style={{ width: "100%", height: 6, backgroundColor: "#47698A", flexDirection: "column" }}>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", gap: 4 }}>
          <Text style={{ fontFamily: font.display, fontSize: 26, color: "#1B2328", marginVertical: -4.83 }}>Your sitter requirements</Text>
        </View>
        <View style={{ flexDirection: "column", gap: 4, paddingTop: 12, paddingRight: 16, paddingBottom: 12, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", flexShrink: 1 }}>Must have</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCE7F1", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#47698A", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#34526E" }}>5</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 40 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 30, height: 30, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
              <SvgXml xml={SVG[1]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Background check</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 40 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 30, height: 30, flexShrink: 0, backgroundColor: "#F6DCD6", borderRadius: 14 }}>
              <SvgXml xml={SVG[2]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>CPR and First Aid · Infant CPR</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 40 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 30, height: 30, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
              <SvgXml xml={SVG[3]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Driving</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Car trips only · seats for Ava, Leo</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 40 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 30, height: 30, flexShrink: 0, backgroundColor: "#E8ECF1", borderRadius: 14 }}>
              <SvgXml xml={SVG[4]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Non-smoker</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Self-confirmed</Text>
            </View>
          </View>
          <View style={{ height: 1, marginTop: 6, marginBottom: 6, backgroundColor: "#E8ECF1", flexDirection: "column" }}>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", flexShrink: 1 }}>Nice to have</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#8A979D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960" }}>2</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 40 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 30, height: 30, flexShrink: 0, backgroundColor: "#F3E1E3", borderRadius: 14 }}>
              <SvgXml xml={SVG[5]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Speaks Spanish</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 40 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 30, height: 30, flexShrink: 0, backgroundColor: "#F3E1E3", borderRadius: 14 }}>
              <SvgXml xml={SVG[6]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Comfortable with dogs</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Self-confirmed</Text>
            </View>
          </View>
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6 }}>IF A SITTER IS MISSING A MUST-HAVE</Text>
        <View style={{ flexDirection: "column", gap: 4, paddingTop: 4, paddingRight: 4, paddingBottom: 4, paddingLeft: 4, backgroundColor: "#E8ECF1", borderRadius: 12 }}>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.bodyMedium, fontSize: 13, color: "#4B5960" }}>Warn me</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#FFFFFF", borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#1B2328" }}>Block booking</Text>
            </View>
          </View>
        </View>
        <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>She can still join your family and add what’s missing. You can’t book her until she does.</Text>
      </View>
      <View style={{ flexDirection: "row", paddingTop: 4, paddingRight: 20, paddingBottom: 28, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> P23-InviteAccess.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Save and continue invite</Text>
        </View>
      </View>
    </View>
  );
}
