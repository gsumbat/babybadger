// GENERATED from wireframe P20h-ChildRoutineHelper.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #5B3FA8; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 2.5h6M10 2.5v3l-2 2.5V20a1.5 1.5 0 0 0 1.5 1.5h5A1.5 1.5 0 0 0 16 20V8l-2-2.5v-3\"></path><path d=\"M8 12h8\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #5B3FA8; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M3 12h18v2a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6z\"></path><path d=\"M6 12V5.5A2.5 2.5 0 0 1 10.5 4\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"9\" cy=\"8\" r=\"3.5\"></circle><path d=\"M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.8.7 3 2.3 3 4.7\"></path></svg>"
];

/** Child routine · family helper */
export default function WF_P20h() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> P55h-ChildProfileHelper.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 8, flexGrow: 1, paddingTop: 0, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <Text style={{ fontFamily: font.display, fontSize: 26, color: "#1B2328", marginVertical: -4.83 }}>Mia’s day</Text>
        <View style={{ flexDirection: "column", paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", gap: 12, paddingTop: 9, paddingRight: 0, paddingBottom: 9, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 34, height: 34, flexShrink: 0, backgroundColor: "#E0D8F5", borderRadius: 14 }}>
              <SvgXml xml={SVG[1]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", gap: 4, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Morning nap</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                <View style={{ flexDirection: "row", alignItems: "center", height: 34, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>9:30 AM</Text>
                </View>
                <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", flexShrink: 1 }}>to</Text>
                <View style={{ flexDirection: "row", alignItems: "center", height: 34, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>10:30 AM</Text>
                </View>
                <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", marginLeft: 4, flexShrink: 1 }}>Every day</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 12, paddingTop: 9, paddingRight: 0, paddingBottom: 9, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 34, height: 34, flexShrink: 0, backgroundColor: "#F3E1E3", borderRadius: 14 }}>
              <SvgXml xml={SVG[2]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", gap: 4, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Bottle</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                <View style={{ flexDirection: "row", alignItems: "center", height: 34, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>12:00 PM</Text>
                </View>
                <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", marginLeft: 4, flexShrink: 1 }}>Every 3 hrs</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 12, paddingTop: 9, paddingRight: 0, paddingBottom: 9, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 34, height: 34, flexShrink: 0, backgroundColor: "#E0D8F5", borderRadius: 14 }}>
              <SvgXml xml={SVG[3]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", gap: 4, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Afternoon nap</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                <View style={{ flexDirection: "row", alignItems: "center", height: 34, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>1:00 PM</Text>
                </View>
                <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", flexShrink: 1 }}>to</Text>
                <View style={{ flexDirection: "row", alignItems: "center", height: 34, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>3:00 PM</Text>
                </View>
                <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", marginLeft: 4, flexShrink: 1 }}>Every day</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 12, paddingTop: 9, paddingRight: 0, paddingBottom: 9, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 34, height: 34, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
              <SvgXml xml={SVG[4]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", gap: 4, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Diaper check</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                <View style={{ flexDirection: "row", alignItems: "center", height: 34, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Every 2 hrs</Text>
                </View>
                <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", marginLeft: 4, flexShrink: 1 }}>Log each change</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 12, paddingTop: 9, paddingRight: 0, paddingBottom: 9, paddingLeft: 0 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 34, height: 34, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
              <SvgXml xml={SVG[5]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", gap: 4, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Bedtime</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", flexShrink: 1 }}>Any time</Text>
                <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", marginLeft: 4, flexShrink: 1 }}>Every day</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 12, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
          <SvgXml xml={SVG[6]} width={22} height={22} />
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#1B2328", lineHeight: 18, flexShrink: 1 }}>Jen manages Mia’s day.</Text>
        </View>
      </View>
    </View>
  );
}
