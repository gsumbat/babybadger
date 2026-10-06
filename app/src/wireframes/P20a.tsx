// GENERATED from wireframe P20a-RoutineItem.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 2.5h6M10 2.5v3l-2 2.5V20a1.5 1.5 0 0 0 1.5 1.5h5A1.5 1.5 0 0 0 16 20V8l-2-2.5v-3\"></path><path d=\"M8 12h8\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 3v8a2 2 0 0 0 2 2v8M9 3v8a2 2 0 0 1-2 2M7 3v6M16 21V3c2.5 1.5 3.5 4 3.5 7s-1.5 4-3.5 4\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M3 12h18v2a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6z\"></path><path d=\"M6 12V5.5A2.5 2.5 0 0 1 10.5 4\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><rect x=\"3\" y=\"8.5\" width=\"18\" height=\"7\" rx=\"3.5\" transform=\"rotate(-35 12 12)\"></rect><path d=\"M9.5 8.5l5 7\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M3.5 9.5c5 1 12 1 17 0M3.5 14.5c5-1 12-1 17 0\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 5v14M5 12h14\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"position: absolute; right: 12px; top: 15px; fill: none; stroke: #4B5960; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; pointer-events: none\"><path d=\"M6 9l6 6 6-6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"position: absolute; right: 12px; top: 15px; fill: none; stroke: #4B5960; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; pointer-events: none\"><path d=\"M6 9l6 6 6-6\"></path></svg>"
];

/** Routine item */
export default function WF_P20a() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ width: 60, flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#47698A", textDecorationLine: "underline" }}>Cancel</Text></View>
        <Text style={{ fontFamily: font.display, fontSize: 20, color: "#1B2328", textAlign: "center", flexGrow: 1, flexShrink: 1 }}>Bedtime</Text>
        <View style={{ width: 60, flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#47698A", textAlign: "right", textDecorationLine: "underline" }}>Save</Text></View>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 6, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6 }}>TYPE</Text>
        <View style={{ flexDirection: "column", gap: 8 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, height: 64, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <SvgXml xml={SVG[0]} width={22} height={22} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 12, color: "#1B2328" }}>Nap</Text>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, height: 64, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <SvgXml xml={SVG[1]} width={22} height={22} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 12, color: "#1B2328" }}>Bottle</Text>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, height: 64, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <SvgXml xml={SVG[2]} width={22} height={22} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 12, color: "#1B2328" }}>Meal</Text>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, height: 64, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <SvgXml xml={SVG[3]} width={22} height={22} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 12, color: "#1B2328" }}>Diaper</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, height: 64, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 2.0, borderColor: "#47698A", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <SvgXml xml={SVG[4]} width={22} height={22} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 12, color: "#47698A" }}>Bedtime</Text>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, height: 64, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <SvgXml xml={SVG[5]} width={22} height={22} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 12, color: "#1B2328" }}>Medicine</Text>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, height: 64, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <SvgXml xml={SVG[6]} width={22} height={22} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 12, color: "#1B2328" }}>Activity</Text>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, height: 64, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <SvgXml xml={SVG[7]} width={22} height={22} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 12, color: "#1B2328" }}>Other</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 10 }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flexDirection: "column", gap: 6, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Starts</Text></View>
              <View style={{ flexDirection: "column" }}>
                <TextInput placeholder="" defaultValue="" placeholderTextColor="#6B7980" style={{ width: "100%", height: 48, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
                <SvgXml xml={SVG[8]} width={18} height={18} />
              </View>
            </View>
            <View style={{ flexDirection: "column", gap: 6, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Lights out by</Text></View>
              <View style={{ flexDirection: "column" }}>
                <TextInput placeholder="" defaultValue="" placeholderTextColor="#6B7980" style={{ width: "100%", height: 48, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
                <SvgXml xml={SVG[9]} width={18} height={18} />
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 6 }}>
          <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Repeats</Text>
          <View style={{ flexDirection: "column", gap: 6 }}>
            <View style={{ flexDirection: "row", gap: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 40, backgroundColor: "#47698A", borderRadius: 20, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#FFFFFF" }}>S</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 40, backgroundColor: "#47698A", borderRadius: 20, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#FFFFFF" }}>M</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 40, backgroundColor: "#47698A", borderRadius: 20, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#FFFFFF" }}>T</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 40, backgroundColor: "#47698A", borderRadius: 20, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#FFFFFF" }}>W</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 40, backgroundColor: "#47698A", borderRadius: 20, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#FFFFFF" }}>T</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 40, backgroundColor: "#47698A", borderRadius: 20, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#FFFFFF" }}>F</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 40, backgroundColor: "#47698A", borderRadius: 20, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#FFFFFF" }}>S</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 6 }}>
          <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>How to do it</Text></View>
          <TextInput placeholder="" defaultValue="Bath, pajamas, 4 oz bottle, two books. Blue bunny in the crib. White noise on." placeholderTextColor="#6B7980" style={{ paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 15, color: "#1B2328", lineHeight: 21 }} />
        </View>
        <View style={{ flexDirection: "column", paddingTop: 0, paddingRight: 16, paddingBottom: 0, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 60, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Remind the sitter</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>15 min before</Text>
            </View>
            <View style={{ width: 50, height: 30, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 15, flexDirection: "column" }}>
              <View style={{ width: 24, height: 24, top: 3, right: 3, backgroundColor: "#FFFFFF", borderRadius: 12, position: "absolute", flexDirection: "column" }}>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 60 }}>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Sitter logs it</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Time she fell asleep goes in the report</Text>
            </View>
            <View style={{ width: 50, height: 30, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 15, flexDirection: "column" }}>
              <View style={{ width: 24, height: 24, top: 3, right: 3, backgroundColor: "#FFFFFF", borderRadius: 12, position: "absolute", flexDirection: "column" }}>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 40 }}>{/* -> P20-ChildRoutine.dc.html */}
          <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#A1321F" }}>Remove from Mia’s day</Text>
        </View>
      </View>
    </View>
  );
}
