// GENERATED from wireframe S52-InviteFamily.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z\"></path><path d=\"M8.5 12l2.5 2.5 4.5-4.5\"></path></svg>"
];

/** Invite a family */
export default function WF_S52() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> S39-Me.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Invite a family</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", lineHeight: 22 }}>A family you already sit for. They see your shifts with their kids and choose what you see.</Text>
        <View style={{ flexDirection: "column", gap: 10 }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flexDirection: "column", gap: 6, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Parent’s first name</Text></View>
              <TextInput placeholder="" defaultValue="Dana" placeholderTextColor="#6B7980" style={{ height: 48, minWidth: 0, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
            </View>
            <View style={{ flexDirection: "column", gap: 6, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Family name</Text></View>
              <TextInput placeholder="" defaultValue="The Kim family" placeholderTextColor="#6B7980" style={{ height: 48, minWidth: 0, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 6 }}>
          <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Email (optional)</Text></View>
          <TextInput placeholder="" defaultValue="dana@example.com" placeholderTextColor="#6B7980" style={{ height: 48, minWidth: 0, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#8A979D" }} />
        </View>
        <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", marginTop: 2 }}>They’ll get this:</Text>
        <View style={{ paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}><Text style={{ fontFamily: font.body, fontSize: 16, color: "#1B2328" }}><Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", lineHeight: 21 }}>Hi Dana! It’s Maya. I use BabyBadger for my babysitting schedule. Here’s an invite so you can see my shifts with your kids: <Text style={{ fontFamily: font.body, fontSize: 15, color: "#34526E", lineHeight: 21, textDecorationLine: "underline" }}>babybadger.app/f/7c41…</Text></Text></Text></View>
        <View style={{ flexDirection: "row", gap: 12, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#DCE7F1", borderRadius: 16 }}>
          <SvgXml xml={SVG[1]} width={24} height={24} />
          <View style={{ flexDirection: "column", gap: 4, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#34526E" }}>Only through your link</Text>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20 }}>Families find you only from a link you send. They choose what you see, and you accept first.</Text>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 8, paddingTop: 4, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> S52b-InviteFamilySent.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Send by text</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, flexGrow: 1, flexBasis: 0, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>{/* -> S52b-InviteFamilySent.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#47698A" }}>Email</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, flexGrow: 1, flexBasis: 0, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>{/* -> S52b-InviteFamilySent.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#47698A" }}>Copy link</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
