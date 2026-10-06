// GENERATED from wireframe P18-AddChild.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>"
];

/** Add a child */
export default function WF_P18() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "column", gap: 14, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> P13-KidsDevices.dc.html */}
            <SvgXml xml={SVG[0]} width={22} height={22} />
          </View>
          <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#4B5960", flexGrow: 1, flexShrink: 1 }}>Add a child · 1 of 4</Text>
          <View style={{ flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#47698A", textDecorationLine: "underline" }}>Cancel</Text></View>
        </View>
        <View style={{ height: 6, backgroundColor: "#DDE3EA", borderRadius: 3, overflow: "hidden", flexShrink: 1, minHeight: 0, flexDirection: "column" }}>
          <View style={{ width: "25%", height: 6, backgroundColor: "#47698A", flexDirection: "column" }}>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 14, flexGrow: 1, paddingTop: 8, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", gap: 4 }}>
          <Text style={{ fontFamily: font.display, fontSize: 26, color: "#1B2328", lineHeight: 32 }}>Who is joining the family?</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 80, height: 80, flexShrink: 0, backgroundColor: "#E8B9BE", borderRadius: 40, borderWidth: 2.0, borderColor: "#D5DCE4", borderStyle: "dashed" }}>
            <Text style={{ fontFamily: font.display, fontSize: 32, color: "#1B2328" }}>M</Text>
          </View>
          <View style={{ flexDirection: "column", gap: 8, flexShrink: 1 }}>
            <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#47698A", textDecorationLine: "underline" }}>Add a photo</Text></View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ width: 32, height: 32, flexShrink: 0, backgroundColor: "#E8B9BE", borderRadius: 16, flexDirection: "column", ...cardShadow }}>
              </View>
              <View style={{ width: 32, height: 32, flexShrink: 0, backgroundColor: "#2F6FD6", borderRadius: 16, flexDirection: "column" }}>
              </View>
              <View style={{ width: 32, height: 32, flexShrink: 0, backgroundColor: "#D9822B", borderRadius: 16, flexDirection: "column" }}>
              </View>
              <View style={{ width: 32, height: 32, flexShrink: 0, backgroundColor: "#8676B3", borderRadius: 16, flexDirection: "column" }}>
              </View>
              <View style={{ width: 32, height: 32, flexShrink: 0, backgroundColor: "#1F8A4D", borderRadius: 16, flexDirection: "column" }}>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 6 }}>
          <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>First name</Text></View>
          <TextInput placeholder="" defaultValue="Mia" placeholderTextColor="#6B7980" style={{ height: 48, minWidth: 0, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
        </View>
        <View style={{ flexDirection: "column", gap: 6 }}>
          <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Gender (optional)</Text>
          <View style={{ flexDirection: "column", gap: 4, paddingTop: 4, paddingRight: 4, paddingBottom: 4, paddingLeft: 4, backgroundColor: "#E8ECF1", borderRadius: 12 }}>
            <View style={{ flexDirection: "row", gap: 4 }}>
              <View style={{ height: 40, backgroundColor: "#FFFFFF", borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, justifyContent: "center" }}><Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328" }}>Girl</Text></View>
              <View style={{ height: 40, backgroundColor: "transparent", borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, justifyContent: "center" }}><Text style={{ fontFamily: font.bodyMedium, fontSize: 15, color: "#4B5960" }}>Boy</Text></View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 10 }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flexDirection: "column", gap: 6, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Birthday</Text></View>
              <TextInput placeholder="" defaultValue="09/14/2025" placeholderTextColor="#6B7980" style={{ height: 48, minWidth: 0, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
            </View>
            <View style={{ flexDirection: "column", gap: 6, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Age</Text>
              <View style={{ flexDirection: "row", alignItems: "center", height: 48, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#E8ECF1", borderRadius: 8 }}>
                <Text style={{ fontFamily: font.displayBold, fontSize: 18, color: "#1B2328" }}>1 year</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 6 }}>
          <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>What does Mia call you? (optional)</Text></View>
          <TextInput placeholder="" defaultValue="Mama, Dada" placeholderTextColor="#6B7980" style={{ height: 48, minWidth: 0, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "column", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Lives at home</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>[Home address]</Text>
          </View>
          <View style={{ width: 50, height: 30, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 15, flexDirection: "column" }}>
            <View style={{ width: 24, height: 24, top: 3, right: 3, backgroundColor: "#FFFFFF", borderRadius: 12, position: "absolute", flexDirection: "column" }}>
            </View>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "row", paddingTop: 8, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> P19-ChildCare.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Continue</Text>
        </View>
      </View>
    </View>
  );
}
