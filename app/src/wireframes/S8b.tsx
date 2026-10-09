// GENERATED from wireframe S8b-StartTripElse.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  
];

/** Start a Trip · Somewhere Else */
export default function WF_S8b() {
  return (
    <View style={{ flex: 1, backgroundColor: "#5E6B70", flexDirection: "column", overflow: "hidden", justifyContent: "flex-end" }}>
      <View style={{ flexDirection: "column", gap: 16, paddingTop: 12, paddingRight: 20, paddingBottom: 32, paddingLeft: 20, backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
        <View style={{ alignSelf: "center", width: 40, height: 5, backgroundColor: "#C3CCD5", borderRadius: 3, flexDirection: "column" }}>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexShrink: 1 }}>Start a trip</Text>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> S4-ActiveShift.dc.html */}
            <Text style={{ fontFamily: font.body, fontSize: 20, color: "#1B2328" }}>×</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 8, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0 }}>
          <View style={{ paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Where to?</Text></View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, borderRadius: 20, borderWidth: 1.0, borderColor: "#E6EAEF" }}>
            <TextInput placeholder="" defaultValue="" placeholderTextColor="#6B7980" style={{ width: 20, height: 20, flexShrink: 1, fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
            <View style={{ width: 32, height: 32, flexShrink: 0, backgroundColor: "#F3E1E3", borderRadius: 16, flexDirection: "column" }}>
            </View>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyMedium, fontSize: 15, color: "#1B2328" }}>Riverside soccer fields</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#34526E" }}>On today's plan · 4:10 PM</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, borderRadius: 20, borderWidth: 1.0, borderColor: "#E6EAEF" }}>
            <TextInput placeholder="" defaultValue="" placeholderTextColor="#6B7980" style={{ width: 20, height: 20, flexShrink: 1, fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
            <View style={{ width: 32, height: 32, flexShrink: 0, backgroundColor: "#F3E1E3", borderRadius: 16, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.bodyMedium, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Lincoln Elementary</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, borderRadius: 20, borderWidth: 1.0, borderColor: "#E6EAEF" }}>
            <TextInput placeholder="" defaultValue="" placeholderTextColor="#6B7980" style={{ width: 20, height: 20, flexShrink: 1, fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
            <View style={{ width: 32, height: 32, flexShrink: 0, backgroundColor: "#F3E1E3", borderRadius: 16, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.bodyMedium, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Oak Street playground</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 2.0, borderColor: "#47698A", borderStyle: "dashed" }}>
            <TextInput placeholder="" defaultValue="" placeholderTextColor="#6B7980" style={{ width: 20, height: 20, flexShrink: 1, fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyMedium, fontSize: 15, color: "#1B2328" }}>Somewhere else</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#5F6D74" }}>Parents are asked first</Text>
            </View>
          </View>
          <View style={{ width: 1, height: 1, position: "absolute", overflow: "hidden", flexShrink: 1, minHeight: 0, justifyContent: "center" }}><Text style={{ fontFamily: font.body, fontSize: 16, color: "#1B2328" }}>Where are you going?</Text></View>
          <TextInput placeholder="Where are you going?" defaultValue="the library" placeholderTextColor="#6B7980" style={{ height: 50, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
        </View>
        <View style={{ flexDirection: "column", gap: 8 }}>
          <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Who's coming</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 4, backgroundColor: "#F3E1E3", borderRadius: 999, borderWidth: 2.0, borderColor: "#47698A", flexShrink: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 30, height: 30, backgroundColor: "#E8B9BE", borderRadius: 15, flexShrink: 1 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#8A3F5A" }}>A</Text>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328" }}>Ava</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 4, backgroundColor: "#F3E1E3", borderRadius: 999, borderWidth: 2.0, borderColor: "#47698A", flexShrink: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 30, height: 30, backgroundColor: "#2F6FD6", borderRadius: 15, flexShrink: 1 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#FFFFFF" }}>L</Text>
              </View>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328" }}>Leo</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 4, paddingTop: 4, paddingRight: 4, paddingBottom: 4, paddingLeft: 4, backgroundColor: "#E8ECF1", borderRadius: 12 }}>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <View style={{ height: 40, backgroundColor: "#FFFFFF", borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, justifyContent: "center" }}><Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328" }}>Walk</Text></View>
            <View style={{ height: 40, backgroundColor: "transparent", borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, justifyContent: "center" }}><Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960" }}>Car</Text></View>
            <View style={{ height: 40, backgroundColor: "transparent", borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0, justifyContent: "center" }}><Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960" }}>Transit</Text></View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, backgroundColor: "#47698A", borderRadius: 999 }}>{/* -> S4-ActiveShift.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Start trip</Text>
        </View>
        <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", textAlign: "center" }}>Jen is asked first, then gets an alert when you leave.</Text>
      </View>
    </View>
  );
}
