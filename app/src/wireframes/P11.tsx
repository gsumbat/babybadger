// GENERATED from wireframe P11-SitterProfile.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z\"></path><path d=\"M8.5 12l2.5 2.5 4.5-4.5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #C2412D; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z\"></path><path d=\"M12 10v5M9.5 12.5h5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #C2412D; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"8\" r=\"4\"></circle><path d=\"M5 21c0-4 3-7 7-7s7 3 7 7\"></path><path d=\"M10.5 8h0M13.5 8h0\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><circle cx=\"9\" cy=\"11\" r=\"2.5\"></circle><path d=\"M5.5 16.5c.6-1.6 2-2.5 3.5-2.5s2.9.9 3.5 2.5M15 10h3M15 13.5h3\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #C2412D; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z\"></path><path d=\"M12 10v5M9.5 12.5h5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #1F8A4D; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z\"></path><path d=\"M8.5 12l2.5 2.5 4.5-4.5\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #1F8A4D; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #C2412D; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"8\" r=\"4\"></circle><path d=\"M5 21c0-4 3-7 7-7s7 3 7 7\"></path><path d=\"M10.5 8h0M13.5 8h0\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #B7791F; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v5l3 2\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 16v-4l2-5h12l2 5v4z\"></path><circle cx=\"7.5\" cy=\"16.5\" r=\"1.8\"></circle><circle cx=\"16.5\" cy=\"16.5\" r=\"1.8\"></circle></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #1F8A4D; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>"
];

/** Sitter profile */
export default function WF_P11() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> P12-Settings.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Maya R.</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 16, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 64, height: 64, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 32 }}>
            <Text style={{ fontFamily: font.display, fontSize: 28, color: "#FFFFFF" }}>M</Text>
          </View>
          <View style={{ flexDirection: "column", gap: 2, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>24 years old</Text>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>Sitting for you since Sep 2026</Text>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>[N] shifts · [HOURS] hrs · [RATE] / hr</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 8, paddingBottom: 4 }}>
            <Text style={{ fontFamily: font.displayBold, fontSize: 18, color: "#1B2328", flexShrink: 1 }}>Requirements</Text>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", flexShrink: 1 }}>1 of 4 look good · 1 to look at</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 58, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
              <SvgXml xml={SVG[1]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Background check</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Not asked yet</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#8A979D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960" }}>Not asked</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 58, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> P79b-SharedDoc.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#F6DCD6", borderRadius: 14 }}>
              <SvgXml xml={SVG[2]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>CPR and First Aid</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Shared Oct 7 · tap to see it</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#F6E3C6", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#B7791F", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#7A4E0E" }}>Shared, see it</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 58, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#F6DCD6", borderRadius: 14 }}>
              <SvgXml xml={SVG[3]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Infant CPR</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Jen said it looks good · expires Oct 22</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>Looks good ✓</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 58 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
              <SvgXml xml={SVG[4]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Age 18 or older</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Asked Oct 6</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCE7F1", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#47698A", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#34526E" }}>Asked</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 44, marginTop: 10, backgroundColor: "#DCE7F1", borderRadius: 999 }}>{/* -> P79-AskSheet.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#47698A" }}>Ask Maya</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 14, paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: font.displayBold, fontSize: 18, color: "#1B2328", flexShrink: 1 }}>Credentials</Text>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", flexShrink: 1 }}>Checked by BabyBadger</Text>
          </View>
          <View style={{ flexDirection: "column", rowGap: 12, columnGap: 10 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#F6DCD6", borderRadius: 14 }}>
                  <SvgXml xml={SVG[5]} width={22} height={22} />
                </View>
                <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328" }}>CPR + First Aid</Text>
                    <SvgXml xml={SVG[6]} width={16} height={16} />
                  </View>
                  <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Until Mar 2027</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
                  <SvgXml xml={SVG[7]} width={22} height={22} />
                </View>
                <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328" }}>Background</Text>
                    <SvgXml xml={SVG[8]} width={16} height={16} />
                  </View>
                  <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Checked Aug 2026</Text>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#F6DCD6", borderRadius: 14 }}>
                  <SvgXml xml={SVG[9]} width={22} height={22} />
                </View>
                <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328" }}>Infant CPR</Text>
                    <SvgXml xml={SVG[10]} width={16} height={16} />
                  </View>
                  <Text style={{ fontFamily: font.bodySemi, fontSize: 12, color: "#7A4E0E" }}>Expires Oct 22</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
                  <SvgXml xml={SVG[11]} width={22} height={22} />
                </View>
                <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328" }}>Driver</Text>
                    <SvgXml xml={SVG[12]} width={16} height={16} />
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
        </View>
        <View style={{ flexDirection: "column", paddingTop: 0, paddingRight: 16, paddingBottom: 0, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 48, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Location consent</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>Signed Sep 14</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 48, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Monitoring notice</Text>
            <View style={{ flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#47698A", textDecorationLine: "underline" }}>View copy</Text></View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 48 }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Last shift</Text>
            <View style={{ flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#47698A", textDecorationLine: "underline" }}>Thu, Oct 1 report</Text></View>
          </View>
        </View>
        <View style={{ flexGrow: 1, flexDirection: "column" }}>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, flexGrow: 1, flexBasis: 0, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>{/* -> P10-Messages.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#47698A" }}>Message</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> P6-Calendar.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Book a shift</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 36 }}>{/* -> P27-Sitters.dc.html */}
          <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#A1321F" }}>Remove Maya from your family</Text>
        </View>
      </View>
    </View>
  );
}
