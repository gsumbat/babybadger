// GENERATED from wireframe S0d-CreateAccount.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"26\" height=\"26\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 5v14M5 12h14\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"9\" r=\"5.5\"></circle><path d=\"M8.5 13.5L7 21l5-2.5 5 2.5-1.5-7.5\"></path></svg>"
];

/** Create account */
export default function WF_S0d() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> S0c-VerifyPhone.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Create your account</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 14, flexGrow: 1, paddingTop: 8, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 72, height: 72, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 36, borderWidth: 2.0, borderColor: "#9AA8AE", borderStyle: "dashed" }}>
            <SvgXml xml={SVG[1]} width={26} height={26} />
          </View>
          <View style={{ flexDirection: "column", gap: 2, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Add a photo</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Families see it on your profile</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 10 }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flexDirection: "column", gap: 6, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>First name</Text></View>
              <TextInput placeholder="" defaultValue="Maya" placeholderTextColor="#6B7980" style={{ height: 48, minWidth: 0, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
            </View>
            <View style={{ flexDirection: "column", gap: 6, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Last name</Text></View>
              <TextInput placeholder="" defaultValue="R." placeholderTextColor="#6B7980" style={{ height: 48, minWidth: 0, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 6 }}>
          <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Email</Text></View>
          <TextInput placeholder="" defaultValue="[Email]" placeholderTextColor="#6B7980" style={{ height: 48, minWidth: 0, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#E8ECF1", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#4B5960" }} />
        </View>
        <View style={{ flexDirection: "row", gap: 12, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
          <SvgXml xml={SVG[2]} width={22} height={22} />
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20, flexShrink: 1 }}>Certifications, languages and background check come later, from your profile. The Lees will tell you what they need.</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", paddingTop: 8, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> S1-Invite.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>See my invite</Text>
        </View>
      </View>
    </View>
  );
}
