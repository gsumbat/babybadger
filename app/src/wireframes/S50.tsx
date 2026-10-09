// GENERATED from wireframe S50-Families.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 5v14M5 12h14\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>"
];

/** Families tab · list */
export default function WF_S50() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 20, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <Text style={{ fontFamily: font.display, fontSize: 26, color: "#1B2328", flexShrink: 1 }}>Families</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, height: 36, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>{/* -> S51-JoinCode.dc.html */}
          <SvgXml xml={SVG[0]} width={16} height={16} />
          <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#47698A" }}>Join with a code</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 12, minHeight: 0, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6 }}>YOUR FAMILIES · 3</Text>
        <View style={{ paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 76, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> S10-Family.dc.html */}
            <View style={{ alignSelf: "stretch", width: 6, flexShrink: 0, marginTop: 14, marginBottom: 14, backgroundColor: "#2F6FD6", borderRadius: 3, flexDirection: "column" }}>
            </View>
            <View style={{ flexDirection: "column", gap: 2, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 16, color: "#1B2328" }}>The Lee family</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Next shift Sat 10 AM</Text>
            </View>
            <View style={{ flexDirection: "row", flexShrink: 0 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#E8B9BE", borderRadius: 18, borderWidth: 2.0, borderColor: "#FFFFFF" }}>
                <Text style={{ fontFamily: font.displayBold, fontSize: 15, color: "#8A3F5A" }}>A</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, marginLeft: -10, backgroundColor: "#2F6FD6", borderRadius: 18, borderWidth: 2.0, borderColor: "#FFFFFF" }}>
                <Text style={{ fontFamily: font.displayBold, fontSize: 15, color: "#FFFFFF" }}>L</Text>
              </View>
            </View>
            <SvgXml xml={SVG[1]} width={20} height={20} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 76, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> S10-Family.dc.html */}
            <View style={{ alignSelf: "stretch", width: 6, flexShrink: 0, marginTop: 14, marginBottom: 14, backgroundColor: "#D9822B", borderRadius: 3, flexDirection: "column" }}>
            </View>
            <View style={{ flexDirection: "column", gap: 2, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 16, color: "#1B2328" }}>The Ortiz family</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>No shifts booked</Text>
            </View>
            <View style={{ flexDirection: "row", flexShrink: 0 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#5E7F6A", borderRadius: 18, borderWidth: 2.0, borderColor: "#FFFFFF" }}>
                <Text style={{ fontFamily: font.displayBold, fontSize: 15, color: "#FFFFFF" }}>S</Text>
              </View>
            </View>
            <SvgXml xml={SVG[2]} width={20} height={20} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 76 }}>{/* -> S2-Consent.dc.html */}
            <View style={{ alignSelf: "stretch", width: 6, flexShrink: 0, marginTop: 14, marginBottom: 14, backgroundColor: "#8676B3", borderRadius: 3, flexDirection: "column" }}>
            </View>
            <View style={{ flexDirection: "column", gap: 2, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 16, color: "#1B2328" }}>The Patel family</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Joined Oct 5 · not bookable yet</Text>
            </View>
            <View style={{ flexDirection: "row", flexShrink: 0 }}>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#F6E3C6", borderRadius: 999 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#7A4E0E" }}>Sign notice</Text>
            </View>
            <SvgXml xml={SVG[3]} width={20} height={20} />
          </View>
        </View>
        <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>Each family sees only its own shifts. They never see the other families you work for.</Text>
      </View>
      {/* tab bar: drawn by the app's tab navigator */}
    </View>
  );
}
