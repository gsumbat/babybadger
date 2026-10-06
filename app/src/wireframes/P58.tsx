// GENERATED from wireframe P58-PlaceAdd.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"11\" cy=\"11\" r=\"6.5\"></circle><path d=\"M16 16l4.5 4.5\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3l7 18-7-4-7 4z\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z\"></path><circle cx=\"12\" cy=\"10\" r=\"2.5\"></circle></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z\"></path><circle cx=\"12\" cy=\"10\" r=\"2.5\"></circle></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z\"></path><circle cx=\"12\" cy=\"10\" r=\"2.5\"></circle></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"9\" cy=\"8\" r=\"3.5\"></circle><path d=\"M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.8.7 3 2.3 3 4.7\"></path></svg>"
];

/** Add a place */
export default function WF_P58() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> P56-Places.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", marginVertical: -4.62, flexGrow: 1, flexShrink: 1 }}>Add a place</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 14, minHeight: 0, flexGrow: 1, paddingTop: 0, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", gap: 8 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960" }}>What kind of place?</Text>
          <View style={{ flexDirection: "column", gap: 4, paddingTop: 4, paddingRight: 4, paddingBottom: 4, paddingLeft: 4, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
            <View style={{ flexDirection: "row", gap: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#FFFFFF", borderRadius: 999, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#1B2328" }}>Home address</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, borderRadius: 999, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <Text style={{ fontFamily: font.bodyMedium, fontSize: 13, color: "#4B5960" }}>Other place</Text>
              </View>
            </View>
          </View>
          <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", lineHeight: 17 }}>Add a home when the kids live in more than one place, like a second parent's home. Sitters can clock in there.</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, height: 50, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.5, borderColor: "#47698A" }}>
          <SvgXml xml={SVG[1]} width={20} height={20} />
          <View style={{ width: 1, height: 1, position: "absolute", overflow: "hidden", flexShrink: 1, minHeight: 0, justifyContent: "center" }}><Text style={{ fontFamily: font.body, fontSize: 16, color: "#1B2328" }}>Search an address</Text></View>
          <TextInput placeholder="" defaultValue="88 Channel" placeholderTextColor="#6B7980" style={{ minWidth: 0, flexGrow: 1, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, backgroundColor: "transparent", flexShrink: 1, fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>{/* -> P57-PlaceEdit.dc.html */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, backgroundColor: "#DCE7F1", borderRadius: 18, flexShrink: 1 }}>
            <SvgXml xml={SVG[2]} width={18} height={18} />
          </View>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#47698A" }}>Use where I am now</Text>
        </View>
        <View style={{ paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 60, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> P57-PlaceEdit.dc.html */}
            <SvgXml xml={SVG[3]} width={20} height={20} />
            <View style={{ flexDirection: "column", minWidth: 0, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>88 Channelside Dr</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Tampa, FL 33602</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 60, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> P57-PlaceEdit.dc.html */}
            <SvgXml xml={SVG[4]} width={20} height={20} />
            <View style={{ flexDirection: "column", minWidth: 0, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>88 Channelside Dr, Apt 4B</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Tampa, FL 33602</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 60 }}>{/* -> P57-PlaceEdit.dc.html */}
            <SvgXml xml={SVG[5]} width={20} height={20} />
            <View style={{ flexDirection: "column", minWidth: 0, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>880 Channel Dr</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Clearwater, FL 33767</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#E8ECF1", borderRadius: 16 }}>
          <SvgXml xml={SVG[6]} width={20} height={20} />
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18, flexShrink: 1 }}>Sam is a parent on this family, so they can add and edit their own home too.</Text>
        </View>
      </View>
    </View>
  );
}
