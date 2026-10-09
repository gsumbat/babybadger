// GENERATED from wireframe S42-HouseRules.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M6 3v7a2 2 0 0 0 4 0V3M8 10v11M17 21V3c-2.5 1-3.5 3.5-3.5 7.5h3.5\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M10 8.5l5 3.5-5 3.5z\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 8h3l2-2.5h6L17 8h3v11H4z\"></path><circle cx=\"12\" cy=\"13\" r=\"3.5\"></circle></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><rect x=\"7\" y=\"2.5\" width=\"10\" height=\"19\" rx=\"2.5\"></rect><path d=\"M4 4l16 16\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M5.6 5.6l12.8 12.8\"></path><path d=\"M9 10.5h6M9 13.5h4\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M8 21h8M12 17v4\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"9\" cy=\"8\" r=\"3.5\"></circle><path d=\"M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.8.7 3 2.3 3 4.7\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M6 21V4h10v17M4 21h16\"></path><path d=\"M13 12.5h0\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M3 11l9-7 9 7v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z\"></path></svg>"
];

/** Family house rules (sitter) */
export default function WF_S42() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> S27-FamilyRequirements.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
          <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", marginVertical: -4.62 }}>The Lees’ house rules</Text>
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Read before your first shift</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 8, minHeight: 0, flexGrow: 1, paddingTop: 2, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ paddingTop: 10, paddingRight: 14, paddingBottom: 10, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 14 }}><Text style={{ fontFamily: font.body, fontSize: 13, color: "#1B2328", lineHeight: 18 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#34526E", lineHeight: 18 }}>7 must-dos, 3 wishes.</Text> Logs take a tap in the app; you’ll get reminders during the shift.</Text></View>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: 14 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, flexShrink: 1 }}>UPDATES AND LOGS</Text>
        </View>
        <View style={{ paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 40, paddingTop: 2, paddingRight: 0, paddingBottom: 2, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <SvgXml xml={SVG[1]} width={20} height={20} />
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328", lineHeight: 18 }}>Log meals and snacks</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", lineHeight: 16 }}>Tap Food during the shift</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", height: 24, flexShrink: 0, paddingTop: 0, paddingRight: 9, paddingBottom: 0, paddingLeft: 9, backgroundColor: "#47698A", borderRadius: 999 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#FFFFFF" }}>Must</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 40, paddingTop: 2, paddingRight: 0, paddingBottom: 2, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <SvgXml xml={SVG[2]} width={20} height={20} />
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328", lineHeight: 18 }}>Log naps and sleep</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", lineHeight: 16 }}>Start and end time</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", height: 24, flexShrink: 0, paddingTop: 0, paddingRight: 9, paddingBottom: 0, paddingLeft: 9, backgroundColor: "#47698A", borderRadius: 999 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#FFFFFF" }}>Must</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 40, paddingTop: 2, paddingRight: 0, paddingBottom: 2, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <SvgXml xml={SVG[3]} width={20} height={20} />
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328", lineHeight: 18 }}>Log activities</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", height: 24, flexShrink: 0, paddingTop: 0, paddingRight: 9, paddingBottom: 0, paddingLeft: 9, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#4B5960" }}>Prefer</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 40, paddingTop: 2, paddingRight: 0, paddingBottom: 2, paddingLeft: 0 }}>
            <SvgXml xml={SVG[4]} width={20} height={20} />
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328", lineHeight: 18 }}>Photo update every 2 hours</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", height: 24, flexShrink: 0, paddingTop: 0, paddingRight: 9, paddingBottom: 0, paddingLeft: 9, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#4B5960" }}>Prefer</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: 14 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, flexShrink: 1 }}>PHONE AND SCREENS</Text>
        </View>
        <View style={{ paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 40, paddingTop: 2, paddingRight: 0, paddingBottom: 2, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <SvgXml xml={SVG[5]} width={20} height={20} />
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328", lineHeight: 18 }}>Your phone: emergencies and our messages</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", height: 24, flexShrink: 0, paddingTop: 0, paddingRight: 9, paddingBottom: 0, paddingLeft: 9, backgroundColor: "#47698A", borderRadius: 999 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#FFFFFF" }}>Must</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 40, paddingTop: 2, paddingRight: 0, paddingBottom: 2, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <SvgXml xml={SVG[6]} width={20} height={20} />
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328", lineHeight: 18 }}>No social media, never post the kids</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", height: 24, flexShrink: 0, paddingTop: 0, paddingRight: 9, paddingBottom: 0, paddingLeft: 9, backgroundColor: "#47698A", borderRadius: 999 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#FFFFFF" }}>Must</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 40, paddingTop: 2, paddingRight: 0, paddingBottom: 2, paddingLeft: 0 }}>
            <SvgXml xml={SVG[7]} width={20} height={20} />
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328", lineHeight: 18 }}>Kids’ screen time: 30 min a day</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", height: 24, flexShrink: 0, paddingTop: 0, paddingRight: 9, paddingBottom: 0, paddingLeft: 9, backgroundColor: "#47698A", borderRadius: 999 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#FFFFFF" }}>Must</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: 14 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, flexShrink: 1 }}>SAFETY AND HOME</Text>
        </View>
        <View style={{ paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 40, paddingTop: 2, paddingRight: 0, paddingBottom: 2, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <SvgXml xml={SVG[8]} width={20} height={20} />
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328", lineHeight: 18 }}>No visitors without asking</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", height: 24, flexShrink: 0, paddingTop: 0, paddingRight: 9, paddingBottom: 0, paddingLeft: 9, backgroundColor: "#47698A", borderRadius: 999 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#FFFFFF" }}>Must</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 40, paddingTop: 2, paddingRight: 0, paddingBottom: 2, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <SvgXml xml={SVG[9]} width={20} height={20} />
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328", lineHeight: 18 }}>Ask before leaving the house</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", height: 24, flexShrink: 0, paddingTop: 0, paddingRight: 9, paddingBottom: 0, paddingLeft: 9, backgroundColor: "#47698A", borderRadius: 999 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#FFFFFF" }}>Must</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 40, paddingTop: 2, paddingRight: 0, paddingBottom: 2, paddingLeft: 0 }}>
            <SvgXml xml={SVG[10]} width={20} height={20} />
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328", lineHeight: 18 }}>Tidy toys and dishes before you go</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", height: 24, flexShrink: 0, paddingTop: 0, paddingRight: 9, paddingBottom: 0, paddingLeft: 9, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#4B5960" }}>Prefer</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 2 }}>
          <View style={{ width: 26, height: 26, flexShrink: 0, borderRadius: 8, borderWidth: 2.0, borderColor: "#C3CCD5", flexDirection: "column" }}>
          </View>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20, flexShrink: 1 }}>I’ve read the Lee family’s house rules and agree to the must-dos</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 2, paddingTop: 4, paddingRight: 20, paddingBottom: 24, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> S2-Consent.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Agree and continue</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 36 }}>{/* -> S37-Messages.dc.html */}
          <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#47698A", textDecorationLine: "underline" }}>Ask Jen about a rule</Text>
        </View>
      </View>
    </View>
  );
}
