// GENERATED from wireframe P78d-JoinFamily.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 5h16v11H9l-5 4z\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"></rect><path d=\"M8 11V8a4 4 0 0 1 8 0v3\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v5l3 2\"></path></svg>"
];

/** Join the family */
export default function WF_P78d() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> P1-Welcome.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Join the Lee family</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 16, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", lineHeight: 22 }}>Jen added you with read-only access.</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 22 }}>
            <Text style={{ fontFamily: font.displayBold, fontSize: 18, color: "#FFFFFF" }}>J</Text>
          </View>
          <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328" }}>The Lee family</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>Ava and Leo · from Jen</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
            <View style={{ width: 7, height: 7, backgroundColor: "#8A979D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960" }}>Read only</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <SvgXml xml={SVG[1]} width={20} height={20} />
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20, flexShrink: 1 }}>See Ava and Leo’s schedule, the live shift and the sitter’s updates.</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <SvgXml xml={SVG[2]} width={20} height={20} />
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20, flexShrink: 1 }}>Message the sitter.</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <SvgXml xml={SVG[3]} width={20} height={20} />
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20, flexShrink: 1 }}>People with full access manage sitters, pay and the plan.</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <SvgXml xml={SVG[4]} width={20} height={20} />
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20, flexShrink: 1 }}>Covered by the family’s plan. Nothing to pay.</Text>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 8, paddingTop: 4, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> P4m-HomeHelper.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Join the Lee family</Text>
          </View>
        </View>
        <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#47698A", textAlign: "center", textDecorationLine: "underline" }}>Not now</Text></View>
      </View>
    </View>
  );
}
