// GENERATED from wireframe P79b-SharedDoc.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #C2412D; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z\"></path><path d=\"M12 10v5M9.5 12.5h5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle></svg>"
];

/** What Maya shared */
export default function WF_P79b() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> P11-SitterProfile.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>CPR and First Aid</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", flexShrink: 1 }}>Shared by Maya · Oct 7</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#F6E3C6", borderRadius: 999 }}>
            <View style={{ width: 7, height: 7, backgroundColor: "#B7791F", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#7A4E0E" }}>Shared, see it</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 220, backgroundColor: "#E8ECF1", borderRadius: 16 }}>
          <View style={{ flexDirection: "column", gap: 8, width: 260, height: 160, paddingTop: 14, paddingRight: 14, paddingBottom: 14, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 12, flexShrink: 1, ...cardShadow }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <SvgXml xml={SVG[1]} width={22} height={22} />
              <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#1B2328", flexShrink: 1 }}>American Red Cross</Text>
            </View>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328" }}>Adult and Pediatric First Aid / CPR / AED</Text>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Maya Ruiz · Valid 2 years</Text>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Issued 06/01/2026 · Expires 06/01/2028</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", paddingTop: 0, paddingRight: 16, paddingBottom: 0, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 46, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", flexShrink: 1 }}>Issued by</Text>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", textAlign: "right", flexShrink: 1 }}>American Red Cross</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 46, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", flexShrink: 1 }}>Issued</Text>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", textAlign: "right", flexShrink: 1 }}>06/01/2026</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 46 }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", flexShrink: 1 }}>Expires</Text>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", textAlign: "right", flexShrink: 1 }}>06/01/2028</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 2, paddingTop: 10, paddingRight: 14, paddingBottom: 10, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF" }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960" }}>Maya’s note</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20 }}>“Renewed in June, same class as last time.”</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 12, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
          <SvgXml xml={SVG[2]} width={22} height={22} />
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20, flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#34526E", lineHeight: 20 }}>BabyBadger doesn’t check cards.</Text> Look at the name and the dates. When it looks right to you, tap Looks good.</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 10, paddingTop: 4, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>{/* -> P79e-AskAgain.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#47698A" }}>Ask again</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> P11-SitterProfile.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Looks good</Text>
        </View>
      </View>
    </View>
  );
}
