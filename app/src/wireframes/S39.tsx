// GENERATED from wireframe S39-Me.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 20h4L19 9l-4-4L4 16z\"></path><path d=\"M13.5 6.5l4 4\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"9\" r=\"5.5\"></circle><path d=\"M8.5 13.5L7 21l5-2.5 5 2.5-1.5-7.5\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z\"></path><path d=\"M8.5 12l2.5 2.5 4.5-4.5\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v5l3 2\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 12l16-8-6 16-2.5-6.5z\"></path><path d=\"M11.5 13.5L20 4\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"11\" cy=\"11\" r=\"6.5\"></circle><path d=\"M16 16l4.5 4.5\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><rect x=\"3\" y=\"6\" width=\"18\" height=\"14\" rx=\"2.5\"></rect><path d=\"M3 10h18M16 15h2\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M6 3h12v18l-3-2-3 2-3-2-3 2z\"></path><path d=\"M9 8h6M9 12h6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"12\" r=\"3\"></circle><path d=\"M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>"
];

/** Me (sitter) */
export default function WF_S39() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ paddingTop: 18, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}><Text style={{ fontFamily: font.body, fontSize: 16, color: "#1B2328" }}><Text style={{ fontFamily: font.display, fontSize: 26, color: "#1B2328" }}>Me</Text></Text></View>
      <View style={{ flexDirection: "column", gap: 8, minHeight: 0, flexGrow: 1, paddingTop: 0, paddingRight: 20, paddingBottom: 10, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", gap: 10, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 60, height: 60, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 30 }}>
              <Text style={{ fontFamily: font.display, fontSize: 26, color: "#FFFFFF" }}>M</Text>
            </View>
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.display, fontSize: 20, color: "#1B2328", marginVertical: -4.02 }}>Maya R.</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Tampa · 6 years with kids · 2 families</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 40, flexGrow: 1, flexBasis: 0, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>{/* -> S13-Profile.dc.html */}
              <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#47698A" }}>My profile · 80%</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 40, flexGrow: 1, flexBasis: 0, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#C3CCD5", flexShrink: 1 }}>{/* -> S19-FamilyView.dc.html */}
              <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328" }}>What families see</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, flexShrink: 1 }}>PROFILE AND CREDENTIALS</Text>
        </View>
        <View style={{ paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 46, paddingTop: 3, paddingRight: 0, paddingBottom: 3, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> S40-PersonalDetails.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 10 }}>
              <SvgXml xml={SVG[0]} width={18} height={18} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", lineHeight: 19 }}>Personal details</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Name, photo, phone, area, about me</Text>
            </View>
            <SvgXml xml={SVG[1]} width={18} height={18} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 46, paddingTop: 3, paddingRight: 0, paddingBottom: 3, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> S14-Credentials.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0, backgroundColor: "#F6E3C6", borderRadius: 10 }}>
              <SvgXml xml={SVG[2]} width={18} height={18} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", lineHeight: 19 }}>Certifications</Text>
            </View>
            <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#F6E3C6", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#B7791F", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#7A4E0E" }}>1 expiring</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 46, paddingTop: 3, paddingRight: 0, paddingBottom: 3, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> S17-BackgroundCheck.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 10 }}>
              <SvgXml xml={SVG[3]} width={18} height={18} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", lineHeight: 19 }}>Background check</Text>
            </View>
            <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>Cleared</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 46, paddingTop: 3, paddingRight: 0, paddingBottom: 3, paddingLeft: 0 }}>{/* -> S16-Languages.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 10 }}>
              <SvgXml xml={SVG[4]} width={18} height={18} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", lineHeight: 19 }}>Languages</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>English · Spanish</Text>
            </View>
            <SvgXml xml={SVG[5]} width={18} height={18} />
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, flexShrink: 1 }}>WORK</Text>
        </View>
        <View style={{ paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 46, paddingTop: 3, paddingRight: 0, paddingBottom: 3, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> S11-Availability.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 10 }}>
              <SvgXml xml={SVG[6]} width={18} height={18} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", lineHeight: 19 }}>Availability and time off</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Weekdays after 2 PM</Text>
            </View>
            <SvgXml xml={SVG[7]} width={18} height={18} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 46, paddingTop: 3, paddingRight: 0, paddingBottom: 3, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> S52-InviteFamily.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 10 }}>
              <SvgXml xml={SVG[8]} width={18} height={18} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", lineHeight: 19 }}>Invite a family you sit for</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>They see your shifts with their kids</Text>
            </View>
            <SvgXml xml={SVG[9]} width={18} height={18} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 46, paddingTop: 3, paddingRight: 0, paddingBottom: 3, paddingLeft: 0 }}>{/* -> S35-GetFound.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 10 }}>
              <SvgXml xml={SVG[10]} width={18} height={18} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", lineHeight: 19 }}>Get found by new families</Text>
            </View>
            <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>On</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, flexShrink: 1 }}>MONEY</Text>
        </View>
        <View style={{ paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 46, paddingTop: 3, paddingRight: 0, paddingBottom: 3, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> S7-Pay.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 10 }}>
              <SvgXml xml={SVG[11]} width={18} height={18} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", lineHeight: 19 }}>Hours and pay</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>$342 this week</Text>
            </View>
            <SvgXml xml={SVG[12]} width={18} height={18} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 46, paddingTop: 3, paddingRight: 0, paddingBottom: 3, paddingLeft: 0 }}>{/* -> S30-PayoutsReady.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 10 }}>
              <SvgXml xml={SVG[13]} width={18} height={18} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", lineHeight: 19 }}>Invoices and payouts</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Next payout Fri · Chase ••42</Text>
            </View>
            <SvgXml xml={SVG[14]} width={18} height={18} />
          </View>
        </View>
        <View style={{ paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 46, paddingTop: 3, paddingRight: 0, paddingBottom: 3, paddingLeft: 0 }}>{/* -> S12-Privacy.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 10 }}>
              <SvgXml xml={SVG[15]} width={18} height={18} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", lineHeight: 19 }}>Settings, privacy and help</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Location sharing, notifications, sign out</Text>
            </View>
            <SvgXml xml={SVG[16]} width={18} height={18} />
          </View>
        </View>
      </View>
      {/* tab bar: drawn by the app's tab navigator */}
    </View>
  );
}
