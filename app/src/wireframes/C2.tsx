// GENERATED from wireframe C2-ArrivalAlert.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  
];

/** Arrival alert */
export default function WF_C2() {
  return (
    <View style={{ flex: 1, backgroundColor: "#2B2B2B", flexDirection: "column", overflow: "hidden" }}>
      <View style={{}}><Text style={{ fontFamily: font.body, fontSize: 15, color: "#D6D6D6" }}>Thursday, October 1</Text></View>
      <View style={{}}><Text style={{ fontFamily: font.body, fontSize: 76, color: "#FFFFFF", lineHeight: 84 }}>4:27</Text></View>
      <View style={{ flexDirection: "column", gap: 4, width: "100%", paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5E5E5E", flexShrink: 1 }}>Sitter app · Arrival</Text>
          <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5E5E5E", flexShrink: 1 }}>now</Text>
        </View>
        <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1F1F1F" }}>Maya and Ava arrived at Riverside soccer fields</Text></View>
        <View style={{}}><Text style={{ fontFamily: font.body, fontSize: 14, color: "#3F3F3F" }}>Trip by car took 17 min. Tap to see the map.</Text></View>
      </View>
      <View style={{ flexDirection: "column", gap: 4, width: "100%", paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#F2F2F2", borderRadius: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5E5E5E", flexShrink: 1 }}>Sitter app · Trip started</Text>
          <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5E5E5E", flexShrink: 1 }}>4:10 PM</Text>
        </View>
        <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1F1F1F" }}>Maya left home with Ava</Text></View>
        <View style={{}}><Text style={{ fontFamily: font.body, fontSize: 14, color: "#3F3F3F" }}>Heading to Riverside soccer fields by car</Text></View>
      </View>
    </View>
  );
}
