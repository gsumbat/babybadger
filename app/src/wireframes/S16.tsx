// GENERATED from wireframe S16-Languages.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 5v14M5 12h14\"></path></svg>"
];

/** Languages */
export default function WF_S16() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> S14-Credentials.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Languages</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", lineHeight: 22 }}>Add every language you can use with kids. Families can look for a sitter who speaks theirs.</Text>
        <View style={{ flexDirection: "column", paddingTop: 0, paddingRight: 16, paddingBottom: 0, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "column", gap: 8, paddingTop: 12, paddingRight: 0, paddingBottom: 12, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 16, color: "#1B2328", flexShrink: 1 }}>English</Text>
              <View style={{ flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#A1321F", textDecorationLine: "underline" }}>Remove</Text></View>
            </View>
            <View style={{ flexDirection: "column", gap: 4, paddingTop: 4, paddingRight: 4, paddingBottom: 4, paddingLeft: 4, backgroundColor: "#E8ECF1", borderRadius: 12 }}>
              <View style={{ flexDirection: "row", gap: 4 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                  <Text style={{ fontFamily: font.bodyMedium, fontSize: 13, color: "#4B5960" }}>Basic</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                  <Text style={{ fontFamily: font.bodyMedium, fontSize: 13, color: "#4B5960" }}>Good</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                  <Text style={{ fontFamily: font.bodyMedium, fontSize: 13, color: "#4B5960" }}>Fluent</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#FFFFFF", borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                  <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#1B2328" }}>Native</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "column", gap: 8, paddingTop: 12, paddingRight: 0, paddingBottom: 12, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 16, color: "#1B2328", flexShrink: 1 }}>Spanish</Text>
              <View style={{ flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#A1321F", textDecorationLine: "underline" }}>Remove</Text></View>
            </View>
            <View style={{ flexDirection: "column", gap: 4, paddingTop: 4, paddingRight: 4, paddingBottom: 4, paddingLeft: 4, backgroundColor: "#E8ECF1", borderRadius: 12 }}>
              <View style={{ flexDirection: "row", gap: 4 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                  <Text style={{ fontFamily: font.bodyMedium, fontSize: 13, color: "#4B5960" }}>Basic</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                  <Text style={{ fontFamily: font.bodyMedium, fontSize: 13, color: "#4B5960" }}>Good</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#FFFFFF", borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                  <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#1B2328" }}>Fluent</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                  <Text style={{ fontFamily: font.bodyMedium, fontSize: 13, color: "#4B5960" }}>Native</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "column", gap: 8, paddingTop: 12, paddingRight: 0, paddingBottom: 12, paddingLeft: 0 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 16, color: "#1B2328", flexShrink: 1 }}>Portuguese</Text>
              <View style={{ flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#A1321F", textDecorationLine: "underline" }}>Remove</Text></View>
            </View>
            <View style={{ flexDirection: "column", gap: 4, paddingTop: 4, paddingRight: 4, paddingBottom: 4, paddingLeft: 4, backgroundColor: "#E8ECF1", borderRadius: 12 }}>
              <View style={{ flexDirection: "row", gap: 4 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, backgroundColor: "#FFFFFF", borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                  <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#1B2328" }}>Basic</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                  <Text style={{ fontFamily: font.bodyMedium, fontSize: 13, color: "#4B5960" }}>Good</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                  <Text style={{ fontFamily: font.bodyMedium, fontSize: 13, color: "#4B5960" }}>Fluent</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34, borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                  <Text style={{ fontFamily: font.bodyMedium, fontSize: 13, color: "#4B5960" }}>Native</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column" }}>
          <View style={{ left: -9999, position: "absolute" }}><Text style={{ fontFamily: font.body, fontSize: 16, color: "#1B2328" }}>Add a language</Text></View>
          <TextInput placeholder="Add a language" defaultValue="" placeholderTextColor="#6B7980" style={{ width: "100%", height: 50, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 44, borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
          <View style={{ top: 14, left: 14, position: "absolute", flexDirection: "column" }}>
            <SvgXml xml={SVG[1]} width={22} height={22} />
          </View>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>French</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Mandarin</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>ASL</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Russian</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "column", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Happy to teach a language</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Shows on your profile as a skill</Text>
          </View>
          <View style={{ width: 50, height: 30, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 15, flexDirection: "column" }}>
            <View style={{ width: 24, height: 24, top: 3, right: 3, backgroundColor: "#FFFFFF", borderRadius: 12, position: "absolute", flexDirection: "column" }}>
            </View>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "row", paddingTop: 8, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> S14-Credentials.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Save</Text>
        </View>
      </View>
    </View>
  );
}
