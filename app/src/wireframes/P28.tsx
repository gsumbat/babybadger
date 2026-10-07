// GENERATED from wireframe P28-ReqStart.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z\"></path><path d=\"M8.5 12l2.5 2.5 4.5-4.5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #C2412D; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z\"></path><path d=\"M12 10v5M9.5 12.5h5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #C2412D; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"8\" r=\"4\"></circle><path d=\"M5 21c0-4 3-7 7-7s7 3 7 7\"></path><path d=\"M10.5 8h0M13.5 8h0\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 16v-4l2-5h12l2 5v4z\"></path><circle cx=\"7.5\" cy=\"16.5\" r=\"1.8\"></circle><circle cx=\"16.5\" cy=\"16.5\" r=\"1.8\"></circle></svg>"
];

/** Requirements start */
export default function WF_P28() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "column", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> P23-InviteAccess.dc.html */}
            <SvgXml xml={SVG[0]} width={22} height={22} />
          </View>
          <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#4B5960", flexGrow: 1, flexShrink: 1 }}>Sitter requirements · 1 of 4</Text>
        </View>
        <View style={{ height: 6, backgroundColor: "#DDE3EA", borderRadius: 3, overflow: "hidden", flexShrink: 1, minHeight: 0, flexDirection: "column" }}>
          <View style={{ width: "25%", height: 6, backgroundColor: "#47698A", flexDirection: "column" }}>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 14, flexGrow: 1, paddingTop: 6, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", gap: 4 }}>
          <Text style={{ fontFamily: font.display, fontSize: 26, color: "#1B2328", lineHeight: 32 }}>What should every sitter have?</Text>
          <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", lineHeight: 22 }}>Set it once. It applies to every sitter you invite now and later.</Text>
        </View>
        <View style={{ flexDirection: "column", gap: 10, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 2.0, borderColor: "#47698A" }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 22, height: 22, flexShrink: 0, borderRadius: 11, borderWidth: 2.0, borderColor: "#47698A" }}>
              <View style={{ width: 10, height: 10, backgroundColor: "#47698A", borderRadius: 5, flexShrink: 1, flexDirection: "column" }}>
              </View>
            </View>
            <View style={{ flexDirection: "column", gap: 2, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 16, color: "#1B2328" }}>Recommended for your family</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>Based on Ava 7, Leo 4 and the permissions you chose</Text>
            </View>
          </View>
          <View style={{ flexDirection: "column", gap: 10, paddingLeft: 34 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 30, height: 30, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
                <SvgXml xml={SVG[1]} width={22} height={22} />
              </View>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Background check</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", textAlign: "right", flexShrink: 1 }}>Everyone</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 30, height: 30, flexShrink: 0, backgroundColor: "#F6DCD6", borderRadius: 14 }}>
                <SvgXml xml={SVG[2]} width={22} height={22} />
              </View>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>CPR and First Aid</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", textAlign: "right", flexShrink: 1 }}>Everyone</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 30, height: 30, flexShrink: 0, backgroundColor: "#F6DCD6", borderRadius: 14 }}>
                <SvgXml xml={SVG[3]} width={22} height={22} />
              </View>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Infant CPR</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", textAlign: "right", flexShrink: 1 }}>Leo is 4</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 30, height: 30, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
                <SvgXml xml={SVG[4]} width={22} height={22} />
              </View>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Driver's license</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", textAlign: "right", flexShrink: 1 }}>You allow driving</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 10, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <View style={{ width: 22, height: 22, flexShrink: 0, borderRadius: 11, borderWidth: 2.0, borderColor: "#C3CCD5", flexDirection: "column" }}>
            </View>
            <View style={{ flexDirection: "column", gap: 2, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 16, color: "#1B2328" }}>Build my own</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>Start with nothing and pick each one</Text>
            </View>
          </View>
        </View>
        <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>You can change anything on the next screen.</Text>
      </View>
      <View style={{ flexDirection: "row", paddingTop: 4, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> P29-ReqBuilder.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Continue</Text>
        </View>
      </View>
    </View>
  );
}
