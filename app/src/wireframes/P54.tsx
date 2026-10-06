// GENERATED from wireframe P54-Sitters.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
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
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>"
];

/** Sitters */
export default function WF_P54() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 20, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <Text style={{ fontFamily: font.display, fontSize: 26, color: "#1B2328", flexShrink: 1 }}>Sitters</Text>
        <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 4, height: 36, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>{/* -> P23-InviteAccess.dc.html */}
          <SvgXml xml={SVG[0]} width={16} height={16} />
          <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#47698A" }}>Invite</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 12, minHeight: 0, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", gap: 12, paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <Text style={{ fontFamily: font.display, fontSize: 19, color: "#1B2328", marginVertical: -4.22 }}>When do you need someone?</Text>
          <View style={{ flexDirection: "row", gap: 6, overflow: "hidden", flexShrink: 1, minHeight: 0 }}>
            <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> P42-Pool.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Tonight</Text>
            </View>
            <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> P42-Pool.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Sat evening</Text>
            </View>
            <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> P42-Pool.dc.html */}
              <SvgXml xml={SVG[1]} width={16} height={16} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Pick a time</Text>
            </View>
          </View>
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>We check your pool first, then show new sitters nearby.</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, flexShrink: 1 }}>YOUR POOL · 5</Text>
          <View style={{ flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#47698A", textDecorationLine: "underline" }}>See availability</Text></View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 14, paddingRight: 10, paddingBottom: 14, paddingLeft: 10, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "column", alignItems: "center", gap: 4, width: 60, flexShrink: 0 }}>{/* -> P11-SitterProfile.dc.html */}
            <View style={{ flexDirection: "column" }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 52, height: 52, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 26 }}>
                <Text style={{ fontFamily: font.displayBold, fontSize: 23, color: "#FFFFFF" }}>M</Text>
              </View>
              <View style={{ width: 14, height: 14, right: 0, bottom: 0, backgroundColor: "#1F8A4D", borderRadius: 7, borderWidth: 2.0, borderColor: "#FFFFFF", position: "absolute", flexDirection: "column" }}>
              </View>
            </View>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>Maya</Text>
            <Text numberOfLines={1} style={{ fontFamily: font.body, fontSize: 11, color: "#4B5960" }}>On shift</Text>
          </View>
          <View style={{ flexDirection: "column", alignItems: "center", gap: 4, width: 60, flexShrink: 0 }}>{/* -> P44-PoolSitter.dc.html */}
            <View style={{ flexDirection: "column" }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 52, height: 52, flexShrink: 0, backgroundColor: "#5E7F6A", borderRadius: 26 }}>
                <Text style={{ fontFamily: font.displayBold, fontSize: 23, color: "#FFFFFF" }}>P</Text>
              </View>
              <View style={{ width: 14, height: 14, right: 0, bottom: 0, backgroundColor: "#47698A", borderRadius: 7, borderWidth: 2.0, borderColor: "#FFFFFF", position: "absolute", flexDirection: "column" }}>
              </View>
            </View>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>Priya</Text>
            <Text numberOfLines={1} style={{ fontFamily: font.body, fontSize: 11, color: "#4B5960" }}>Free tonight</Text>
          </View>
          <View style={{ flexDirection: "column", alignItems: "center", gap: 4, width: 60, flexShrink: 0 }}>{/* -> P11-SitterProfile.dc.html */}
            <View style={{ flexDirection: "column" }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 52, height: 52, flexShrink: 0, backgroundColor: "#8A6A4E", borderRadius: 26 }}>
                <Text style={{ fontFamily: font.displayBold, fontSize: 23, color: "#FFFFFF" }}>J</Text>
              </View>
              <View style={{ width: 14, height: 14, right: 0, bottom: 0, backgroundColor: "#47698A", borderRadius: 7, borderWidth: 2.0, borderColor: "#FFFFFF", position: "absolute", flexDirection: "column" }}>
              </View>
            </View>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>Jordan</Text>
            <Text numberOfLines={1} style={{ fontFamily: font.body, fontSize: 11, color: "#4B5960" }}>Free tonight</Text>
          </View>
          <View style={{ flexDirection: "column", alignItems: "center", gap: 4, width: 60, flexShrink: 0 }}>{/* -> P11-SitterProfile.dc.html */}
            <View style={{ flexDirection: "column" }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 52, height: 52, flexShrink: 0, backgroundColor: "#6F6194", borderRadius: 26 }}>
                <Text style={{ fontFamily: font.displayBold, fontSize: 23, color: "#FFFFFF" }}>S</Text>
              </View>
              <View style={{ width: 14, height: 14, right: 0, bottom: 0, backgroundColor: "#AEB8C2", borderRadius: 7, borderWidth: 2.0, borderColor: "#FFFFFF", position: "absolute", flexDirection: "column" }}>
              </View>
            </View>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>Sofia</Text>
            <Text numberOfLines={1} style={{ fontFamily: font.body, fontSize: 11, color: "#4B5960" }}>Busy</Text>
          </View>
          <View style={{ flexDirection: "column", alignItems: "center", gap: 4, width: 60, flexShrink: 0 }}>{/* -> P11-SitterProfile.dc.html */}
            <View style={{ flexDirection: "column" }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 52, height: 52, flexShrink: 0, backgroundColor: "#5F6D74", borderRadius: 26 }}>
                <Text style={{ fontFamily: font.displayBold, fontSize: 23, color: "#FFFFFF" }}>D</Text>
              </View>
              <View style={{ width: 14, height: 14, right: 0, bottom: 0, backgroundColor: "#AEB8C2", borderRadius: 7, borderWidth: 2.0, borderColor: "#FFFFFF", position: "absolute", flexDirection: "column" }}>
              </View>
            </View>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>Dana</Text>
            <Text numberOfLines={1} style={{ fontFamily: font.body, fontSize: 11, color: "#4B5960" }}>Away</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, backgroundColor: "#DCE7F1", borderRadius: 24 }}>{/* -> P48-Find.dc.html */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 48, height: 48, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 24 }}>
            <SvgXml xml={SVG[2]} width={24} height={24} />
          </View>
          <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.display, fontSize: 18, color: "#34526E", marginVertical: -3.42 }}>Find a new sitter</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#34526E" }}>48 verified sitters within 3 mi of you</Text>
          </View>
          <SvgXml xml={SVG[3]} width={20} height={20} />
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6 }}>IN PROGRESS</Text>
        <View style={{ paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 60, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> P53-MeetSent.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#8A5A7A", borderRadius: 18 }}>
              <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#FFFFFF" }}>E</Text>
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Video meet with Elena</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Tue, Oct 6 · 7:00 PM · waiting on her</Text>
            </View>
            <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCE7F1", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#47698A", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#34526E" }}>Requested</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 60, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> P51-MarketProfile.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#5E7F6A", borderRadius: 18 }}>
              <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#FFFFFF" }}>G</Text>
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Grace O.</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Saved from search · 2.0 mi</Text>
            </View>
            <SvgXml xml={SVG[4]} width={20} height={20} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 60 }}>{/* -> P27-Sitters.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#5F6D74", borderRadius: 18 }}>
              <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#FFFFFF" }}>D</Text>
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Invite to Dana W.</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Expired Sep 29</Text>
            </View>
            <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, backgroundColor: "#8A979D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960" }}>Resend</Text>
            </View>
          </View>
        </View>
      </View>
      {/* tab bar: drawn by the app's tab navigator */}
    </View>
  );
}
