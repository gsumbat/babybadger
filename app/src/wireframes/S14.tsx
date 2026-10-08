// GENERATED from wireframe S14-Credentials.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z\"></path><path d=\"M10 20.5a2 2 0 0 0 4 0\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6h11M9 12h11M9 18h11M4.5 6h0M4.5 12h0M4.5 18h0\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #C2412D; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z\"></path><path d=\"M12 10v5M9.5 12.5h5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #C2412D; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"8\" r=\"4\"></circle><path d=\"M5 21c0-4 3-7 7-7s7 3 7 7\"></path><path d=\"M10.5 8h0M13.5 8h0\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z\"></path><path d=\"M8.5 12l2.5 2.5 4.5-4.5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"9\" r=\"5.5\"></circle><path d=\"M8.5 13.5L7 21l5-2.5 5 2.5-1.5-7.5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 16v-4l2-5h12l2 5v4z\"></path><circle cx=\"7.5\" cy=\"16.5\" r=\"1.8\"></circle><circle cx=\"16.5\" cy=\"16.5\" r=\"1.8\"></circle></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #FFFFFF; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 5v14M5 12h14\"></path></svg>"
];

/** Credentials */
export default function WF_S14() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> S39-Me.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Credentials</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", lineHeight: 20 }}>Only you see your cards. Share one when a family asks.</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#F6E3C6", borderRadius: 14 }}>{/* -> S18-CertExpiring.dc.html */}
          <SvgXml xml={SVG[1]} width={22} height={22} />
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20, flexGrow: 1, flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#7A4E0E", lineHeight: 20 }}>Infant CPR expires in 21 days.</Text> Renew it and share the new card with your families.</Text>
          <SvgXml xml={SVG[2]} width={18} height={18} />
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6 }}>REQUESTS</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 16, paddingBottom: 12, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>{/* -> S53-Requests.dc.html */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, flexShrink: 0, backgroundColor: "#F6E3C6", borderRadius: 14 }}>
            <SvgXml xml={SVG[3]} width={22} height={22} />
          </View>
          <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", lineHeight: 20 }}>The Lee family asked for: CPR and First Aid, Infant CPR</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Share what you have · Tap to answer</Text>
          </View>
          <SvgXml xml={SVG[4]} width={18} height={18} />
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6 }}>SAFETY</Text>
        <View style={{ flexDirection: "column", paddingTop: 0, paddingRight: 16, paddingBottom: 0, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 68, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> S15-AddCert.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, flexShrink: 0, backgroundColor: "#F6DCD6", borderRadius: 14 }}>
              <SvgXml xml={SVG[5]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>CPR and First Aid</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>American Red Cross · to Mar 2027</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>Added</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 68, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> S41-CertDetail.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, flexShrink: 0, backgroundColor: "#F6DCD6", borderRadius: 14 }}>
              <SvgXml xml={SVG[6]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Infant CPR</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>American Heart Assoc. · to Oct 22</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#F6E3C6", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#B7791F", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#7A4E0E" }}>Expiring</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 68 }}>{/* -> S17d-BackgroundUpload.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
              <SvgXml xml={SVG[7]} width={22} height={22} />
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
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, marginTop: 2 }}>SKILLS</Text>
        <View style={{ flexDirection: "column", paddingTop: 0, paddingRight: 16, paddingBottom: 0, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 68, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> S15-AddCert.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
              <SvgXml xml={SVG[8]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Newborn care</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Uploaded today</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>Added</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 68, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> S15-AddCert.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
              <SvgXml xml={SVG[9]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Driver's license</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Florida · clean record</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>Added</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 68 }}>{/* -> S16-Languages.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, flexShrink: 0, backgroundColor: "#F3E1E3", borderRadius: 14 }}>
              <SvgXml xml={SVG[10]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Languages</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>English (native) · Spanish (fluent)</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#8A979D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960" }}>Self-reported</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "row", paddingTop: 8, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> S15-AddCert.dc.html */}
          <SvgXml xml={SVG[11]} width={20} height={20} />
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Add a certification</Text>
        </View>
      </View>
    </View>
  );
}
