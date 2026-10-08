// GENERATED from wireframe P12p-PhoneSheet.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  
];

/** Settings · your phone */
export default function WF_P12p() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "column", gap: 10, paddingTop: 20, paddingRight: 20, paddingBottom: 20, paddingLeft: 20, opacity: 0.35 }}>
        <Text style={{ fontFamily: font.display, fontSize: 24, color: "#1B2328" }}>Settings</Text>
        <View style={{ height: 260, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
        </View>
        <View style={{ height: 160, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
        </View>
      </View>
      <View style={{ backgroundColor: "rgba(27,35,40,0.45)", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, flexDirection: "column" }}>
      </View>
      <View style={{ flexDirection: "column", gap: 14, left: 0, right: 0, bottom: 0, paddingTop: 12, paddingRight: 20, paddingBottom: 32, paddingLeft: 20, backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, position: "absolute" }}>
        <View style={{ alignSelf: "center", width: 40, height: 5, backgroundColor: "#C3CCD5", borderRadius: 3, flexDirection: "column" }}>
        </View>
        <View style={{ flexDirection: "column", gap: 2 }}>
          <Text style={{ fontFamily: font.display, fontSize: 24, color: "#1B2328" }}>Your phone</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", lineHeight: 20 }}>Your sitters can call or text you from the family page. Only sitters who signed your notice and your family members see it.</Text>
        </View>
        <View style={{ flexDirection: "column", gap: 6 }}>
          <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Phone number</Text></View>
          <TextInput placeholder="" defaultValue="(813) 555-0142" placeholderTextColor="#6B7980" style={{ height: 52, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
        </View>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> P12b-SettingsAccount.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Save</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 40 }}>{/* -> P12b-SettingsAccount.dc.html */}
          <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#A1321F" }}>Remove my number</Text>
        </View>
      </View>
    </View>
  );
}
