// GENERATED from wireframe S27-FamilyRequirements.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3l9.5 17h-19z\"></path><path d=\"M12 10v4M12 17.5h0\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z\"></path><path d=\"M8.5 12l2.5 2.5 4.5-4.5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #C2412D; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z\"></path><path d=\"M12 10v5M9.5 12.5h5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 16v-4l2-5h12l2 5v4z\"></path><circle cx=\"7.5\" cy=\"16.5\" r=\"1.8\"></circle><circle cx=\"16.5\" cy=\"16.5\" r=\"1.8\"></circle></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M5.6 5.6l12.8 12.8M7 13h6M16 13h1\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 9l-1.5-4L7 6.5M19 9l1.5-4L17 6.5\"></path><path d=\"M6 9.5c0-2.5 2.7-4 6-4s6 1.5 6 4V14a6 6 0 0 1-12 0z\"></path><path d=\"M10 12h0M14 12h0M11 15.5h2\"></path></svg>"
];

/** Family requirements */
export default function WF_S27() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> S1-Invite.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>What the Lees ask for</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 10, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#F6E3C6", borderRadius: 14 }}>
          <SvgXml xml={SVG[1]} width={22} height={22} />
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20, flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#7A4E0E", lineHeight: 20 }}>3 of 5 must-haves done.</Text> Confirm the last 2 below so the family can book you.</Text>
        </View>
        <View style={{ flexDirection: "column", paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "column", borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 58 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
                <SvgXml xml={SVG[2]} width={22} height={22} />
              </View>
              <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
                <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Background check</Text>
                <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Looks good to the family</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>You have it</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "column", borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 58 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#F6DCD6", borderRadius: 14 }}>
                <SvgXml xml={SVG[3]} width={22} height={22} />
              </View>
              <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
                <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>CPR, First Aid, Infant CPR</Text>
                <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Looks good to the family · Infant expires Oct 22</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>You have it</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "column", borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 58 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
                <SvgXml xml={SVG[4]} width={22} height={22} />
              </View>
              <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
                <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Driving</Text>
                <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>License ✓ record ✓ car seats</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCE7F1", borderRadius: 999 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#47698A", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#34526E" }}>Confirm</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 8, paddingTop: 0, paddingRight: 0, paddingBottom: 10, paddingLeft: 46 }}>
              <View style={{ flexDirection: "row", alignItems: "center", height: 34, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "rgb(71, 105, 138)", borderRadius: 999, flexShrink: 1 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "rgb(255, 255, 255)" }}>Yes</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", height: 34, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, borderRadius: 999, borderWidth: 1.0, borderColor: "rgb(195, 204, 213)", flexShrink: 1 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "rgb(27, 35, 40)" }}>No</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "column", borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 58 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#E8ECF1", borderRadius: 14 }}>
                <SvgXml xml={SVG[5]} width={22} height={22} />
              </View>
              <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
                <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Non-smoker</Text>
                <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Confirm for this family</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCE7F1", borderRadius: 999 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#47698A", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#34526E" }}>Confirm</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 8, paddingTop: 0, paddingRight: 0, paddingBottom: 10, paddingLeft: 46 }}>
              <View style={{ flexDirection: "row", alignItems: "center", height: 34, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "rgb(71, 105, 138)", borderRadius: 999, flexShrink: 1 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "rgb(255, 255, 255)" }}>Yes</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", height: 34, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, borderRadius: 999, borderWidth: 1.0, borderColor: "rgb(195, 204, 213)", flexShrink: 1 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "rgb(27, 35, 40)" }}>No</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "column", borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 58 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#F3E1E3", borderRadius: 14 }}>
                <SvgXml xml={SVG[6]} width={22} height={22} />
              </View>
              <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
                <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Comfortable with dogs</Text>
                <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>“Biscuit, a big friendly lab”</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#8A979D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960" }}>Nice to have</Text>
              </View>
            </View>
          </View>
        </View>
        <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>What you share here goes to the Lee family only. Other families never see it.</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 6, paddingTop: 4, paddingRight: 20, paddingBottom: 28, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> S42-HouseRules.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Continue to house rules</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 36 }}>{/* -> S15-AddCert.dc.html */}
          <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#47698A", textDecorationLine: "underline" }}>Add a certification</Text>
        </View>
      </View>
    </View>
  );
}
