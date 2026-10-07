// GENERATED from wireframe P54d-PickTime.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 5v14M5 12h14\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #1B2328; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18M8 3v4M16 3v4\"></path></svg>",
  "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"11\" cy=\"11\" r=\"6.5\"></circle><path d=\"M16 16l4.5 4.5\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"position: absolute; right: 12px; top: 15px; fill: none; stroke: #4B5960; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; pointer-events: none\"><path d=\"M6 9l6 6 6-6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"position: absolute; right: 12px; top: 15px; fill: none; stroke: #4B5960; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; pointer-events: none\"><path d=\"M6 9l6 6 6-6\"></path></svg>"
];

/** Sitters · pick a time */
export default function WF_P54d() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 20, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <Text style={{ fontFamily: font.display, fontSize: 26, color: "#1B2328", flexShrink: 1 }}>Sitters</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, height: 36, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>{/* -> P23-InviteAccess.dc.html */}
          <SvgXml xml={SVG[0]} width={16} height={16} />
          <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#47698A" }}>Invite</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 12, minHeight: 0, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", gap: 12, paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <Text style={{ fontFamily: font.display, fontSize: 19, color: "#1B2328", marginVertical: -4.22 }}>When do you need someone?</Text>
          <View style={{ flexDirection: "row", gap: 6, overflow: "hidden", flexShrink: 1, minHeight: 0 }}>
            <View style={{ flexDirection: "row", alignItems: "center", height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> P42-Pool.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Tonight</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> P42-Pool.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Sat evening</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> P42-Pool.dc.html */}
              <SvgXml xml={SVG[1]} width={16} height={16} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Pick a time</Text>
            </View>
          </View>
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>We check your pool first, then show new sitters nearby.</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, flexShrink: 1 }}>YOUR POOL · 1</Text>
          <View style={{ flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#47698A", textDecorationLine: "underline" }}>See availability</Text></View>
        </View>
        <View style={{ flexDirection: "row", gap: 7.5, paddingTop: 14, paddingRight: 10, paddingBottom: 14, paddingLeft: 10, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "column", alignItems: "center", gap: 4, width: 60, flexShrink: 0 }}>{/* -> P11-SitterProfile.dc.html */}
            <View style={{ flexDirection: "column" }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 52, height: 52, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 26 }}>
                <Text style={{ fontFamily: font.displayBold, fontSize: 23, color: "#FFFFFF" }}>M</Text>
              </View>
              <View style={{ width: 14, height: 14, right: 0, bottom: 0, backgroundColor: "#47698A", borderRadius: 7, borderWidth: 2.0, borderColor: "#FFFFFF", position: "absolute", flexDirection: "column" }}>
              </View>
            </View>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>Maya</Text>
            <Text numberOfLines={1} style={{ fontFamily: font.body, fontSize: 11, color: "#4B5960" }}>Free tonight</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, backgroundColor: "#DCE7F1", borderRadius: 24 }}>{/* -> P48-Find.dc.html */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 48, height: 48, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 24 }}>
            <SvgXml xml={SVG[2]} width={24} height={24} />
          </View>
          <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.display, fontSize: 18, color: "#34526E", marginVertical: -3.42 }}>Find a new sitter</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#34526E" }}>Coming soon: verified sitters near you</Text>
          </View>
          <SvgXml xml={SVG[3]} width={20} height={20} />
        </View>
      </View>
      {/* tab bar: drawn by the app's tab navigator */}
      <View style={{ flexDirection: "column", justifyContent: "flex-end", backgroundColor: "rgba(27,35,40,0.35)", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
        <View style={{ flexDirection: "column", paddingTop: 0, paddingRight: 20, paddingBottom: 34, paddingLeft: 20, backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 0, paddingBottom: 8, paddingLeft: 0 }}>
            <View style={{ width: 60, flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#47698A", textDecorationLine: "underline" }}>Cancel</Text></View>
            <Text style={{ fontFamily: font.displayBold, fontSize: 18, color: "#1B2328", textAlign: "center", flexGrow: 1, flexShrink: 1 }}>Pick a time</Text>
            <View style={{ width: 60, flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#47698A", textAlign: "right", textDecorationLine: "underline" }}>Done</Text></View>
          </View>
          <View style={{ flexDirection: "column", gap: 16, paddingTop: 8 }}>
            <View style={{ flexDirection: "row", gap: 4 }}>
              <View style={{ flexDirection: "column", alignItems: "center", gap: 2, flexGrow: 1, flexBasis: 0, paddingTop: 8, paddingRight: 0, paddingBottom: 8, paddingLeft: 0, backgroundColor: "#47698A", borderRadius: 14, borderWidth: 1.0, borderColor: "#47698A", flexShrink: 1 }}>{/* -> P42-Pool.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 12, color: "#FFFFFF" }}>Tue</Text>
                <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF", marginVertical: -3.62 }}>6</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", gap: 2, flexGrow: 1, flexBasis: 0, paddingTop: 8, paddingRight: 0, paddingBottom: 8, paddingLeft: 0, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> P42-Pool.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74" }}>Wed</Text>
                <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62 }}>7</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", gap: 2, flexGrow: 1, flexBasis: 0, paddingTop: 8, paddingRight: 0, paddingBottom: 8, paddingLeft: 0, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> P42-Pool.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74" }}>Thu</Text>
                <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62 }}>8</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", gap: 2, flexGrow: 1, flexBasis: 0, paddingTop: 8, paddingRight: 0, paddingBottom: 8, paddingLeft: 0, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> P42-Pool.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74" }}>Fri</Text>
                <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62 }}>9</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", gap: 2, flexGrow: 1, flexBasis: 0, paddingTop: 8, paddingRight: 0, paddingBottom: 8, paddingLeft: 0, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> P42-Pool.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74" }}>Sat</Text>
                <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62 }}>10</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", gap: 2, flexGrow: 1, flexBasis: 0, paddingTop: 8, paddingRight: 0, paddingBottom: 8, paddingLeft: 0, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> P42-Pool.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74" }}>Sun</Text>
                <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62 }}>11</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", gap: 2, flexGrow: 1, flexBasis: 0, paddingTop: 8, paddingRight: 0, paddingBottom: 8, paddingLeft: 0, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> P42-Pool.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74" }}>Mon</Text>
                <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62 }}>12</Text>
              </View>
            </View>
            <View style={{ flexDirection: "column", gap: 12 }}>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flexDirection: "column", gap: 6, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                  <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Starts</Text></View>
                  <View style={{ flexDirection: "column" }}>
                    <TextInput placeholder="" defaultValue="" placeholderTextColor="#6B7980" style={{ width: "100%", height: 48, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
                    <SvgXml xml={SVG[4]} width={18} height={18} />
                  </View>
                </View>
                <View style={{ flexDirection: "column", gap: 6, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                  <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Ends</Text></View>
                  <View style={{ flexDirection: "column" }}>
                    <TextInput placeholder="" defaultValue="" placeholderTextColor="#6B7980" style={{ width: "100%", height: 48, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
                    <SvgXml xml={SVG[5]} width={18} height={18} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
