// GENERATED from wireframe S41-CertDetail.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z\"></path><path d=\"M10 20.5a2 2 0 0 0 4 0\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #C2412D; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z\"></path><path d=\"M12 10v5M9.5 12.5h5\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #8A5A7A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6h11M9 12h11M9 18h11M4.5 6h0M4.5 12h0M4.5 18h0\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #FFFFFF; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 16V4M7 9l5-5 5 5\"></path><path d=\"M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3\"></path></svg>"
];

/** Infant CPR certification */
export default function WF_S41() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> S14-Credentials.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
          <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", marginVertical: -4.62 }}>Infant CPR</Text>
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Certification</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 10, minHeight: 0, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#F6E3C6", borderRadius: 16 }}>
          <SvgXml xml={SVG[1]} width={20} height={20} />
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#1B2328", lineHeight: 18, flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#7A4E0E", lineHeight: 18 }}>Expires Oct 22, in 21 days.</Text> Renew it and share the new card with your families.</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14, height: 96, paddingTop: 0, paddingRight: 16, paddingBottom: 0, paddingLeft: 16, borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, backgroundColor: "#F6DCD6", borderRadius: 22, flexShrink: 1 }}>
            <SvgXml xml={SVG[2]} width={22} height={22} />
          </View>
          <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328" }}>Infant CPR · AED</Text>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Card photo · uploaded Oct 2024</Text>
          </View>
          <View style={{ flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#47698A", textDecorationLine: "underline" }}>View</Text></View>
        </View>
        <View style={{ paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 44, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", flexShrink: 1 }}>Issued by</Text>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>American Heart Assoc.</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 44, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", flexShrink: 1 }}>Card number</Text>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>•••• 4821</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 44, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", flexShrink: 1 }}>Valid</Text>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>Oct 22, 2024 – Oct 22, 2026</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 44 }}>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", flexShrink: 1 }}>Status</Text>
            <View style={{ flexShrink: 1, flexDirection: "column" }}>
              <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>Added</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, flexShrink: 1 }}>WHO NEEDS IT</Text>
        </View>
        <View style={{ paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 54 }}>{/* -> S27-FamilyRequirements.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#F3E1E3", borderRadius: 12 }}>
              <SvgXml xml={SVG[3]} width={20} height={20} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", lineHeight: 19 }}>Lee family · must-have</Text>
              <View style={{ overflow: "hidden", flexShrink: 1, minHeight: 0, justifyContent: "center" }}><Text numberOfLines={1} style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", lineHeight: 16 }}>Leo is under 5. Without it, they can’t book you.</Text></View>
            </View>
            <SvgXml xml={SVG[4]} width={18} height={18} />
          </View>
        </View>
        <View style={{ paddingTop: 0, paddingRight: 4, paddingBottom: 0, paddingLeft: 4 }}><Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", lineHeight: 17 }}>Only you see this card. If it expires, families you shared it with see it as Expired until you share a new one.</Text></View>
      </View>
      <View style={{ flexDirection: "column", gap: 8, paddingTop: 6, paddingRight: 20, paddingBottom: 24, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> S15-AddCert.dc.html */}
            <SvgXml xml={SVG[5]} width={20} height={20} />
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Upload renewed card</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 46, flexGrow: 1, flexBasis: 0, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#47698A" }}>Find a class</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 46, flexGrow: 1, flexBasis: 0, backgroundColor: "transparent", borderRadius: 999, flexShrink: 1 }}>{/* -> S14-Credentials.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#A1321F" }}>Remove</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
