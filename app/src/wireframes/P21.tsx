// GENERATED from wireframe P21-ChildSitters.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3l9.5 17h-19z\"></path><path d=\"M12 10v4M12 17.5h0\"></path></svg>"
];

/** Who looks after */
export default function WF_P21() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "column", gap: 14, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> P20-ChildRoutine.dc.html */}
            <SvgXml xml={SVG[0]} width={22} height={22} />
          </View>
          <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#4B5960", flexGrow: 1, flexShrink: 1 }}>Add a child · 4 of 4</Text>
          <View style={{ flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#47698A", textDecorationLine: "underline" }}>Cancel</Text></View>
        </View>
        <View style={{ height: 6, backgroundColor: "#DDE3EA", borderRadius: 3, overflow: "hidden", flexShrink: 1, minHeight: 0, flexDirection: "column" }}>
          <View style={{ width: "100%", height: 6, backgroundColor: "#47698A", flexDirection: "column" }}>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 8, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", gap: 4 }}>
          <Text style={{ fontFamily: font.display, fontSize: 26, color: "#1B2328", marginVertical: -4.83 }}>Who looks after Mia?</Text>
          <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", lineHeight: 22 }}>Sitters you turn on see Mia’s info and care plan during their shifts.</Text>
        </View>
        <View style={{ flexDirection: "column", paddingTop: 0, paddingRight: 16, paddingBottom: 0, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 68 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 22 }}>
              <Text style={{ fontFamily: font.displayBold, fontSize: 19, color: "#FFFFFF" }}>M</Text>
            </View>
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 16, color: "#1B2328" }}>Maya R.</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Your sitter since Sep 2026</Text>
              <View style={{ marginTop: 4, flexDirection: "column" }}>
                <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999 }}>
                  <View style={{ width: 7, height: 7, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                  </View>
                  <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>Meets all requirements</Text>
                </View>
              </View>
            </View>
            <View style={{ width: 50, height: 30, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 15, flexDirection: "column" }}>
              <View style={{ width: 24, height: 24, top: 3, right: 3, backgroundColor: "#FFFFFF", borderRadius: 12, position: "absolute", flexDirection: "column" }}>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 12, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#F6E3C6", borderRadius: 14 }}>
          <SvgXml xml={SVG[1]} width={22} height={22} />
          <View style={{ flexDirection: "column", gap: 6, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#7A4E0E", lineHeight: 20 }}>Mia is under 2.</Text> Infant CPR is already required. We suggest adding Newborn care too.</Text>
            <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#47698A", textDecorationLine: "underline" }}>Review requirements</Text></View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "column", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Tell Maya about Mia</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>She gets a short summary now</Text>
          </View>
          <View style={{ width: 50, height: 30, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 15, flexDirection: "column" }}>
            <View style={{ width: 24, height: 24, top: 3, right: 3, backgroundColor: "#FFFFFF", borderRadius: 12, position: "absolute", flexDirection: "column" }}>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "column", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Add Mia to booked shifts</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>3 upcoming · Maya must accept</Text>
          </View>
          <View style={{ width: 50, height: 30, flexShrink: 0, backgroundColor: "#C3CCD5", borderRadius: 15, flexDirection: "column" }}>
            <View style={{ width: 24, height: 24, top: 3, left: 3, backgroundColor: "#FFFFFF", borderRadius: 12, position: "absolute", flexDirection: "column" }}>
            </View>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "row", paddingTop: 8, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> P22-ChildAdded.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Add Mia</Text>
        </View>
      </View>
    </View>
  );
}
