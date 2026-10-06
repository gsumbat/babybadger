// GENERATED from wireframe P20-ChildRoutine.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #5B3FA8; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"5\" cy=\"12\" r=\"1.2\"></circle><circle cx=\"12\" cy=\"12\" r=\"1.2\"></circle><circle cx=\"19\" cy=\"12\" r=\"1.2\"></circle></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 2.5h6M10 2.5v3l-2 2.5V20a1.5 1.5 0 0 0 1.5 1.5h5A1.5 1.5 0 0 0 16 20V8l-2-2.5v-3\"></path><path d=\"M8 12h8\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"5\" cy=\"12\" r=\"1.2\"></circle><circle cx=\"12\" cy=\"12\" r=\"1.2\"></circle><circle cx=\"19\" cy=\"12\" r=\"1.2\"></circle></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #5B3FA8; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"5\" cy=\"12\" r=\"1.2\"></circle><circle cx=\"12\" cy=\"12\" r=\"1.2\"></circle><circle cx=\"19\" cy=\"12\" r=\"1.2\"></circle></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"5\" cy=\"12\" r=\"1.2\"></circle><circle cx=\"12\" cy=\"12\" r=\"1.2\"></circle><circle cx=\"19\" cy=\"12\" r=\"1.2\"></circle></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M3 12h18v2a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6z\"></path><path d=\"M6 12V5.5A2.5 2.5 0 0 1 10.5 4\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"5\" cy=\"12\" r=\"1.2\"></circle><circle cx=\"12\" cy=\"12\" r=\"1.2\"></circle><circle cx=\"19\" cy=\"12\" r=\"1.2\"></circle></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 5v14M5 12h14\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z\"></path><circle cx=\"12\" cy=\"10\" r=\"2.5\"></circle></svg>"
];

/** Routine */
export default function WF_P20() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "column", gap: 14, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> P19-ChildCare.dc.html */}
            <SvgXml xml={SVG[0]} width={22} height={22} />
          </View>
          <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#4B5960", flexGrow: 1, flexShrink: 1 }}>Add a child · 3 of 4</Text>
          <View style={{ flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#47698A", textDecorationLine: "underline" }}>Cancel</Text></View>
        </View>
        <View style={{ height: 6, backgroundColor: "#DDE3EA", borderRadius: 3, overflow: "hidden", flexShrink: 1, minHeight: 0, flexDirection: "column" }}>
          <View style={{ width: "75%", height: 6, backgroundColor: "#47698A", flexDirection: "column" }}>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 8, flexGrow: 1, paddingTop: 0, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <Text style={{ fontFamily: font.display, fontSize: 26, color: "#1B2328", marginVertical: -4.83 }}>Mia’s day</Text>
        <View style={{ flexDirection: "column", gap: 4, paddingTop: 4, paddingRight: 4, paddingBottom: 4, paddingLeft: 4, backgroundColor: "#E8ECF1", borderRadius: 12 }}>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#FFFFFF", borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#1B2328" }}>Suggested for age 1</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.bodyMedium, fontSize: 13, color: "#4B5960" }}>Start blank</Text>
            </View>
          </View>
        </View>
        <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>Tap a time to change it, or ••• for more details.</Text>
        <View style={{ flexDirection: "column", paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", gap: 12, paddingTop: 9, paddingRight: 0, paddingBottom: 9, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 34, height: 34, flexShrink: 0, backgroundColor: "#E0D8F5", borderRadius: 14 }}>
              <SvgXml xml={SVG[1]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", gap: 4, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Morning nap</Text>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 16, flexShrink: 1 }}>{/* -> P20a-RoutineItem.dc.html */}
                  <SvgXml xml={SVG[2]} width={20} height={20} />
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 34, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>9:30 AM</Text>
                </View>
                <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", flexShrink: 1 }}>to</Text>
                <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 34, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>10:30 AM</Text>
                </View>
                <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", marginLeft: 4, flexShrink: 1 }}>Every day</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 12, paddingTop: 9, paddingRight: 0, paddingBottom: 9, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 34, height: 34, flexShrink: 0, backgroundColor: "#F3E1E3", borderRadius: 14 }}>
              <SvgXml xml={SVG[3]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", gap: 4, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Bottle</Text>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 16, flexShrink: 1 }}>{/* -> P20a-RoutineItem.dc.html */}
                  <SvgXml xml={SVG[4]} width={20} height={20} />
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 34, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>12:00 PM</Text>
                </View>
                <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", marginLeft: 4, flexShrink: 1 }}>Every 3 hrs</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 12, paddingTop: 9, paddingRight: 0, paddingBottom: 9, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 34, height: 34, flexShrink: 0, backgroundColor: "#E0D8F5", borderRadius: 14 }}>
              <SvgXml xml={SVG[5]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", gap: 4, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Afternoon nap</Text>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 16, flexShrink: 1 }}>{/* -> P20a-RoutineItem.dc.html */}
                  <SvgXml xml={SVG[6]} width={20} height={20} />
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 34, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>1:00 PM</Text>
                </View>
                <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", flexShrink: 1 }}>to</Text>
                <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 34, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>3:00 PM</Text>
                </View>
                <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", marginLeft: 4, flexShrink: 1 }}>Every day</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 12, paddingTop: 9, paddingRight: 0, paddingBottom: 9, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 34, height: 34, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
              <SvgXml xml={SVG[7]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", gap: 4, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Diaper check</Text>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 16, flexShrink: 1 }}>{/* -> P20a-RoutineItem.dc.html */}
                  <SvgXml xml={SVG[8]} width={20} height={20} />
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 34, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Every 2 hrs</Text>
                </View>
                <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", marginLeft: 4, flexShrink: 1 }}>Log each change</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 12, paddingTop: 9, paddingRight: 0, paddingBottom: 9, paddingLeft: 0 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 34, height: 34, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
              <SvgXml xml={SVG[9]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", gap: 4, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Bedtime</Text>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 16, flexShrink: 1 }}>{/* -> P20a-RoutineItem.dc.html */}
                  <SvgXml xml={SVG[10]} width={20} height={20} />
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 34, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#F7ECED", borderRadius: 8, borderWidth: 1.5, borderColor: "#B7791F", borderStyle: "dashed", flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#7A4E0E" }}>Set a time</Text>
                </View>
                <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", marginLeft: 4, flexShrink: 1 }}>Every day</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 46, flexShrink: 0, borderRadius: 999, borderWidth: 2.0, borderColor: "#C9D3DD", borderStyle: "dashed" }}>{/* -> P20a-RoutineItem.dc.html */}
          <SvgXml xml={SVG[11]} width={20} height={20} />
          <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#47698A" }}>Add to Mia’s day</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <SvgXml xml={SVG[12]} width={18} height={18} />
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Places: Home · Sunshine Daycare</Text>
          <View style={{ flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#47698A", textDecorationLine: "underline" }}>Edit</Text></View>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 6, paddingTop: 0, paddingRight: 20, paddingBottom: 28, paddingLeft: 20 }}>
        <Text style={{ fontFamily: font.body, fontSize: 13, color: "#7A4E0E", textAlign: "center" }}>Set a time for Bedtime, or remove it, to continue</Text>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> P21-ChildSitters.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Continue</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
