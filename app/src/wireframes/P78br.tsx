// GENERATED from wireframe P78br-InviteMemberReadOnly.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"position: absolute; right: 12px; top: 15px; fill: none; stroke: #4B5960; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; pointer-events: none\"><path d=\"M6 9l6 6 6-6\"></path></svg>"
];

/** Add a family member · read only */
export default function WF_P78br() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> P78-FamilyMembers.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Add a family member</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>4 seats · 2 used</Text>
        <View style={{ flexDirection: "column", gap: 10 }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flexDirection: "column", gap: 6, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Name</Text></View>
              <TextInput placeholder="" defaultValue="Sue" placeholderTextColor="#6B7980" style={{ height: 48, minWidth: 0, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
            </View>
            <View style={{ flexDirection: "column", gap: 6, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Relation</Text></View>
              <View style={{ flexDirection: "column" }}>
                <TextInput placeholder="" defaultValue="" placeholderTextColor="#6B7980" style={{ width: "100%", height: 48, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
                <SvgXml xml={SVG[1]} width={18} height={18} />
              </View>
            </View>
          </View>
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, marginTop: 2 }}>ACCESS</Text>
        <View style={{ flexDirection: "column", paddingTop: 0, paddingRight: 16, paddingBottom: 0, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 58, paddingTop: 12, paddingRight: 0, paddingBottom: 12, paddingLeft: 0 }}>
            <View style={{ flexDirection: "column", gap: 2, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Full access</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>Sees the kids, schedule, live shift and updates. Can message the sitter.</Text>
            </View>
            <View style={{ width: 50, height: 30, flexShrink: 0, backgroundColor: "#C3CCD5", borderRadius: 15, flexDirection: "column" }}>
              <View style={{ width: 24, height: 24, top: 3, left: 3, backgroundColor: "#FFFFFF", borderRadius: 12, position: "absolute", flexDirection: "column" }}>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 6 }}>
          <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Email (optional)</Text></View>
          <TextInput placeholder="" defaultValue="sue@example.com" placeholderTextColor="#6B7980" style={{ height: 48, minWidth: 0, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#8A979D" }} />
        </View>
        <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", marginTop: 2 }}>They’ll get this:</Text>
        <View style={{ paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}><Text style={{ fontFamily: font.body, fontSize: 16, color: "#1B2328" }}><Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", lineHeight: 21 }}>Hi Sue! It’s Jen. I added you to the Lee family on BabyBadger so you can see Ava and Leo’s schedule and updates: <Text style={{ fontFamily: font.body, fontSize: 15, color: "#34526E", lineHeight: 21, textDecorationLine: "underline" }}>babybadger.app/m/3f9a…</Text></Text></Text></View>
      </View>
      <View style={{ flexDirection: "column", gap: 8, paddingTop: 4, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> P78s-InviteMemberSent.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Send by text</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, flexGrow: 1, flexBasis: 0, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>{/* -> P78s-InviteMemberSent.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#47698A" }}>Email</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, flexGrow: 1, flexBasis: 0, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>{/* -> P78s-InviteMemberSent.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#47698A" }}>Copy link</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
