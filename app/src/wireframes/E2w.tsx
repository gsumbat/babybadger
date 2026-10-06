// GENERATED from wireframe E2w-BookShiftWhere.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M6 9l6 6 6-6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M6 9l6 6 6-6\"></path></svg>",
  "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>"
];

/** Book a Shift · Where */
export default function WF_E2w() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> P6b-CalWeek.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", marginVertical: -4.62, flexGrow: 1, flexShrink: 1 }}>Book a shift</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 12, minHeight: 0, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, marginTop: 4 }}>SITTER</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, height: 44, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 6, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 2.0, borderColor: "#47698A", flexShrink: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 30, height: 30, backgroundColor: "#47698A", borderRadius: 15, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.displayBold, fontSize: 13, color: "#FFFFFF" }}>M</Text>
            </View>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Maya</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, height: 44, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 6, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 30, height: 30, backgroundColor: "#47698A", borderRadius: 15, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.displayBold, fontSize: 13, color: "#FFFFFF" }}>D</Text>
            </View>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Dani</Text>
          </View>
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, marginTop: 4 }}>DAY</Text>
        <View style={{ flexDirection: "row", gap: 4 }}>
          <View style={{ flexDirection: "column", alignItems: "center", gap: 2, flexGrow: 1, flexBasis: 0, paddingTop: 8, paddingRight: 0, paddingBottom: 8, paddingLeft: 0, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74" }}>Tue</Text>
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62 }}>6</Text>
          </View>
          <View style={{ flexDirection: "column", alignItems: "center", gap: 2, flexGrow: 1, flexBasis: 0, paddingTop: 8, paddingRight: 0, paddingBottom: 8, paddingLeft: 0, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74" }}>Wed</Text>
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62 }}>7</Text>
          </View>
          <View style={{ flexDirection: "column", alignItems: "center", gap: 2, flexGrow: 1, flexBasis: 0, paddingTop: 8, paddingRight: 0, paddingBottom: 8, paddingLeft: 0, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74" }}>Thu</Text>
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62 }}>8</Text>
          </View>
          <View style={{ flexDirection: "column", alignItems: "center", gap: 2, flexGrow: 1, flexBasis: 0, paddingTop: 8, paddingRight: 0, paddingBottom: 8, paddingLeft: 0, backgroundColor: "#47698A", borderRadius: 14, borderWidth: 1.0, borderColor: "#47698A", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#FFFFFF" }}>Fri</Text>
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF", marginVertical: -3.62 }}>9</Text>
          </View>
          <View style={{ flexDirection: "column", alignItems: "center", gap: 2, flexGrow: 1, flexBasis: 0, paddingTop: 8, paddingRight: 0, paddingBottom: 8, paddingLeft: 0, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74" }}>Sat</Text>
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62 }}>10</Text>
          </View>
          <View style={{ flexDirection: "column", alignItems: "center", gap: 2, flexGrow: 1, flexBasis: 0, paddingTop: 8, paddingRight: 0, paddingBottom: 8, paddingLeft: 0, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74" }}>Sun</Text>
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62 }}>11</Text>
          </View>
          <View style={{ flexDirection: "column", alignItems: "center", gap: 2, flexGrow: 1, flexBasis: 0, paddingTop: 8, paddingRight: 0, paddingBottom: 8, paddingLeft: 0, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74" }}>Mon</Text>
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62 }}>12</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flexDirection: "column", gap: 6, minWidth: 0, flexGrow: 1, flexBasis: 0, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Starts</Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 48, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5" }}>
              <Text style={{ fontFamily: font.body, fontSize: 16, color: "#1B2328", flexShrink: 1 }}>3:00 PM</Text>
              <SvgXml xml={SVG[1]} width={18} height={18} />
            </View>
          </View>
          <View style={{ flexDirection: "column", gap: 6, minWidth: 0, flexGrow: 1, flexBasis: 0, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Ends</Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 48, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5" }}>
              <Text style={{ fontFamily: font.body, fontSize: 16, color: "#1B2328", flexShrink: 1 }}>7:00 PM</Text>
              <SvgXml xml={SVG[2]} width={18} height={18} />
            </View>
          </View>
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, marginTop: 4 }}>KIDS</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 36, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 1.5, borderColor: "#47698A", flexShrink: 1 }}>
            <SvgXml xml={SVG[3]} width={14} height={14} />
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#34526E" }}>Ava</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 36, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 1.5, borderColor: "#47698A", flexShrink: 1 }}>
            <SvgXml xml={SVG[4]} width={14} height={14} />
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#34526E" }}>Leo</Text>
          </View>
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, marginTop: 4 }}>WHERE</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 36, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Home</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 36, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 1.5, borderColor: "#47698A", flexShrink: 1 }}>
            <SvgXml xml={SVG[5]} width={14} height={14} />
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#34526E" }}>Sam's apartment</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 6 }}>
          <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Tasks, one per line</Text></View>
          <TextInput placeholder="" defaultValue="3:30 Snack \u00b7 Ava\n6:00 Dinner\n6:45 Bath \u00b7 Leo" placeholderTextColor="#6B7980" style={{ minHeight: 90, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#1B2328", lineHeight: 22 }} />
        </View>
      </View>
      <View style={{ flexDirection: "row", paddingTop: 8, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> P5b-BookedShift.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Book shift</Text>
        </View>
      </View>
    </View>
  );
}
