// GENERATED from wireframe S2-Consent.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"19\" height=\"19\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M7 3h7l4 4v14H7z\"></path><path d=\"M14 3v4h4M10 12h5M10 16h5\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>",
  "<svg width=\"19\" height=\"19\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M7 3h7l4 4v14H7z\"></path><path d=\"M14 3v4h4M10 12h5M10 16h5\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>",
  "<svg width=\"19\" height=\"19\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M7 3h7l4 4v14H7z\"></path><path d=\"M14 3v4h4M10 12h5M10 16h5\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>"
];

/** Consent and notice */
export default function WF_S2() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> S1-Invite.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#4B5960", flexShrink: 1 }}>Before your first shift</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <Text style={{ fontFamily: font.display, fontSize: 24, color: "#1B2328", lineHeight: 29 }}>Location is shared only while you're working</Text>
        <View style={{ flexDirection: "column", gap: 8, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", height: 14, borderRadius: 7, overflow: "hidden", flexShrink: 1, minHeight: 0 }}>
            <View style={{ flexGrow: 1, backgroundColor: "#E8ECF1", flexShrink: 1, flexDirection: "column" }}>
            </View>
            <View style={{ flexGrow: 2, backgroundColor: "#47698A", flexShrink: 1, flexDirection: "column" }}>
            </View>
            <View style={{ flexGrow: 1, backgroundColor: "#E8ECF1", flexShrink: 1, flexDirection: "column" }}>
            </View>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#6B7980", flexShrink: 1 }}>Off</Text>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#47698A", flexShrink: 1 }}>Clock in → Clock out</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#6B7980", flexShrink: 1 }}>Off</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", paddingTop: 4, paddingRight: 16, paddingBottom: 4, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 9, paddingRight: 0, paddingBottom: 9, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", flexShrink: 1 }}>Employer</Text>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>The Lee family</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 9, paddingRight: 0, paddingBottom: 9, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", flexShrink: 1 }}>Collected</Text>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>Location, times, entries</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 9, paddingRight: 0, paddingBottom: 9, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", flexShrink: 1 }}>Seen by</Text>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>Parents in this family</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 9, paddingRight: 0, paddingBottom: 9, paddingLeft: 0 }}>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", flexShrink: 1 }}>Kept for</Text>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>[RETENTION PERIOD]</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 6 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, flexShrink: 1 }}>READ BEFORE YOU SIGN</Text>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960", flexShrink: 1 }}>All 3 required</Text>
          </View>
          <View style={{ paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 50, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> S2a-MonitoringNotice.dc.html */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 34, height: 34, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 10 }}>
                <SvgXml xml={SVG[1]} width={19} height={19} />
              </View>
              <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
                <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", lineHeight: 19 }}>Monitoring notice</Text>
                <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>From the Lee family · 2 min read</Text>
              </View>
              <SvgXml xml={SVG[2]} width={18} height={18} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 50, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> S2b-TermsPrivacy.dc.html */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 34, height: 34, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 10 }}>
                <SvgXml xml={SVG[3]} width={19} height={19} />
              </View>
              <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
                <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", lineHeight: 19 }}>Terms for sitters</Text>
                <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>BabyBadger · v1.0, Oct 2026</Text>
              </View>
              <SvgXml xml={SVG[4]} width={18} height={18} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 50 }}>{/* -> S2b-TermsPrivacy.dc.html */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 34, height: 34, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 10 }}>
                <SvgXml xml={SVG[5]} width={19} height={19} />
              </View>
              <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
                <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", lineHeight: 19 }}>Privacy policy</Text>
                <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>How BabyBadger handles your data</Text>
              </View>
              <SvgXml xml={SVG[6]} width={18} height={18} />
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, minHeight: 44 }}>
          <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#C3CCD5", backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }}></View>
          <View style={{ flexShrink: 1 }}><Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20 }}>I've read and agree to the <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#47698A", lineHeight: 20, textDecorationLine: "underline" }}>monitoring notice</Text>, <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#47698A", lineHeight: 20, textDecorationLine: "underline" }}>Terms</Text> and <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#47698A", lineHeight: 20, textDecorationLine: "underline" }}>Privacy policy</Text></Text></View>
        </View>
        <View style={{ flexDirection: "column", gap: 6 }}>
          <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Type your full name to sign</Text></View>
          <TextInput placeholder="Full name" defaultValue="" placeholderTextColor="#6B7980" style={{ height: 46, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 6, paddingTop: 8, paddingRight: 20, paddingBottom: 28, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, backgroundColor: "#47698A", borderRadius: 999 }}>{/* -> S3-Today.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Sign and allow location</Text>
        </View>
        <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", textAlign: "center" }}>A signed copy goes to you and the family. Next, your phone asks for location.</Text>
      </View>
    </View>
  );
}
