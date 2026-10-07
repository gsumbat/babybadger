// GENERATED from wireframe P25-InvitePending.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #FFFFFF; stroke-width: 2.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #FFFFFF; stroke-width: 2.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>"
];

/** Invite pending */
export default function WF_P25() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> P27-Sitters.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Maya</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#F6E3C6", borderRadius: 999 }}>
          <View style={{ width: 7, height: 7, backgroundColor: "#B7791F", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
          </View>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#7A4E0E" }}>Waiting</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", paddingTop: 16, paddingRight: 16, paddingBottom: 6, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 26, height: 26, flexShrink: 0, backgroundColor: "#1F8A4D", borderRadius: 13 }}>
                <SvgXml xml={SVG[1]} width={15} height={15} />
              </View>
              <View style={{ width: 2, minHeight: 14, flexGrow: 1, backgroundColor: "#1F8A4D", flexDirection: "column" }}>
              </View>
            </View>
            <View style={{ flexDirection: "column", paddingBottom: 10, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328" }}>Invite sent</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>By text · today 5:42 PM</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 26, height: 26, flexShrink: 0, backgroundColor: "#1F8A4D", borderRadius: 13 }}>
                <SvgXml xml={SVG[2]} width={15} height={15} />
              </View>
              <View style={{ width: 2, minHeight: 14, flexGrow: 1, backgroundColor: "#1F8A4D", flexDirection: "column" }}>
              </View>
            </View>
            <View style={{ flexDirection: "column", paddingBottom: 10, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328" }}>Opened</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>Maya confirmed her email · 5:50 PM</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 26, height: 26, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 13, borderWidth: 3.0, borderColor: "#47698A" }}>
                <View style={{ width: 9, height: 9, backgroundColor: "#47698A", borderRadius: 5, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
              <View style={{ width: 2, minHeight: 14, flexGrow: 1, backgroundColor: "#DDE3EA", flexDirection: "column" }}>
              </View>
            </View>
            <View style={{ flexDirection: "column", paddingBottom: 10, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328" }}>Reviewing what you’ll see</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>She agrees to location sharing and signs the notice</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 1 }}>
              <View style={{ width: 26, height: 26, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 13, borderWidth: 2.0, borderColor: "#C3CCD5", flexDirection: "column" }}>
              </View>
              <View style={{ width: 2, minHeight: 14, flexGrow: 1, backgroundColor: "#DDE3EA", flexDirection: "column" }}>
              </View>
            </View>
            <View style={{ flexDirection: "column", paddingBottom: 10, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#5F6D74" }}>Credentials</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>Missing ones are flagged for her to add</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 1 }}>
              <View style={{ width: 26, height: 26, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 13, borderWidth: 2.0, borderColor: "#C3CCD5", flexDirection: "column" }}>
              </View>
            </View>
            <View style={{ flexDirection: "column", paddingBottom: 10, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#5F6D74" }}>Ready to book</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>You can send her a first shift</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#F3F5F8", borderRadius: 14, borderWidth: 1.0, borderColor: "#C3CCD5", borderStyle: "dashed" }}>
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18, flexGrow: 1, flexShrink: 1 }}>See it from Maya’s side</Text>
          <View style={{ flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#47698A", textDecorationLine: "underline" }}>Open her text ›</Text></View>
        </View>
        <View style={{ flexDirection: "column", paddingTop: 0, paddingRight: 16, paddingBottom: 0, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 48, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Expires</Text>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Thu, Oct 8</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 48 }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Reminder</Text>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", flexShrink: 1 }}>Sent to Maya after 2 days</Text>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 4, paddingTop: 4, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, flexGrow: 1, flexBasis: 0, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#47698A" }}>Resend</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, flexGrow: 1, flexBasis: 0, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#47698A" }}>Copy link</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 40 }}>{/* -> P27-Sitters.dc.html */}
          <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#A1321F" }}>Cancel invite</Text>
        </View>
      </View>
    </View>
  );
}
