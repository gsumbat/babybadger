// GENERATED from wireframe S3e-TodayLate.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #FFFFFF; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v5l3 2\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6h11M9 12h11M9 18h11M4.5 6h0M4.5 12h0M4.5 18h0\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 5h16v11H9l-5 4z\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"9\" r=\"5.5\"></circle><path d=\"M8.5 13.5L7 21l5-2.5 5 2.5-1.5-7.5\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18M8 3v4M16 3v4\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M6 3h12v18l-3-2-3 2-3-2-3 2z\"></path><path d=\"M9 8h6M9 12h6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v5l3 2\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18M8 3v4M16 3v4M9.5 13.5l5 5M14.5 13.5l-5 5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M6 3h12v18l-3-2-3 2-3-2-3 2z\"></path><path d=\"M9 8h6M9 12h6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><rect x=\"3\" y=\"6\" width=\"18\" height=\"14\" rx=\"2.5\"></rect><path d=\"M3 10h18M16 15h2\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"9\" r=\"5.5\"></circle><path d=\"M8.5 13.5L7 21l5-2.5 5 2.5-1.5-7.5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 20h4L19 9l-4-4L4 16z\"></path><path d=\"M13.5 6.5l4 4\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"11\" cy=\"11\" r=\"6.5\"></circle><path d=\"M16 16l4.5 4.5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 13l2.5-7h11L20 13v6H4z\"></path><path d=\"M4 13h5l1 2h4l1-2h5\"></path></svg>"
];

/** Today · running late (told) · Sitter home · shift today */
export default function WF_S3e() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 18, paddingRight: 20, paddingBottom: 10, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", minWidth: 0, flexShrink: 1 }}>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>Thursday, Oct 1</Text>
          <Text style={{ fontFamily: font.display, fontSize: 24, color: "#1B2328", marginVertical: -5.22 }}>Hi Maya</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 22 }}>{/* -> S39-Me.dc.html */}
          <Text style={{ fontFamily: font.display, fontSize: 19, color: "#FFFFFF" }}>M</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 10, minHeight: 0, flexGrow: 1, paddingTop: 0, paddingRight: 20, paddingBottom: 10, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", gap: 8, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, borderWidth: 2.0, borderColor: "#47698A", ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: font.display, fontSize: 18, color: "#1B2328", flexShrink: 1 }}>The Lee family</Text>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>3:00 – 7:00 PM</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#B7791F", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#7A4E0E" }}>Told the family · 15 min late</Text>
            </View>
            <View style={{ flexShrink: 1 }}><Text numberOfLines={1} style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#47698A", textDecorationLine: "underline" }}>Running late?</Text></View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, flexGrow: 1, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> S4-ActiveShift.dc.html */}
              <SvgXml xml={SVG[0]} width={20} height={20} />
              <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Clock in</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 48, height: 48, backgroundColor: "#DCE7F1", borderRadius: 24, flexShrink: 1 }}>{/* -> S10-Family.dc.html */}
              <SvgXml xml={SVG[1]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 48, height: 48, backgroundColor: "#DCE7F1", borderRadius: 24, flexShrink: 1 }}>{/* -> S37-Messages.dc.html */}
              <SvgXml xml={SVG[2]} width={22} height={22} />
            </View>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 8, borderTopWidth: 1.0, borderTopColor: "#EEF1F4" }}>{/* -> S6a-CalDay.dc.html */}
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#1B2328", flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#1B2328" }}>Then</Text> · Ortiz family, bedtime for Sam</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", flexShrink: 1 }}>7:30 – 10 PM</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, flexShrink: 1 }}>NEEDS YOU</Text>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", flexShrink: 1 }}>3</Text>
        </View>
        <View style={{ paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 54, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> S41-CertDetail.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#F6E3C6", borderRadius: 12 }}>
              <SvgXml xml={SVG[3]} width={20} height={20} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", lineHeight: 19 }}>Infant CPR expires in 21 days</Text>
              <View style={{ overflow: "hidden", flexShrink: 1, minHeight: 0, justifyContent: "center" }}><Text numberOfLines={1} style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", lineHeight: 16 }}>Renew and share the new card · Lee family requires it</Text></View>
            </View>
            <SvgXml xml={SVG[4]} width={18} height={18} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 54, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> S20-ShiftRequest.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 12 }}>
              <SvgXml xml={SVG[5]} width={20} height={20} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", lineHeight: 19 }}>Lee family asks for Sat 6 – 10 PM</Text>
              <View style={{ overflow: "hidden", flexShrink: 1, minHeight: 0, justifyContent: "center" }}><Text numberOfLines={1} style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", lineHeight: 16 }}>Overlaps your time off · answer by Fri</Text></View>
            </View>
            <SvgXml xml={SVG[6]} width={18} height={18} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 54 }}>{/* -> S32-InvoiceStatus.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#E8ECF1", borderRadius: 12 }}>
              <SvgXml xml={SVG[7]} width={20} height={20} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", lineHeight: 19 }}>Ortiz invoice unpaid for 5 days</Text>
              <View style={{ overflow: "hidden", flexShrink: 1, minHeight: 0, justifyContent: "center" }}><Text numberOfLines={1} style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", lineHeight: 16 }}>$75 · send a reminder</Text></View>
            </View>
            <SvgXml xml={SVG[8]} width={18} height={18} />
          </View>
        </View>
        <View style={{ flexDirection: "column", backgroundColor: "#FFFFFF", borderRadius: 18, ...cardShadow }}>{/* -> S7-Pay.dc.html */}
          <View style={{ flexDirection: "row", gap: 0 }}>
            <View style={{ flexDirection: "column", paddingTop: 8, paddingRight: 12, paddingBottom: 8, paddingLeft: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.display, fontSize: 19, color: "#1B2328", marginVertical: -4.22 }}>18 h</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>booked this week</Text>
            </View>
            <View style={{ flexDirection: "column", paddingTop: 8, paddingRight: 12, paddingBottom: 8, paddingLeft: 12, borderLeftWidth: 1.0, borderLeftColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.display, fontSize: 19, color: "#1B2328", marginVertical: -4.22 }}>$342</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>earned this week</Text>
            </View>
            <View style={{ flexDirection: "column", paddingTop: 8, paddingRight: 12, paddingBottom: 8, paddingLeft: 12, borderLeftWidth: 1.0, borderLeftColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.display, fontSize: 19, color: "#1B2328", marginVertical: -4.22 }}>Fri</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>next payout</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, flexShrink: 1 }}>TOOLS</Text>
        </View>
        <View style={{ flexDirection: "column", gap: 8 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, height: 62, paddingTop: 0, paddingRight: 4, paddingBottom: 0, paddingLeft: 4, backgroundColor: "#DCE7F1", borderRadius: 16, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S11-Availability.dc.html */}
              <SvgXml xml={SVG[9]} width={22} height={22} />
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#34526E", lineHeight: 14, textAlign: "center" }}>Availability</Text>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, height: 62, paddingTop: 0, paddingRight: 4, paddingBottom: 0, paddingLeft: 4, backgroundColor: "#DCE7F1", borderRadius: 16, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S11-Availability.dc.html */}
              <SvgXml xml={SVG[10]} width={22} height={22} />
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#34526E", lineHeight: 14, textAlign: "center" }}>Time off</Text>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, height: 62, paddingTop: 0, paddingRight: 4, paddingBottom: 0, paddingLeft: 4, backgroundColor: "#DCE7F1", borderRadius: 16, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S31-CreateInvoice.dc.html */}
              <SvgXml xml={SVG[11]} width={22} height={22} />
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#34526E", lineHeight: 14, textAlign: "center" }}>New invoice</Text>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, height: 62, paddingTop: 0, paddingRight: 4, paddingBottom: 0, paddingLeft: 4, backgroundColor: "#DCE7F1", borderRadius: 16, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S7-Pay.dc.html */}
              <SvgXml xml={SVG[12]} width={22} height={22} />
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#34526E", lineHeight: 14, textAlign: "center" }}>Hours and pay</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, height: 62, paddingTop: 0, paddingRight: 4, paddingBottom: 0, paddingLeft: 4, backgroundColor: "#DCE7F1", borderRadius: 16, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S14-Credentials.dc.html */}
              <SvgXml xml={SVG[13]} width={22} height={22} />
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#34526E", lineHeight: 14, textAlign: "center" }}>Credentials</Text>
              <View style={{ width: 9, height: 9, top: 8, right: 10, backgroundColor: "#B7791F", borderRadius: 5, position: "absolute", flexDirection: "column" }}>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, height: 62, paddingTop: 0, paddingRight: 4, paddingBottom: 0, paddingLeft: 4, backgroundColor: "#DCE7F1", borderRadius: 16, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S40-PersonalDetails.dc.html */}
              <SvgXml xml={SVG[14]} width={22} height={22} />
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#34526E", lineHeight: 14, textAlign: "center" }}>My details</Text>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, height: 62, paddingTop: 0, paddingRight: 4, paddingBottom: 0, paddingLeft: 4, backgroundColor: "#DCE7F1", borderRadius: 16, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S35-GetFound.dc.html */}
              <SvgXml xml={SVG[15]} width={22} height={22} />
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#34526E", lineHeight: 14, textAlign: "center" }}>Get found</Text>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, height: 62, paddingTop: 0, paddingRight: 4, paddingBottom: 0, paddingLeft: 4, backgroundColor: "#DCE7F1", borderRadius: 16, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S20-ShiftRequest.dc.html */}
              <SvgXml xml={SVG[16]} width={22} height={22} />
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#34526E", lineHeight: 14, textAlign: "center" }}>Requests</Text>
            </View>
          </View>
        </View>
      </View>
      {/* tab bar: drawn by the app's tab navigator */}
    </View>
  );
}
