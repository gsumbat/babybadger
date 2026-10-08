// GENERATED from wireframe P5k-AvaReport.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"350\" height=\"130\" viewBox=\"0 0 350 130\"><rect x=\"230\" y=\"10\" width=\"90\" height=\"50\" rx=\"8\" style=\"fill: #D7EAD9\"></rect><path d=\"M0 45H350M0 100H350M120 0V130M250 0V130\" style=\"stroke: #FFFFFF; stroke-width: 8; fill: none\"></path><path d=\"M50 110 C90 100 120 70 170 70 S 250 40 280 35\" style=\"fill: none; stroke: #47698A; stroke-width: 3.5; stroke-linecap: round\"></path><rect x=\"42\" y=\"102\" width=\"16\" height=\"16\" rx=\"4\" style=\"fill: #FFFFFF; stroke: #1B2328; stroke-width: 2\"></rect><circle cx=\"280\" cy=\"35\" r=\"8\" style=\"fill: #E8B9BE; stroke: #FFFFFF; stroke-width: 3\"></circle></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3l9.5 17h-19z\"></path><path d=\"M12 10v4M12 17.5h0\"></path></svg>"
];

/** Ava’s report */
export default function WF_P5k() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> P55-ChildProfile.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <View style={{ flexDirection: "column", flexShrink: 1 }}>
          <Text style={{ fontFamily: font.display, fontSize: 20, color: "#1B2328" }}>Ava’s report</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>Maya · Thu, Oct 1</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 0, paddingRight: 20, paddingBottom: 20, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", gap: 12, paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, backgroundColor: "#47698A", borderRadius: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#FFFFFF", opacity: 0.8 }}>Time worked</Text>
              <Text style={{ fontFamily: font.display, fontSize: 32, color: "#FFFFFF", marginVertical: -6.63 }}>4 h 02 m</Text>
            </View>
            <View style={{ flexDirection: "column", alignItems: "flex-end", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#FFFFFF", opacity: 0.8 }}>3:02 – 7:04 PM</Text>
              <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>[TOTAL PAY]</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 48, backgroundColor: "#FFFFFF", borderRadius: 999 }}>{/* -> P33-InvoicePay.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#47698A" }}>Approve hours</Text>
          </View>
        </View>
        <View style={{ height: 130, backgroundColor: "#E7EDEB", borderRadius: 20, borderWidth: 1.0, borderColor: "#E6EAEF", overflow: "hidden", flexShrink: 1, minHeight: 0, flexDirection: "column" }}>
          <SvgXml xml={SVG[1]} width={350} height={130} />
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 36, right: 10, bottom: 10, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#FFFFFF", borderRadius: 10, position: "absolute" }}>{/* -> P8-Trip.dc.html */}
            <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#47698A" }}>Replay route</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 10, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Tasks</Text>
            <View style={{ flexDirection: "row", alignItems: "center", height: 24, paddingTop: 0, paddingRight: 8, paddingBottom: 0, paddingLeft: 8, backgroundColor: "#DCEEE3", borderRadius: 999, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>4 of 4 done</Text>
            </View>
          </View>
          <View style={{}}><Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", lineHeight: 20 }}>Pick up Ava · Snack · Soccer at 4:30 · Dinner</Text></View>
        </View>
        <View style={{ flexDirection: "column", gap: 8, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>{/* -> P77k-AvaLog.dc.html */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Logs</Text>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#47698A", flexShrink: 1 }}>See all 5 ›</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ width: 40, flexShrink: 0 }}><Text style={{ fontFamily: font.body, fontSize: 14, color: "#6B7980" }}>3:24</Text></View>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>Picked up Ava</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ width: 40, flexShrink: 0 }}><Text style={{ fontFamily: font.body, fontSize: 14, color: "#6B7980" }}>3:30</Text></View>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>Snack · Ava ate all</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ width: 40, flexShrink: 0 }}><Text style={{ fontFamily: font.body, fontSize: 14, color: "#6B7980" }}>4:30</Text></View>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>Park, 1 h · both</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ width: 40, flexShrink: 0 }}><Text style={{ fontFamily: font.body, fontSize: 14, color: "#6B7980" }}>4:32</Text></View>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>Photo · both</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ width: 40, flexShrink: 0 }}><Text style={{ fontFamily: font.body, fontSize: 14, color: "#6B7980" }}>6:05</Text></View>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>Pasta, peas · both ate most</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 8, paddingRight: 10, paddingBottom: 8, paddingLeft: 10, backgroundColor: "#F6E3C6", borderRadius: 10 }}>
            <SvgXml xml={SVG[2]} width={16} height={16} />
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#1B2328", flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#7A4E0E" }}>House rules 9 of 10.</Text> Missed the 6:30 photo update.</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 10, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328" }}>Notes</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", lineHeight: 20 }}>[Maya's end-of-shift note]</Text>
        </View>
        <View style={{ flexDirection: "column", gap: 10, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328" }}>Photos</Text>
          <View style={{ flexDirection: "column", gap: 8 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ height: 64, backgroundColor: "#F3E1E3", borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, flexDirection: "column" }}>
              </View>
              <View style={{ height: 64, backgroundColor: "#DCE7F1", borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, flexDirection: "column" }}>
              </View>
              <View style={{ height: 64, borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, flexDirection: "column" }}>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
