// GENERATED from wireframe S44-AddLog.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M6 3v7a2 2 0 0 0 4 0V3M8 10v11M17 21V3c-2.5 1-3.5 3.5-3.5 7.5h3.5\"></path></svg>",
  "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z\"></path></svg>",
  "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M10 8.5l5 3.5-5 3.5z\"></path></svg>",
  "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><rect x=\"3\" y=\"7\" width=\"18\" height=\"13\" rx=\"2.5\"></rect><circle cx=\"12\" cy=\"13.5\" r=\"3.5\"></circle><path d=\"M8.5 7l1.5-2.5h4L15.5 7\"></path></svg>",
  "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M3.5 7h17v3a8.5 8.5 0 0 1-17 0z\"></path><path d=\"M8 7v3M16 7v3\"></path></svg>",
  "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M6 3h9l4 4v14H6zM9.5 12h6M9.5 16h6\"></path></svg>"
];

/** Add a log */
export default function WF_S44() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "column", justifyContent: "flex-end", flexGrow: 1, backgroundColor: "#5E6B70" }}>
        <View style={{ flexDirection: "column", gap: 14, paddingTop: 12, paddingRight: 20, paddingBottom: 30, paddingLeft: 20, backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
          <View style={{ alignSelf: "center", width: 40, height: 5, backgroundColor: "#C3CCD5", borderRadius: 3, flexDirection: "column" }}>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexShrink: 1 }}>Add a log</Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> S4-ActiveShift.dc.html */}
              <Text style={{ fontFamily: font.body, fontSize: 20, color: "#1B2328" }}>×</Text>
            </View>
          </View>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", marginTop: -6 }}>The Lees asked for meals, naps, activities and a photo every 2 hours.</Text>
          <View style={{ flexDirection: "column", gap: 10 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, height: 92, backgroundColor: "#DCE7F1", borderRadius: 20, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S5-LogFood.dc.html */}
                <SvgXml xml={SVG[0]} width={28} height={28} />
                <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#34526E" }}>Food</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, height: 92, backgroundColor: "#DCE7F1", borderRadius: 20, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S45-LogNap.dc.html */}
                <SvgXml xml={SVG[1]} width={28} height={28} />
                <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#34526E" }}>Nap</Text>
                <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 20, top: 8, right: 8, paddingTop: 0, paddingRight: 7, paddingBottom: 0, paddingLeft: 7, backgroundColor: "#F6E3C6", borderRadius: 999, position: "absolute" }}>
                  <Text style={{ fontFamily: font.display, fontSize: 10, color: "#7A4E0E" }}>DUE</Text>
                </View>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, height: 92, backgroundColor: "#DCE7F1", borderRadius: 20, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S46-LogActivity.dc.html */}
                <SvgXml xml={SVG[2]} width={28} height={28} />
                <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#34526E" }}>Activity</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, height: 92, backgroundColor: "#DCE7F1", borderRadius: 20, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S47-PhotoUpdate.dc.html */}
                <SvgXml xml={SVG[3]} width={28} height={28} />
                <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#34526E" }}>Photo</Text>
                <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 20, top: 8, right: 8, paddingTop: 0, paddingRight: 7, paddingBottom: 0, paddingLeft: 7, backgroundColor: "#F6E3C6", borderRadius: 999, position: "absolute" }}>
                  <Text style={{ fontFamily: font.display, fontSize: 10, color: "#7A4E0E" }}>DUE</Text>
                </View>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, height: 92, backgroundColor: "#DCE7F1", borderRadius: 20, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S48-LogDiaper.dc.html */}
                <SvgXml xml={SVG[4]} width={28} height={28} />
                <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#34526E" }}>Diaper</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, height: 92, backgroundColor: "#DCE7F1", borderRadius: 20, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S49-LogNote.dc.html */}
                <SvgXml xml={SVG[5]} width={28} height={28} />
                <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#34526E" }}>Note</Text>
              </View>
            </View>
          </View>
          <View style={{}}><Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#47698A", textAlign: "center", textDecorationLine: "underline" }}>See what’s due</Text></View>
        </View>
      </View>
    </View>
  );
}
