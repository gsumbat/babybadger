// GENERATED from wireframe S40-PersonalDetails.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 8h3l2-2.5h6L17 8h3v11H4z\"></path><circle cx=\"12\" cy=\"13\" r=\"3.5\"></circle></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M6 9l6 6 6-6\"></path></svg>"
];

/** Personal details */
export default function WF_S40() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> S39-Me.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", marginVertical: -4.62, flexGrow: 1, flexShrink: 1 }}>Personal details</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 10, minHeight: 0, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 64, height: 64, backgroundColor: "#47698A", borderRadius: 32, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.display, fontSize: 28, color: "#FFFFFF" }}>M</Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 26, height: 26, right: -2, bottom: -2, backgroundColor: "#FFFFFF", borderRadius: 13, position: "absolute", flexShrink: 1, ...cardShadow }}>
              <SvgXml xml={SVG[1]} width={15} height={15} />
            </View>
          </View>
          <View style={{ flexDirection: "column", flexShrink: 1 }}>
            <View style={{}}><Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#47698A", textDecorationLine: "underline" }}>Change photo</Text></View>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>A clear face photo. Families see it.</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 5 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960" }}>Name</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 48, paddingTop: 10, paddingRight: 14, paddingBottom: 10, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#C3CCD5" }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", lineHeight: 21, flexGrow: 1, flexShrink: 1 }}>Maya Rodriguez</Text>
          </View>
          <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Families see “Maya R.” until they book you</Text>
        </View>
        <View style={{ flexDirection: "column", gap: 5 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960" }}>Mobile</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 48, paddingTop: 10, paddingRight: 14, paddingBottom: 10, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#C3CCD5" }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", lineHeight: 21, flexGrow: 1, flexShrink: 1 }}>(813) 555-0192</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 5 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960" }}>Email</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 48, paddingTop: 10, paddingRight: 14, paddingBottom: 10, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#C3CCD5" }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", lineHeight: 21, flexGrow: 1, flexShrink: 1 }}>maya.r@email.com</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 5 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960" }}>Birthday</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 48, paddingTop: 10, paddingRight: 14, paddingBottom: 10, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#C3CCD5" }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", lineHeight: 21, flexGrow: 1, flexShrink: 1 }}>03/14/2002</Text>
            <SvgXml xml={SVG[2]} width={18} height={18} />
          </View>
          <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Families see your age, never the date</Text>
        </View>
        <View style={{ flexDirection: "column", gap: 5 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960" }}>Home area</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 48, paddingTop: 10, paddingRight: 14, paddingBottom: 10, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#C3CCD5" }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", lineHeight: 21, flexGrow: 1, flexShrink: 1 }}>Seminole Heights, Tampa</Text>
          </View>
          <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Only your area is shown, never your address</Text>
        </View>
        <View style={{ flexDirection: "column", gap: 5 }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960" }}>About me</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 92, paddingTop: 10, paddingRight: 14, paddingBottom: 10, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#C3CCD5" }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", lineHeight: 21, flexGrow: 1, flexShrink: 1 }}>Bilingual sitter, 6 years with kids from newborns to 10. CPR certified, I drive, and I love art projects.</Text>
          </View>
          <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>184 / 300</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", paddingTop: 6, paddingRight: 20, paddingBottom: 28, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> S39-Me.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Save changes</Text>
        </View>
      </View>
    </View>
  );
}
