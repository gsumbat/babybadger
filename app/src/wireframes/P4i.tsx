// GENERATED from wireframe P4i-LiveInjury.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #C2412D; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3l9.5 17h-19z\"></path><path d=\"M12 10v4M12 17h0\"></path></svg>",
  "<svg width=\"350\" height=\"220\" viewBox=\"0 0 350 220\"><rect x=\"196\" y=\"122\" width=\"120\" height=\"70\" rx=\"10\" style=\"fill: #D7EAD9\"></rect><path d=\"M0 170 C60 160 80 200 130 214 L130 220 L0 220z\" style=\"fill: #D3E1EC\"></path><path d=\"M0 70H350M0 150H350M90 0V220M240 0V220\" style=\"stroke: #FFFFFF; stroke-width: 10; fill: none\"></path><path d=\"M60 182 C90 180 90 150 90 120 S 140 70 186 70\" style=\"fill: none; stroke: #47698A; stroke-width: 4; stroke-linecap: round\"></path><rect x=\"48\" y=\"170\" width=\"24\" height=\"24\" rx=\"6\" style=\"fill: #FFFFFF; stroke: #1B2328; stroke-width: 2\"></rect><circle cx=\"186\" cy=\"70\" r=\"20\" style=\"fill: #47698A; fill-opacity: 0.16\"></circle><circle cx=\"186\" cy=\"70\" r=\"9\" style=\"fill: #47698A; stroke: #FFFFFF; stroke-width: 3\"></circle></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 5v14M5 12h14\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"11\" cy=\"11\" r=\"6.5\"></circle><path d=\"M16 16l4.5 4.5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6h11M9 12h11M9 18h11M4.5 6h0M4.5 12h0M4.5 18h0\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><rect x=\"7\" y=\"2.5\" width=\"10\" height=\"19\" rx=\"2.5\"></rect><path d=\"M11 18.5h2\"></path></svg>"
];

/** Live shift · injury reported */
export default function WF_P4i() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 20, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", flexShrink: 1 }}>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>Thursday afternoon</Text>
          <Text style={{ fontFamily: font.display, fontSize: 24, color: "#1B2328" }}>The Lee family</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, backgroundColor: "#1B2328", borderRadius: 22, flexShrink: 1 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 16, color: "#FFFFFF" }}>JL</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 0, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", gap: 10, paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, backgroundColor: "#F6DCD6", borderRadius: 16 }}>{/* -> P9-Alerts.dc.html */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <SvgXml xml={SVG[0]} width={22} height={22} />
            <Text style={{ fontFamily: font.bodyBold, fontSize: 16, color: "#A1321F", flexShrink: 1 }}>Injury · Leo</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#6E2215", marginLeft: "auto", flexShrink: 1 }}>4:38 PM</Text>
          </View>
          <Text style={{ fontFamily: font.body, fontSize: 15, color: "#6E2215", lineHeight: 22 }}>Slipped off the slide, scraped his knee. Cleaned it, bandage on.</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 44, flexGrow: 1, flexBasis: 0, backgroundColor: "#FFFFFF", borderRadius: 999, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.displayBold, fontSize: 15, color: "#1B2328" }}>See alerts</Text>
            </View>
            <View style={{ flexGrow: 1, flexBasis: 0, flexShrink: 1, flexDirection: "column" }}>
            </View>
          </View>
        </View>
        <View style={{ backgroundColor: "#FFFFFF", borderRadius: 24, overflow: "hidden", flexShrink: 1, minHeight: 0, flexDirection: "column", ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 22 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 16, color: "#FFFFFF" }}>M</Text>
            </View>
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328" }}>Maya is with Ava and Leo</Text>
              <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>1 h 12 m in · until 7:00 PM</Text>
            </View>
          </View>
          <View style={{ height: 220, backgroundColor: "#E7EDEB", overflow: "hidden", flexShrink: 1, minHeight: 0, flexDirection: "column" }}>
            <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, height: 28, top: 10, left: 10, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999, position: "absolute" }}>
              <View style={{ width: 8, height: 8, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B6B3D" }}>On shift</Text>
            </View>
            <SvgXml xml={SVG[1]} width={350} height={220} />
            <View style={{ top: 44, left: 204, paddingTop: 4, paddingRight: 10, paddingBottom: 4, paddingLeft: 10, backgroundColor: "#FFFFFF", borderRadius: 8, position: "absolute" }}><Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>Lincoln Elementary</Text></View>
            <View style={{ right: 10, bottom: 10, paddingTop: 4, paddingRight: 10, paddingBottom: 4, paddingLeft: 10, backgroundColor: "#FFFFFF", borderRadius: 8, position: "absolute" }}><Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Updated 1 min ago</Text></View>
          </View>
        </View>
        <View style={{ alignSelf: "center" }}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#47698A", textDecorationLine: "underline" }}>Ask Maya to stay longer</Text></View>
        <View style={{ flexDirection: "column", gap: 8 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 48, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P10-Messages.dc.html */}
              <Text style={{ fontFamily: font.displayBold, fontSize: 15, color: "#47698A" }}>Message</Text>
            </View>
            <View style={{ height: 48, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, justifyContent: "center" }}><Text style={{ fontFamily: font.displayBold, fontSize: 15, color: "#47698A" }}>Call</Text></View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 48, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P10-Messages.dc.html */}
              <Text style={{ fontFamily: font.displayBold, fontSize: 15, color: "#47698A" }}>Ask for photo</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 10, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Today's plan</Text>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", flexShrink: 1 }}>1 of 4 done</Text>
          </View>
          <View style={{ height: 6, backgroundColor: "#E8ECF1", borderRadius: 3, overflow: "hidden", flexShrink: 1, minHeight: 0, flexDirection: "column" }}>
            <View style={{ width: "25%", height: 6, backgroundColor: "#1F8A4D", flexDirection: "column" }}>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ width: 40, flexShrink: 1 }}><Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>Next</Text></View>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>4:10 Leave for soccer</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ width: 40, flexShrink: 1 }}><Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>3:24</Text></View>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Picked up Ava from school</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTopWidth: 1.0, borderTopColor: "#EEF1F4" }}>{/* -> P77-ShiftLog.dc.html */}
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328" }}>Today’s log</Text> · snack, nap, park, 1 photo</Text>
            <SvgXml xml={SVG[2]} width={18} height={18} />
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 8, marginTop: "auto", paddingTop: 0, paddingRight: 20, paddingBottom: 14, paddingLeft: 20 }}>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6 }}>WHAT DO YOU NEED?</Text>
        <View style={{ flexDirection: "column", gap: 8 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: 5, height: 70, paddingTop: 14, paddingRight: 4, paddingBottom: 0, paddingLeft: 4, backgroundColor: "#DCE7F1", borderRadius: 18, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6-Calendar.dc.html */}
              <SvgXml xml={SVG[3]} width={22} height={22} />
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#34526E", lineHeight: 14, textAlign: "center" }}>Book a shift</Text>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: 5, height: 70, paddingTop: 14, paddingRight: 4, paddingBottom: 0, paddingLeft: 4, backgroundColor: "#DCE7F1", borderRadius: 18, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P48-Find.dc.html */}
              <SvgXml xml={SVG[4]} width={22} height={22} />
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#34526E", lineHeight: 14, textAlign: "center" }}>Find a sitter</Text>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: 5, height: 70, paddingTop: 14, paddingRight: 4, paddingBottom: 0, paddingLeft: 4, backgroundColor: "#DCE7F1", borderRadius: 18, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P7-CarePlan.dc.html */}
              <SvgXml xml={SVG[5]} width={22} height={22} />
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#34526E", lineHeight: 14, textAlign: "center" }}>Care plan</Text>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: 5, height: 70, paddingTop: 14, paddingRight: 4, paddingBottom: 0, paddingLeft: 4, backgroundColor: "#DCE7F1", borderRadius: 18, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P13-KidsDevices.dc.html */}
              <SvgXml xml={SVG[6]} width={22} height={22} />
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#34526E", lineHeight: 14, textAlign: "center" }}>Kids & devices</Text>
            </View>
          </View>
        </View>
      </View>
      {/* tab bar: drawn by the app's tab navigator */}
    </View>
  );
}
