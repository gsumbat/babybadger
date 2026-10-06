// GENERATED from wireframe S43-ShiftRules.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z\"></path><path d=\"M10 20.5a2 2 0 0 0 4 0\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M6 3v7a2 2 0 0 0 4 0V3M8 10v11M17 21V3c-2.5 1-3.5 3.5-3.5 7.5h3.5\"></path></svg>",
  "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #1B6B3D; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 8h3l2-2.5h6L17 8h3v11H4z\"></path><circle cx=\"12\" cy=\"13\" r=\"3.5\"></circle></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M10 8.5l5 3.5-5 3.5z\"></path></svg>",
  "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #1B6B3D; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M6 3v7a2 2 0 0 0 4 0V3M8 10v11M17 21V3c-2.5 1-3.5 3.5-3.5 7.5h3.5\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M8 21h8M12 17v4\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><rect x=\"7\" y=\"2.5\" width=\"10\" height=\"19\" rx=\"2.5\"></rect><path d=\"M4 4l16 16\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M5.6 5.6l12.8 12.8\"></path><path d=\"M9 10.5h6M9 13.5h4\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"9\" cy=\"8\" r=\"3.5\"></circle><path d=\"M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.8.7 3 2.3 3 4.7\"></path></svg>"
];

/** House rules on shift */
export default function WF_S43() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> S4-ActiveShift.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
          <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", marginVertical: -4.62 }}>Today’s house rules</Text>
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Lee family · on shift until 7:00</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 8, minHeight: 0, flexGrow: 1, paddingTop: 2, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 10, paddingRight: 14, paddingBottom: 10, paddingLeft: 14, backgroundColor: "#F6E3C6", borderRadius: 14 }}>
          <SvgXml xml={SVG[1]} width={20} height={20} />
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#1B2328", lineHeight: 18, flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#7A4E0E", lineHeight: 18 }}>2 logs due.</Text> Jen sees them in real time and in the shift report.</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: 2 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, flexShrink: 1 }}>LOGS</Text>
        </View>
        <View style={{ paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 52, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <SvgXml xml={SVG[2]} width={20} height={20} />
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Snack</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Ava and Leo · 3:30</Text>
            </View>
            <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 4, height: 26, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999, flexShrink: 1 }}>
              <SvgXml xml={SVG[3]} width={14} height={14} />
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>Done</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 52, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <SvgXml xml={SVG[4]} width={20} height={20} />
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Leo’s nap</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Started around 3:45?</Text>
            </View>
            <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 34, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> S45-LogNap.dc.html */}
              <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#FFFFFF" }}>Log now</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 52, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <SvgXml xml={SVG[5]} width={20} height={20} />
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Photo update</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Last one 2 h ago</Text>
            </View>
            <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 34, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> S47-PhotoUpdate.dc.html */}
              <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#FFFFFF" }}>Log now</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 52, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <SvgXml xml={SVG[6]} width={20} height={20} />
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Activities</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>1 logged · park</Text>
            </View>
            <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 4, height: 26, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999, flexShrink: 1 }}>
              <SvgXml xml={SVG[7]} width={14} height={14} />
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>Done</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 52 }}>
            <SvgXml xml={SVG[8]} width={20} height={20} />
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Dinner</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>At 6:00</Text>
            </View>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960", flexShrink: 1 }}>Later</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 8, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 }}>
              <SvgXml xml={SVG[9]} width={20} height={20} />
              <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328" }}>Kids’ screen time today</Text>
            </View>
            <Text style={{ fontFamily: font.display, fontSize: 17, color: "#1B2328", flexShrink: 1 }}>10 / 30 min</Text>
          </View>
          <View style={{ height: 8, backgroundColor: "#E8ECF1", borderRadius: 4, overflow: "hidden", flexShrink: 1, minHeight: 0, flexDirection: "column" }}>
            <View style={{ width: "33%", height: 8, backgroundColor: "#47698A", flexDirection: "column" }}>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 40, backgroundColor: "#DCE7F1", borderRadius: 999 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#47698A" }}>Start screen time</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: 2 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, flexShrink: 1 }}>REMEMBER</Text>
        </View>
        <View style={{ paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 46, paddingTop: 3, paddingRight: 0, paddingBottom: 3, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <SvgXml xml={SVG[10]} width={20} height={20} />
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328", lineHeight: 18 }}>Your phone: emergencies and our messages</Text>
            </View>
            <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 24, flexShrink: 0, paddingTop: 0, paddingRight: 9, paddingBottom: 0, paddingLeft: 9, backgroundColor: "#47698A", borderRadius: 999 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#FFFFFF" }}>Must</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 46, paddingTop: 3, paddingRight: 0, paddingBottom: 3, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <SvgXml xml={SVG[11]} width={20} height={20} />
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328", lineHeight: 18 }}>No social media, never post the kids</Text>
            </View>
            <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 24, flexShrink: 0, paddingTop: 0, paddingRight: 9, paddingBottom: 0, paddingLeft: 9, backgroundColor: "#47698A", borderRadius: 999 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#FFFFFF" }}>Must</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 46, paddingTop: 3, paddingRight: 0, paddingBottom: 3, paddingLeft: 0 }}>
            <SvgXml xml={SVG[12]} width={20} height={20} />
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328", lineHeight: 18 }}>No visitors · ask before leaving the house</Text>
            </View>
            <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 24, flexShrink: 0, paddingTop: 0, paddingRight: 9, paddingBottom: 0, paddingLeft: 9, backgroundColor: "#47698A", borderRadius: 999 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#FFFFFF" }}>Must</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "row", paddingTop: 4, paddingRight: 20, paddingBottom: 26, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>{/* -> S4-ActiveShift.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#47698A" }}>Back to shift</Text>
        </View>
      </View>
    </View>
  );
}
