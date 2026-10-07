// GENERATED from wireframe S18-CertExpiring.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #C2412D; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z\"></path><path d=\"M12 10v5M9.5 12.5h5\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #FFFFFF; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 16V4M7 9l5-5 5 5\"></path><path d=\"M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3\"></path></svg>"
];

/** Renew certification */
export default function WF_S18() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> S14-Credentials.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Renew Infant CPR</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 14, flexGrow: 1, paddingTop: 8, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", alignItems: "center", gap: 6, paddingTop: 18, paddingRight: 18, paddingBottom: 18, paddingLeft: 18, backgroundColor: "#F6E3C6", borderRadius: 20 }}>
          <Text style={{ fontFamily: font.display, fontSize: 48, color: "#7A4E0E", marginVertical: -12.45, textAlign: "center" }}>21</Text>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#7A4E0E", textAlign: "center" }}>days until it expires · Oct 22</Text>
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6 }}>WHAT HAPPENS</Text>
        <View style={{ flexDirection: "column", gap: 12, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#F6E3C6", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#B7791F", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#7A4E0E" }}>Now</Text>
            </View>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20, flexShrink: 1 }}>Badge still shows. Reminders at 30, 14 and 3 days.</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#F6DCD6", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#C2412D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#A1321F" }}>Oct 22</Text>
            </View>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20, flexShrink: 1 }}>Badge comes off your profile. Families who require Infant CPR are told.</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>Renewed</Text>
            </View>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20, flexShrink: 1 }}>Upload the new card and the badge comes back after review.</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, flexShrink: 0, backgroundColor: "#F6DCD6", borderRadius: 14 }}>
            <SvgXml xml={SVG[1]} width={22} height={22} />
          </View>
          <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>The Lee family requires it</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Leo is 4 · set in their care plan</Text>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 8, paddingTop: 4, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> S15-AddCert.dc.html */}
            <SvgXml xml={SVG[2]} width={20} height={20} />
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Upload new card</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, flexGrow: 1, flexBasis: 0, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#47698A" }}>Find a class near me</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
