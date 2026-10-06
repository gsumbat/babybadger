// GENERATED from wireframe S4-ActiveShift.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 16v-3.5L6 7h12l2 5.5V16zM4 16v2.5M20 16v2.5M7.5 13h0M16.5 13h0\"></path></svg>",
  "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M6 3v7a2 2 0 0 0 4 0V3M8 10v11M17 21V3c-2.5 1-3.5 3.5-3.5 7.5h3.5\"></path></svg>",
  "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><rect x=\"3\" y=\"7\" width=\"18\" height=\"13\" rx=\"2.5\"></rect><circle cx=\"12\" cy=\"13.5\" r=\"3.5\"></circle><path d=\"M8.5 7l1.5-2.5h4L15.5 7\"></path></svg>",
  "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 5v14M5 12h14\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z\"></path><path d=\"M10 20.5a2 2 0 0 0 4 0\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>"
];

/** Active shift */
export default function WF_S4() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "column", gap: 6, paddingTop: 24, paddingRight: 20, paddingBottom: 56, paddingLeft: 20, backgroundColor: "#47698A" }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#FFFFFF", flexShrink: 1 }}>On shift · The Lee family</Text>
          <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, height: 28, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#FFFFFF", borderRadius: 999, flexShrink: 1 }}>
            <View style={{ width: 8, height: 8, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#47698A" }}>Sharing location</Text>
          </View>
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 44, color: "#FFFFFF", marginVertical: -9.24, letterSpacing: 1 }}>01:12:45</Text>
        <Text style={{ fontFamily: font.body, fontSize: 14, color: "#FFFFFF", opacity: 0.85 }}>Ends 7:00 PM · Ava and Leo</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 10, flexGrow: 1, marginTop: -36, paddingTop: 0, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", gap: 8 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, height: 76, backgroundColor: "#FFFFFF", borderRadius: 24, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, ...cardShadow }}>{/* -> S8-StartTrip.dc.html */}
              <SvgXml xml={SVG[0]} width={24} height={24} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>Trip</Text>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, height: 76, backgroundColor: "#FFFFFF", borderRadius: 24, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, ...cardShadow }}>{/* -> S5-LogFood.dc.html */}
              <SvgXml xml={SVG[1]} width={24} height={24} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>Food</Text>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, height: 76, backgroundColor: "#FFFFFF", borderRadius: 24, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, ...cardShadow }}>{/* -> S47-PhotoUpdate.dc.html */}
              <SvgXml xml={SVG[2]} width={24} height={24} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>Photo</Text>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, height: 76, backgroundColor: "#FFFFFF", borderRadius: 24, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, ...cardShadow }}>{/* -> S44-AddLog.dc.html */}
              <SvgXml xml={SVG[3]} width={24} height={24} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>More logs</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", paddingTop: 6, paddingRight: 16, paddingBottom: 6, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 10, paddingRight: 0, paddingBottom: 10, paddingLeft: 0 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Tasks from Jen</Text>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", flexShrink: 1 }}>1 of 4</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 52, borderTopWidth: 1.0, borderTopColor: "#EEF1F4" }}>
            <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#47698A", backgroundColor: "#47698A", alignItems: "center", justifyContent: "center" }}><SvgXml xml={CHECK} width={16} height={16} /></View>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.body, fontSize: 15, color: "#6B7980", textDecorationLine: "line-through" }}>Pick up Ava</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#6B7980" }}>Done 3:24 PM</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 52, borderTopWidth: 1.0, borderTopColor: "#EEF1F4" }}>
            <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#C3CCD5", backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }}></View>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyMedium, fontSize: 15, color: "#1B2328" }}>Snack</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#6B7980" }}>3:30 PM · log what they ate</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 52, borderTopWidth: 1.0, borderTopColor: "#EEF1F4" }}>
            <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#C3CCD5", backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }}></View>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyMedium, fontSize: 15, color: "#1B2328" }}>Leave for soccer</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#6B7980" }}>4:10 PM · starts a trip</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 52, borderTopWidth: 1.0, borderTopColor: "#EEF1F4" }}>
            <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#C3CCD5", backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }}></View>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyMedium, fontSize: 15, color: "#1B2328" }}>Dinner</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#6B7980" }}>6:00 PM · see meal plan</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 10, paddingRight: 14, paddingBottom: 10, paddingLeft: 14, backgroundColor: "#F6E3C6", borderRadius: 12 }}>{/* -> S43-ShiftRules.dc.html */}
          <SvgXml xml={SVG[4]} width={20} height={20} />
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#7A4E0E" }}>House rules</Text> · 2 logs due</Text>
          <SvgXml xml={SVG[5]} width={18} height={18} />
        </View>
        <View style={{ paddingTop: 10, paddingRight: 14, paddingBottom: 10, paddingLeft: 14, backgroundColor: "#F6DCD6", borderRadius: 12 }}><Text style={{ fontFamily: font.body, fontSize: 14, color: "#6E2215" }}><Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#A1321F" }}>Leo · food to avoid:</Text> [listed foods]</Text></View>
      </View>
      <View style={{ paddingTop: 8, paddingRight: 20, paddingBottom: 32, paddingLeft: 20, flexDirection: "column" }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: "100%", height: 52, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.5, borderColor: "#47698A" }}>{/* -> S9-EndShift.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#47698A" }}>Clock out</Text>
        </View>
      </View>
    </View>
  );
}
