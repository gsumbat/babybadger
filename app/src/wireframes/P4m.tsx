// GENERATED from wireframe P4m-HomeHelper.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\"></path><rect x=\"8\" y=\"2\" width=\"8\" height=\"4\" rx=\"1\" ry=\"1\"></rect><path d=\"M9 12h6M9 16h4\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6h11M9 12h11M9 18h11M4.5 6h0M4.5 12h0M4.5 18h0\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><rect x=\"7\" y=\"2.5\" width=\"10\" height=\"19\" rx=\"2.5\"></rect><path d=\"M11 18.5h2\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"9\" cy=\"8\" r=\"3.5\"></circle><path d=\"M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.8.7 3 2.3 3 4.7\"></path></svg>"
];

/** Home · read only */
export default function WF_P4m() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 20, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", flexShrink: 1 }}>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>Thursday morning</Text>
          <Text style={{ fontFamily: font.display, fontSize: 24, color: "#1B2328" }}>The Lee family</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, backgroundColor: "#1B2328", borderRadius: 22, flexShrink: 1 }}>{/* -> P12-Settings.dc.html */}
          <Text style={{ fontFamily: font.bodyBold, fontSize: 16, color: "#FFFFFF" }}>SB</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 10, flexGrow: 1, paddingTop: 0, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", gap: 10, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>{/* -> P4c-HomeSoon.dc.html */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, flexShrink: 1 }}>NEXT SHIFT</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>Confirmed</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 48, height: 48, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 24 }}>
              <Text style={{ fontFamily: font.display, fontSize: 21, color: "#FFFFFF" }}>M</Text>
            </View>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.display, fontSize: 20, color: "#1B2328", marginVertical: -4.02 }}>Today · 3:00 – 7:00 PM</Text>
              <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>Maya with Ava and Leo · 4 tasks</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, flexShrink: 1 }}>KIDS RIGHT NOW</Text>
        </View>
        <View style={{ flexDirection: "column", paddingTop: 0, paddingRight: 16, paddingBottom: 0, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 64, paddingTop: 12, paddingRight: 0, paddingBottom: 12, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> P55-ChildProfile.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#E8B9BE", borderRadius: 18 }}>
              <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#8A3F5A" }}>A</Text>
            </View>
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Ava · Lincoln Elementary</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", lineHeight: 17, marginTop: 2 }}>From her phone · 5 min ago · 64%</Text>
            </View>
            <SvgXml xml={SVG[0]} width={18} height={18} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 64, paddingTop: 12, paddingRight: 0, paddingBottom: 12, paddingLeft: 0 }}>{/* -> P64-LeoProfile.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#2F6FD6", borderRadius: 18 }}>
              <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#FFFFFF" }}>L</Text>
            </View>
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Leo · Sunshine Daycare</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", lineHeight: 17, marginTop: 2 }}>From his tracker · 3 min ago · 78%</Text>
            </View>
            <SvgXml xml={SVG[1]} width={18} height={18} />
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 8, marginTop: 14 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6 }}>WHAT DO YOU NEED?</Text>
          <View style={{ flexDirection: "column", gap: 8 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: 5, height: 76, paddingTop: 17, paddingRight: 4, paddingBottom: 0, paddingLeft: 4, backgroundColor: "#DCE7F1", borderRadius: 18, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P74-HouseRules.dc.html */}
                <SvgXml xml={SVG[2]} width={22} height={22} />
                <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#34526E", lineHeight: 14, textAlign: "center" }}>House rules</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: 5, height: 76, paddingTop: 17, paddingRight: 4, paddingBottom: 0, paddingLeft: 4, backgroundColor: "#DCE7F1", borderRadius: 18, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P7-CarePlan.dc.html */}
                <SvgXml xml={SVG[3]} width={22} height={22} />
                <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#34526E", lineHeight: 14, textAlign: "center" }}>Care plan</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: 5, height: 76, paddingTop: 17, paddingRight: 4, paddingBottom: 0, paddingLeft: 4, backgroundColor: "#DCE7F1", borderRadius: 18, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P13k-Kids.dc.html */}
                <SvgXml xml={SVG[4]} width={22} height={22} />
                <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#34526E", lineHeight: 14, textAlign: "center" }}>Devices</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 12, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
          <SvgXml xml={SVG[5]} width={22} height={22} />
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#1B2328", lineHeight: 18, flexShrink: 1 }}>You have read-only access. Jen and Sam manage sitters, pay and the plan.</Text>
        </View>
      </View>
      {/* tab bar: drawn by the app's tab navigator */}
    </View>
  );
}
