// GENERATED from wireframe S53b-ShareCard.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 5v14M5 12h14\"></path></svg>"
];

/** Share a card */
export default function WF_S53b() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> S53-Requests.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Share CPR and First Aid</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", lineHeight: 22 }}>With the Lee family only. They see the photo of your card and its dates.</Text>
        <View style={{ flexDirection: "column", gap: 2, paddingTop: 10, paddingRight: 14, paddingBottom: 10, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF" }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960" }}>Jen asked</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20 }}>“For Mia, she’s 8 months old.”</Text>
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, marginTop: 2 }}>YOUR CARDS</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 64, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 14, borderWidth: 2.0, borderColor: "#47698A" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 24, height: 24, flexShrink: 0, borderRadius: 12, borderWidth: 2.0, borderColor: "#47698A" }}>
            <View style={{ width: 12, height: 12, backgroundColor: "#47698A", borderRadius: 6, flexShrink: 1, flexDirection: "column" }}>
            </View>
          </View>
          <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>CPR and First Aid</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>American Red Cross · to Jun 2028</Text>
          </View>
        </View>
        <View style={{ opacity: 0.5, flexDirection: "column" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 64, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF" }}>
            <View style={{ width: 24, height: 24, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 2.0, borderColor: "#C3CCD5", flexDirection: "column" }}>
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>CPR and First Aid</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>American Red Cross · ended Sep 2026</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#F6DCD6", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#C2412D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#A1321F" }}>Expired</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 52, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, borderRadius: 14, borderWidth: 2.0, borderColor: "#C9D3DD", borderStyle: "dashed" }}>{/* -> S15-AddCert.dc.html */}
          <SvgXml xml={SVG[1]} width={22} height={22} />
          <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#47698A" }}>Add a new card</Text>
        </View>
        <View style={{ flexDirection: "column", gap: 6 }}>
          <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Note for the family (optional)</Text></View>
          <TextInput placeholder="" defaultValue="Renewed in June, same class as last time." placeholderTextColor="#6B7980" style={{ paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 15, color: "#1B2328" }} />
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 2, paddingTop: 4, paddingRight: 20, paddingBottom: 24, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> S53-Requests.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Share with the Lee family</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 40 }}>{/* -> S53c-DontHave.dc.html */}
          <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#A1321F" }}>I don’t have it</Text>
        </View>
      </View>
    </View>
  );
}
