// GENERATED from wireframe P54b-SittersEmpty.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 5v14M5 12h14\"></path></svg>",
  "<svg width=\"34\" height=\"34\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"9\" cy=\"8\" r=\"3.5\"></circle><path d=\"M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.8.7 3 2.3 3 4.7\"></path></svg>",
  "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"11\" cy=\"11\" r=\"6.5\"></circle><path d=\"M16 16l4.5 4.5\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>"
];

/** Sitters · none yet */
export default function WF_P54b() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 20, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <Text style={{ fontFamily: font.display, fontSize: 26, color: "#1B2328", flexShrink: 1 }}>Sitters</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, height: 36, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>{/* -> P3b-InviteFromSitters.dc.html */}
          <SvgXml xml={SVG[0]} width={16} height={16} />
          <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#47698A" }}>Invite</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 12, minHeight: 0, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", alignItems: "center", gap: 10, paddingTop: 28, paddingRight: 20, paddingBottom: 20, paddingLeft: 20, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 72, height: 72, backgroundColor: "#DCE7F1", borderRadius: 36 }}>
            <SvgXml xml={SVG[1]} width={34} height={34} />
          </View>
          <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", marginVertical: -4.62, textAlign: "center", marginTop: 4 }}>No sitters yet</Text>
          <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", lineHeight: 22, textAlign: "center" }}>Invite someone you already know and trust. They join your pool once they accept and sign the notice.</Text>
          <View style={{ flexDirection: "column", alignSelf: "stretch", marginTop: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, backgroundColor: "#47698A", borderRadius: 999 }}>{/* -> P3b-InviteFromSitters.dc.html */}
              <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF", textAlign: "center" }}>Invite a sitter</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, backgroundColor: "#DCE7F1", borderRadius: 24 }}>{/* -> P48-Find.dc.html */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 48, height: 48, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 24 }}>
            <SvgXml xml={SVG[2]} width={24} height={24} />
          </View>
          <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.display, fontSize: 18, color: "#34526E", marginVertical: -3.42 }}>Find a new sitter</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#34526E" }}>48 sitters within 3 mi of you</Text>
          </View>
          <SvgXml xml={SVG[3]} width={20} height={20} />
        </View>
      </View>
      {/* tab bar: drawn by the app's tab navigator */}
    </View>
  );
}
