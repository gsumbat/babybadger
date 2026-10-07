// GENERATED from wireframe S19-FamilyView.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #C2412D; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z\"></path><path d=\"M12 10v5M9.5 12.5h5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #1F8A4D; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z\"></path><path d=\"M8.5 12l2.5 2.5 4.5-4.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #1F8A4D; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #C2412D; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"8\" r=\"4\"></circle><path d=\"M5 21c0-4 3-7 7-7s7 3 7 7\"></path><path d=\"M10.5 8h0M13.5 8h0\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #1F8A4D; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 16v-4l2-5h12l2 5v4z\"></path><circle cx=\"7.5\" cy=\"16.5\" r=\"1.8\"></circle><circle cx=\"16.5\" cy=\"16.5\" r=\"1.8\"></circle></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #1F8A4D; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>"
];

/** What families see */
export default function WF_S19() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> S13-Profile.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>What families see</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ paddingTop: 10, paddingRight: 14, paddingBottom: 10, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 12 }}><Text style={{ fontFamily: font.body, fontSize: 13, color: "#34526E", lineHeight: 18 }}>This is a preview. Families see this when you're invited or, later, in the sitter pool.</Text></View>
        <View style={{ flexDirection: "column", gap: 14, paddingTop: 18, paddingRight: 18, paddingBottom: 18, paddingLeft: 18, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 64, height: 64, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 32 }}>
              <Text style={{ fontFamily: font.display, fontSize: 28, color: "#FFFFFF" }}>M</Text>
            </View>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", marginVertical: -4.62 }}>Maya R.</Text>
              <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>6 years · ages newborn – 10</Text>
              <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>Drives · [RATE] / hour</Text>
            </View>
          </View>
          <View style={{ flexDirection: "column", rowGap: 12, columnGap: 10 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#F6DCD6", borderRadius: 14 }}>
                  <SvgXml xml={SVG[1]} width={22} height={22} />
                </View>
                <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328" }}>CPR + First Aid</Text>
                    <SvgXml xml={SVG[2]} width={16} height={16} />
                  </View>
                  <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Until Mar 2027</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
                  <SvgXml xml={SVG[3]} width={22} height={22} />
                </View>
                <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328" }}>Background</Text>
                    <SvgXml xml={SVG[4]} width={16} height={16} />
                  </View>
                  <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Checked Aug 2026</Text>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#F6DCD6", borderRadius: 14 }}>
                  <SvgXml xml={SVG[5]} width={22} height={22} />
                </View>
                <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328" }}>Infant CPR</Text>
                    <SvgXml xml={SVG[6]} width={16} height={16} />
                  </View>
                  <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Until Oct 2026</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
                  <SvgXml xml={SVG[7]} width={22} height={22} />
                </View>
                <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328" }}>Driver</Text>
                    <SvgXml xml={SVG[8]} width={16} height={16} />
                  </View>
                  <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Clean record</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "column", gap: 6 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6 }}>SPEAKS</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#8A979D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960" }}>English · native</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#8A979D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960" }}>Spanish · fluent</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#8A979D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960" }}>Portuguese · basic</Text>
              </View>
            </View>
          </View>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 21 }}>"I'm a pre-K teaching assistant who loves art projects and getting kids outside. Calm at bedtime, firm on screen time."</Text>
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, marginTop: 2 }}>NEVER SHOWN TO FAMILIES</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
            <View style={{ width: 7, height: 7, backgroundColor: "#8A979D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960" }}>Card photos</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
            <View style={{ width: 7, height: 7, backgroundColor: "#8A979D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960" }}>Certificate numbers</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
            <View style={{ width: 7, height: 7, backgroundColor: "#8A979D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960" }}>Full report</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
            <View style={{ width: 7, height: 7, backgroundColor: "#8A979D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960" }}>Other families</Text>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "row", paddingTop: 4, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>{/* -> S13-Profile.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#47698A" }}>Edit profile</Text>
        </View>
      </View>
    </View>
  );
}
