// GENERATED from wireframe P11b-SitterMissing.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3l9.5 17h-19z\"></path><path d=\"M12 10v4M12 17.5h0\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>"
];

/** Sitter profile */
export default function WF_P11b() {
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
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>Sitting for you since Sep 2026</Text>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>[N] shifts · [HOURS] hrs · [RATE] / hr</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#F6E3C6", borderRadius: 14 }}>{/* -> P7a-SitterRequirements.dc.html */}
          <SvgXml xml={SVG[1]} width={22} height={22} />
          <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#7A4E0E" }}>Meets 2 of 3 of your requirements</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#1B2328", lineHeight: 18 }}>Missing: Infant CPR.</Text>
          </View>
          <SvgXml xml={SVG[2]} width={18} height={18} />
        </View>
        <View style={{ flexDirection: "column", paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ paddingBottom: 4 }}><Text style={{ fontFamily: font.body, fontSize: 16, color: "#1B2328" }}><Text style={{ fontFamily: font.displayBold, fontSize: 18, color: "#1B2328" }}>What Maya shared with you</Text></Text></View>
          <View style={{ paddingTop: 6 }}><Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", lineHeight: 20 }}>Nothing shared yet. Ask Maya for what you need.</Text></View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 44, marginTop: 10, backgroundColor: "#DCE7F1", borderRadius: 999 }}>{/* -> P79-AskSheet.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#47698A" }}>Ask Maya</Text>
          </View>
          <View style={{ marginTop: 10, flexDirection: "column" }}>
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
        </View>
        <View style={{ flexDirection: "column", paddingTop: 0, paddingRight: 16, paddingBottom: 0, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 48, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Location consent</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#F6E3C6", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#B7791F", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#7A4E0E" }}>Not signed</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 48, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Monitoring notice</Text>
            <View style={{ flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#47698A", textDecorationLine: "underline" }}>View copy</Text></View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 48, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Can pick up from</Text>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", flexShrink: 1 }}>Lincoln Elementary</Text>
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
