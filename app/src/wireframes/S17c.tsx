// GENERATED from wireframe S17c-BackgroundNotStarted.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #1F8A4D; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #1F8A4D; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #1F8A4D; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #1F8A4D; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle></svg>"
];

/** Background check */
export default function WF_S17c() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> S14-Credentials.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Background check</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", paddingTop: 16, paddingRight: 16, paddingBottom: 2, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 14 }}>
            <Text style={{ fontFamily: font.displayBold, fontSize: 18, color: "#1B2328", flexShrink: 1 }}>Status</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#8A979D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960" }}>Not started</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 14 }}>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 28, height: 28, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 3.0, borderColor: "#47698A" }}>
                <View style={{ width: 10, height: 10, backgroundColor: "#47698A", borderRadius: 5, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
              <View style={{ width: 2, minHeight: 18, flexGrow: 1, backgroundColor: "#DDE3EA", flexDirection: "column" }}>
              </View>
            </View>
            <View style={{ flexDirection: "column", paddingBottom: 14, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328" }}>You gave permission</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>Disclosure and consent</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 14 }}>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 1 }}>
              <View style={{ width: 28, height: 28, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 2.0, borderColor: "#C3CCD5", flexDirection: "column" }}>
              </View>
              <View style={{ width: 2, minHeight: 18, flexGrow: 1, backgroundColor: "#DDE3EA", flexDirection: "column" }}>
              </View>
            </View>
            <View style={{ flexDirection: "column", paddingBottom: 14, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#5F6D74" }}>Identity confirmed</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>Photo ID matched your selfie</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 14 }}>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 1 }}>
              <View style={{ width: 28, height: 28, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 2.0, borderColor: "#C3CCD5", flexDirection: "column" }}>
              </View>
              <View style={{ width: 2, minHeight: 18, flexGrow: 1, backgroundColor: "#DDE3EA", flexDirection: "column" }}>
              </View>
            </View>
            <View style={{ flexDirection: "column", paddingBottom: 14, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#5F6D74" }}>Records being checked</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>Usually 2–5 business days. We will notify you.</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 14 }}>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 1 }}>
              <View style={{ width: 28, height: 28, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 2.0, borderColor: "#C3CCD5", flexDirection: "column" }}>
              </View>
            </View>
            <View style={{ flexDirection: "column", paddingBottom: 14, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#5F6D74" }}>Result</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>You see it first, before any family</Text>
            </View>
          </View>
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6 }}>WHAT IS CHECKED</Text>
        <View style={{ flexDirection: "column", gap: 10, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <SvgXml xml={SVG[1]} width={18} height={18} />
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>Identity and past addresses</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <SvgXml xml={SVG[2]} width={18} height={18} />
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>National and county criminal records</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <SvgXml xml={SVG[3]} width={18} height={18} />
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>National sex offender registry</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <SvgXml xml={SVG[4]} width={18} height={18} />
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>Driving record, if you drive kids</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 12, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
          <SvgXml xml={SVG[5]} width={22} height={22} />
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20, flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#34526E", lineHeight: 20 }}>Your report stays yours.</Text> Families only see "Background check · Verified" and the date. You can read the full report and dispute anything that's wrong.</Text>
        </View>
        <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Run by [PROVIDER] · [FEE] · renews every 12 months</Text>
      </View>
      <View style={{ flexDirection: "row", paddingTop: 4, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#47698A" }}>Contact support</Text>
        </View>
      </View>
    </View>
  );
}
