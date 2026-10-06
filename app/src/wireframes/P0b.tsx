// GENERATED from wireframe P0b-SignInCode.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3.5 6.5l8.5 6.5 8.5-6.5\"></path></svg>"
];

/** Enter your code */
export default function WF_P0b() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> P0-SignIn.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Check your email</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 16, flexGrow: 1, paddingTop: 8, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 14, paddingRight: 14, paddingBottom: 14, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 22 }}>
            <SvgXml xml={SVG[1]} width={22} height={22} />
          </View>
          <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328" }}>Code sent to</Text>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960" }}>jen@example.com</Text>
          </View>
          <View style={{ flexShrink: 0 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#47698A", textDecorationLine: "underline" }}>Change</Text></View>
        </View>
        <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", lineHeight: 22 }}>Type the 6-digit code from the email. It works for 1 hour.</Text>
        <View style={{ flexDirection: "column", gap: 8 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 58, backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 2.0, borderColor: "#47698A", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.display, fontSize: 28, color: "#1B2328" }}>4</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 58, backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 2.0, borderColor: "#47698A", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.display, fontSize: 28, color: "#1B2328" }}>8</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 58, backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 2.0, borderColor: "#47698A", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.display, fontSize: 28, color: "#1B2328" }}>1</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 58, backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 2.0, borderColor: "#47698A", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.display, fontSize: 28, color: "#1B2328" }}>5</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 58, backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 2.0, borderColor: "#E6EAEF", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 58, backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 2.0, borderColor: "#E6EAEF", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", flexShrink: 1 }}>Didn’t get it? Resend in 0:42</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", flexShrink: 1 }}>Check spam too</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", paddingTop: 8, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, backgroundColor: "#47698A", borderRadius: 999 }}>{/* -> P4b-HomeIdle.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Sign in</Text>
        </View>
      </View>
    </View>
  );
}
