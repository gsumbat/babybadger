// GENERATED from wireframe P5m-MiaBottles.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M6 3v6a4 4 0 0 0 8 0V3M10 13v3a4 4 0 0 0 8 0v-2\"></path><circle cx=\"18\" cy=\"12\" r=\"2\"></circle></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #8A5A7A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><rect x=\"3\" y=\"7\" width=\"18\" height=\"13\" rx=\"2.5\"></rect><circle cx=\"12\" cy=\"13.5\" r=\"3.5\"></circle><path d=\"M8.5 7l1.5-2.5h4L15.5 7\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M10 8.5l5 3.5-5 3.5z\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M6 3v7a2 2 0 0 0 4 0V3M8 10v11M17 21V3c-2.5 1-3.5 3.5-3.5 7.5h3.5\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M6 3v7a2 2 0 0 0 4 0V3M8 10v11M17 21V3c-2.5 1-3.5 3.5-3.5 7.5h3.5\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 16v-3.5L6 7h12l2 5.5V16zM4 16v2.5M20 16v2.5M7.5 13h0M16.5 13h0\"></path></svg>"
];

/** Mia’s report · bottles */
export default function WF_P5m() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> P55-ChildProfile.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", marginVertical: -4.62, flexShrink: 1 }}>Mia’s report</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 10, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 20, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", gap: 6, flexShrink: 0, paddingTop: 0, paddingRight: 20, paddingBottom: 0, paddingLeft: 20, marginRight: -20, marginLeft: -20, overflow: "hidden", minHeight: 0 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, flexShrink: 0, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF" }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>Today</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, flexShrink: 0, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 1.5, borderColor: "#47698A" }}>
            <SvgXml xml={SVG[1]} width={16} height={16} />
            <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#34526E" }}>Week</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, flexShrink: 0, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF" }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>Month</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, flexShrink: 0, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF" }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>3 months</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, flexShrink: 0, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF" }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>6 months</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, flexShrink: 0, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF" }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>1 year</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 10, paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, backgroundColor: "#DCE7F1", borderRadius: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 14 }}>
              <SvgXml xml={SVG[2]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#34526E" }}>Getting ready for a doctor visit?</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#1B2328", lineHeight: 18 }}>A summary of Mia’s week from her sitter logs, with questions to ask.</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 46, backgroundColor: "#47698A", borderRadius: 999 }}>{/* -> P5j-DoctorSummary.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#FFFFFF" }}>Prepare a summary</Text>
          </View>
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, marginTop: 14 }}>PATTERNS</Text>
        <View style={{ flexDirection: "column", gap: 10 }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flexDirection: "column", gap: 2, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, ...cardShadow }}>
              <Text style={{ fontFamily: font.display, fontSize: 26, color: "#1B2328", marginVertical: -5.83 }}>26 oz</Text>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Bottles a day</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>7 bottles · formula</Text>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 12, color: "#1B6B3D" }}>Drank all at 6 of 7</Text>
            </View>
            <View style={{ flexDirection: "column", gap: 2, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, ...cardShadow }}>
              <Text style={{ fontFamily: font.display, fontSize: 26, color: "#1B2328", marginVertical: -5.83 }}>3 h 10 m</Text>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Between bottles</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Last at 3:05 PM</Text>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 12, color: "#34526E" }}>Plan: every 3 hrs</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flexDirection: "column", gap: 2, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, ...cardShadow }}>
              <Text style={{ fontFamily: font.display, fontSize: 26, color: "#1B2328", marginVertical: -5.83 }}>2</Text>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Naps a day</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>1 h 25 m on average</Text>
            </View>
            <View style={{ flexDirection: "column", gap: 2, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, ...cardShadow }}>
              <Text style={{ fontFamily: font.display, fontSize: 26, color: "#1B2328", marginVertical: -5.83 }}>6</Text>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Diapers a day</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>4 wet · 2 dirty</Text>
            </View>
          </View>
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, marginTop: 14 }}>PHOTOS</Text>
        <View style={{ flexDirection: "column", gap: 8 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ height: 104, backgroundColor: "#F3E1E3", borderRadius: 14, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, flexDirection: "column" }}>
            </View>
            <View style={{ height: 104, backgroundColor: "#DCE7F1", borderRadius: 14, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, flexDirection: "column" }}>
            </View>
            <View style={{ height: 104, backgroundColor: "#D7EAD9", borderRadius: 14, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, flexDirection: "column" }}>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ height: 104, backgroundColor: "#F6E3C6", borderRadius: 14, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, flexDirection: "column" }}>
            </View>
            <View style={{ height: 104, backgroundColor: "#E8ECF1", borderRadius: 14, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, flexDirection: "column" }}>
            </View>
            <View style={{ height: 104, backgroundColor: "#F3E1E3", borderRadius: 14, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, flexDirection: "column" }}>
            </View>
          </View>
        </View>
        <View style={{ alignSelf: "center" }}><Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#47698A", textDecorationLine: "underline" }}>Show all 9</Text></View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, marginTop: 14 }}>HISTORY</Text>
        <View style={{ flexDirection: "column", gap: 10, paddingTop: 14, paddingRight: 14, paddingBottom: 2, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Thu, Oct 8</Text>
            <View style={{ flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#47698A", textDecorationLine: "underline" }}>Shift report ›</Text></View>
          </View>
          <View style={{ flexDirection: "column" }}>
            <View style={{ flexDirection: "row", gap: 12, paddingBottom: 12 }}>
              <View style={{ width: 2, top: 38, left: 17, bottom: -6, backgroundColor: "#E6EAEF", position: "absolute", flexShrink: 1, flexDirection: "column" }}>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#F3E1E3", borderRadius: 18 }}>
                <SvgXml xml={SVG[3]} width={18} height={18} />
              </View>
              <View style={{ flexDirection: "column", gap: 2, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>Photo update</Text>
                  <View style={{ paddingTop: 2, paddingRight: 7, paddingBottom: 2, paddingLeft: 7, backgroundColor: "#E8ECF1", borderRadius: 999, flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#4B5960" }}>Both</Text></View>
                  <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", marginLeft: "auto", flexShrink: 1 }}>4:32</Text>
                </View>
                <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>“Snack break on the bench”</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 12, paddingBottom: 12 }}>
              <View style={{ width: 2, top: 38, left: 17, bottom: -6, backgroundColor: "#E6EAEF", position: "absolute", flexShrink: 1, flexDirection: "column" }}>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 18 }}>
                <SvgXml xml={SVG[4]} width={18} height={18} />
              </View>
              <View style={{ flexDirection: "column", gap: 2, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>Park</Text>
                  <View style={{ paddingTop: 2, paddingRight: 7, paddingBottom: 2, paddingLeft: 7, backgroundColor: "#E8ECF1", borderRadius: 999, flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#4B5960" }}>Both</Text></View>
                  <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", marginLeft: "auto", flexShrink: 1 }}>4:30</Text>
                </View>
                <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>1 h · found a frog named Pickles</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 12, paddingBottom: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#F6E3C6", borderRadius: 18 }}>
                <SvgXml xml={SVG[5]} width={18} height={18} />
              </View>
              <View style={{ flexDirection: "column", gap: 2, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>Snack</Text>
                  <View style={{ paddingTop: 2, paddingRight: 7, paddingBottom: 2, paddingLeft: 7, backgroundColor: "#E8ECF1", borderRadius: 999, flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#4B5960" }}>Ava</Text></View>
                  <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", marginLeft: "auto", flexShrink: 1 }}>3:30</Text>
                </View>
                <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>Apple slices, crackers · ate all</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 10, paddingTop: 14, paddingRight: 14, paddingBottom: 2, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Tue, Oct 6</Text>
            <View style={{ flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#47698A", textDecorationLine: "underline" }}>Shift report ›</Text></View>
          </View>
          <View style={{ flexDirection: "column" }}>
            <View style={{ flexDirection: "row", gap: 12, paddingBottom: 12 }}>
              <View style={{ width: 2, top: 38, left: 17, bottom: -6, backgroundColor: "#E6EAEF", position: "absolute", flexShrink: 1, flexDirection: "column" }}>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#F6E3C6", borderRadius: 18 }}>
                <SvgXml xml={SVG[6]} width={18} height={18} />
              </View>
              <View style={{ flexDirection: "column", gap: 2, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>Dinner</Text>
                  <View style={{ paddingTop: 2, paddingRight: 7, paddingBottom: 2, paddingLeft: 7, backgroundColor: "#E8ECF1", borderRadius: 999, flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#4B5960" }}>Both</Text></View>
                  <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", marginLeft: "auto", flexShrink: 1 }}>6:05</Text>
                </View>
                <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>Pasta, peas · Ava ate half, tooth hurt</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 12, paddingBottom: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 18 }}>
                <SvgXml xml={SVG[7]} width={18} height={18} />
              </View>
              <View style={{ flexDirection: "column", gap: 2, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>Picked up Ava</Text>
                  <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", marginLeft: "auto", flexShrink: 1 }}>3:24</Text>
                </View>
                <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>Lincoln Elementary</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
