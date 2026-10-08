// GENERATED from wireframe S13-Profile.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #C2412D; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z\"></path><path d=\"M12 10v5M9.5 12.5h5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z\"></path><path d=\"M8.5 12l2.5 2.5 4.5-4.5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z\"></path></svg>"
];

/** My profile */
export default function WF_S13() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> S39-Me.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>My profile</Text>
        <View style={{ flexShrink: 1 }}><Text numberOfLines={1} style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#47698A", textDecorationLine: "underline" }}>Preview</Text></View>
      </View>
      <View style={{ flexDirection: "column", gap: 14, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 16, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 72, height: 72, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 36 }}>
            <Text style={{ fontFamily: font.display, fontSize: 31, color: "#FFFFFF" }}>M</Text>
          </View>
          <View style={{ flexDirection: "column", gap: 2, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.display, fontSize: 24, color: "#1B2328", marginVertical: -5.22 }}>Maya R.</Text>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>24 years old · Tampa · 6 years with kids</Text>
            <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#47698A", textDecorationLine: "underline" }}>Edit details and photo</Text></View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 10, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Profile strength</Text>
            <Text style={{ fontFamily: font.display, fontSize: 20, color: "#47698A", flexShrink: 1 }}>80%</Text>
          </View>
          <View style={{ height: 10, backgroundColor: "#E8ECF1", borderRadius: 5, overflow: "hidden", flexShrink: 1, minHeight: 0, flexDirection: "column" }}>
            <View style={{ width: "80%", height: 10, backgroundColor: "#47698A", borderRadius: 5, flexDirection: "column" }}>
            </View>
          </View>
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>Next: add a certification, like Newborn care or Water safety.</Text>
        </View>
        <View style={{ flexDirection: "column", gap: 8, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Be found by new families later</Text>
            <View style={{ width: 50, height: 30, flexShrink: 0, backgroundColor: "#C3CCD5", borderRadius: 15, flexDirection: "column" }}>
              <View style={{ width: 24, height: 24, top: 3, left: 3, backgroundColor: "#FFFFFF", borderRadius: 12, position: "absolute", flexDirection: "column" }}>
              </View>
            </View>
          </View>
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>When BabyBadger opens to new families near you, we can show your profile. Off until you turn it on. Nothing is shared today.</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, flexShrink: 1 }}>CREDENTIALS</Text>
          <View style={{ flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#47698A", textDecorationLine: "underline" }}>Manage</Text></View>
        </View>
        <View style={{ flexDirection: "column", paddingTop: 0, paddingRight: 16, paddingBottom: 0, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 68, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> S14-Credentials.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, flexShrink: 0, backgroundColor: "#F6DCD6", borderRadius: 14 }}>
              <SvgXml xml={SVG[1]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>CPR and First Aid</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Expires Mar 2027</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>Added</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 68, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> S17-BackgroundCheck.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
              <SvgXml xml={SVG[2]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Background check</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Checkr report · 08/12/2026</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>Added</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 68 }}>{/* -> S16-Languages.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, flexShrink: 0, backgroundColor: "#F3E1E3", borderRadius: 14 }}>
              <SvgXml xml={SVG[3]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Languages</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>English · Spanish</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#8A979D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960" }}>2</Text>
            </View>
          </View>
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, marginTop: 2 }}>ABOUT</Text>
        <View style={{ flexDirection: "column", paddingTop: 0, paddingRight: 16, paddingBottom: 0, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 50, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Ages</Text>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", flexShrink: 1 }}>Newborn – 10</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 50, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Can drive kids</Text>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", flexShrink: 1 }}>Yes · own car</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 50 }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Rate</Text>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", flexShrink: 1 }}>[RATE] / hour</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
