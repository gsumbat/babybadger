// GENERATED from wireframe S15c-DateWheel.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #C2412D; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z\"></path><path d=\"M12 10v5M9.5 12.5h5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #C2412D; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"8\" r=\"4\"></circle><path d=\"M5 21c0-4 3-7 7-7s7 3 7 7\"></path><path d=\"M10.5 8h0M13.5 8h0\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"9\" r=\"5.5\"></circle><path d=\"M8.5 13.5L7 21l5-2.5 5 2.5-1.5-7.5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M8 13V6a1.5 1.5 0 0 1 3 0v5M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6a1.5 1.5 0 0 1 3 0v7c0 4-2.5 7-6 7s-5-2-6.5-4.5L3 12.5a1.5 1.5 0 0 1 2.5-1.5L8 13\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z\"></path><path d=\"M4 19V5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 16v-4l2-5h12l2 5v4z\"></path><circle cx=\"7.5\" cy=\"16.5\" r=\"1.8\"></circle><circle cx=\"16.5\" cy=\"16.5\" r=\"1.8\"></circle></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 5v14M5 12h14\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"position: absolute; right: 14px; top: 15px; fill: none; stroke: #4B5960; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; pointer-events: none\"><path d=\"M6 9l6 6 6-6\"></path></svg>"
];

/** Add a certification */
export default function WF_S15c() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> S14-Credentials.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Add a certification</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6 }}>WHAT IS IT?</Text>
        <View style={{ flexDirection: "column", gap: 8 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flexDirection: "column", gap: 6, minHeight: 80, paddingTop: 10, paddingRight: 10, paddingBottom: 10, paddingLeft: 10, backgroundColor: "#DCE7F1", borderRadius: 14, borderWidth: 2.0, borderColor: "#47698A", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 14 }}>
                <SvgXml xml={SVG[1]} width={22} height={22} />
              </View>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328", lineHeight: 16 }}>CPR and First Aid</Text>
            </View>
            <View style={{ flexDirection: "column", gap: 6, minHeight: 80, paddingTop: 10, paddingRight: 10, paddingBottom: 10, paddingLeft: 10, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0, backgroundColor: "#F6DCD6", borderRadius: 14 }}>
                <SvgXml xml={SVG[2]} width={22} height={22} />
              </View>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328", lineHeight: 16 }}>Infant CPR</Text>
            </View>
            <View style={{ flexDirection: "column", gap: 6, minHeight: 80, paddingTop: 10, paddingRight: 10, paddingBottom: 10, paddingLeft: 10, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
                <SvgXml xml={SVG[3]} width={22} height={22} />
              </View>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328", lineHeight: 16 }}>Newborn care</Text>
            </View>
            <View style={{ flexDirection: "column", gap: 6, minHeight: 80, paddingTop: 10, paddingRight: 10, paddingBottom: 10, paddingLeft: 10, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
                <SvgXml xml={SVG[4]} width={22} height={22} />
              </View>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328", lineHeight: 16 }}>Water safety</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flexDirection: "column", gap: 6, minHeight: 80, paddingTop: 10, paddingRight: 10, paddingBottom: 10, paddingLeft: 10, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
                <SvgXml xml={SVG[5]} width={22} height={22} />
              </View>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328", lineHeight: 16 }}>Special needs care</Text>
            </View>
            <View style={{ flexDirection: "column", gap: 6, minHeight: 80, paddingTop: 10, paddingRight: 10, paddingBottom: 10, paddingLeft: 10, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
                <SvgXml xml={SVG[6]} width={22} height={22} />
              </View>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328", lineHeight: 16 }}>Early childhood ed.</Text>
            </View>
            <View style={{ flexDirection: "column", gap: 6, minHeight: 80, paddingTop: 10, paddingRight: 10, paddingBottom: 10, paddingLeft: 10, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
                <SvgXml xml={SVG[7]} width={22} height={22} />
              </View>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328", lineHeight: 16 }}>Driver's license</Text>
            </View>
            <View style={{ flexDirection: "column", gap: 6, minHeight: 80, paddingTop: 10, paddingRight: 10, paddingBottom: 10, paddingLeft: 10, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0, backgroundColor: "#E8ECF1", borderRadius: 14 }}>
                <SvgXml xml={SVG[8]} width={22} height={22} />
              </View>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328", lineHeight: 16 }}>Other</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 6 }}>
          <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Issued by</Text></View>
          <View style={{ flexDirection: "column" }}>
            <TextInput placeholder="" defaultValue="" placeholderTextColor="#6B7980" style={{ width: "100%", height: 48, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
            <SvgXml xml={SVG[9]} width={18} height={18} />
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 10 }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flexDirection: "column", gap: 6, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Issued</Text></View>
              <TextInput placeholder="" defaultValue="03/14/2025" placeholderTextColor="#6B7980" style={{ height: 48, minWidth: 0, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
            </View>
            <View style={{ flexDirection: "column", gap: 6, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Expires</Text></View>
              <TextInput placeholder="" defaultValue="03/14/2027" placeholderTextColor="#6B7980" style={{ height: 48, minWidth: 0, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 12, paddingBottom: 12, paddingLeft: 12, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 2.0, borderColor: "#C9D3DD", borderStyle: "dashed" }}>
          <View style={{ width: 56, height: 40, flexShrink: 0, borderRadius: 6, borderWidth: 1.0, borderColor: "#E6EAEF", flexDirection: "column" }}>
          </View>
          <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>cpr-card-front.jpg</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#1B6B3D" }}>Uploaded · photo is clear</Text>
          </View>
          <View style={{ flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#47698A", textDecorationLine: "underline" }}>Replace</Text></View>
        </View>
        <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>We check it with the issuer, usually within 1–2 days. Families see the badge and expiry date, never the card or its number.</Text>
      </View>
      <View style={{ flexDirection: "row", paddingTop: 4, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> S14-Credentials.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Submit for review</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", justifyContent: "flex-end", backgroundColor: "rgba(27,35,40,0.35)", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
        <View style={{ flexDirection: "column", paddingTop: 0, paddingRight: 20, paddingBottom: 34, paddingLeft: 20, backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 0, paddingBottom: 8, paddingLeft: 0 }}>
            <View style={{ width: 60, flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#47698A", textDecorationLine: "underline" }}>Cancel</Text></View>
            <Text style={{ fontFamily: font.displayBold, fontSize: 18, color: "#1B2328", textAlign: "center", flexGrow: 1, flexShrink: 1 }}>Expires</Text>
            <View style={{ width: 60, flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#47698A", textAlign: "right", textDecorationLine: "underline" }}>Done</Text></View>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "center", height: 170, marginTop: 4, marginBottom: 6 }}>
            <View style={{ height: 34, top: 68, left: 0, right: 0, backgroundColor: "#E8ECF1", borderRadius: 8, position: "absolute", flexShrink: 1, flexDirection: "column" }}>
            </View>
            <View style={{ flexDirection: "row", gap: 8, flexShrink: 1 }}>
              <View style={{ flexDirection: "column", width: 130, flexShrink: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34 }}>
                  <Text style={{ fontFamily: font.body, fontSize: 20, color: "#9AA8AE" }}>January</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34 }}>
                  <Text style={{ fontFamily: font.body, fontSize: 20, color: "#9AA8AE" }}>February</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34 }}>
                  <Text style={{ fontFamily: font.bodySemi, fontSize: 22, color: "#1B2328" }}>March</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34 }}>
                  <Text style={{ fontFamily: font.body, fontSize: 20, color: "#9AA8AE" }}>April</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34 }}>
                  <Text style={{ fontFamily: font.body, fontSize: 20, color: "#9AA8AE" }}>May</Text>
                </View>
              </View>
              <View style={{ flexDirection: "column", width: 56, flexShrink: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34 }}>
                  <Text style={{ fontFamily: font.body, fontSize: 20, color: "#9AA8AE" }}>12</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34 }}>
                  <Text style={{ fontFamily: font.body, fontSize: 20, color: "#9AA8AE" }}>13</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34 }}>
                  <Text style={{ fontFamily: font.bodySemi, fontSize: 22, color: "#1B2328" }}>14</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34 }}>
                  <Text style={{ fontFamily: font.body, fontSize: 20, color: "#9AA8AE" }}>15</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34 }}>
                  <Text style={{ fontFamily: font.body, fontSize: 20, color: "#9AA8AE" }}>16</Text>
                </View>
              </View>
              <View style={{ flexDirection: "column", width: 72, flexShrink: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34 }}>
                  <Text style={{ fontFamily: font.body, fontSize: 20, color: "#9AA8AE" }}>2025</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34 }}>
                  <Text style={{ fontFamily: font.body, fontSize: 20, color: "#9AA8AE" }}>2026</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34 }}>
                  <Text style={{ fontFamily: font.bodySemi, fontSize: 22, color: "#1B2328" }}>2027</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34 }}>
                  <Text style={{ fontFamily: font.body, fontSize: 20, color: "#9AA8AE" }}>2028</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 34 }}>
                  <Text style={{ fontFamily: font.body, fontSize: 20, color: "#9AA8AE" }}>2029</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{ alignSelf: "center", paddingTop: 10, paddingRight: 0, paddingBottom: 10, paddingLeft: 0 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#A1321F" }}>No date</Text></View>
        </View>
      </View>
    </View>
  );
}
